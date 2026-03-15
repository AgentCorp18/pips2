'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createOrgSchema } from '@/lib/validations'
import { trackServerEvent } from '@/lib/analytics'

export type OnboardingActionState = {
  error?: string
  fieldErrors?: Record<string, string>
}

export const checkSlugAvailability = async (
  slug: string,
): Promise<{ available: boolean; error?: string }> => {
  // Require authenticated user — prevents unauthenticated slug enumeration
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { available: false, error: 'Unauthorized' }
  }

  // Validate slug format before hitting the DB
  const parsed = createOrgSchema.shape.slug.safeParse(slug)
  if (!parsed.success) {
    return { available: false, error: parsed.error.issues[0]?.message ?? 'Invalid slug' }
  }

  // Use admin client to check ALL orgs, not just those visible via RLS
  const admin = createAdminClient()
  const { data } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', parsed.data)
    .maybeSingle()

  return { available: !data }
}

export const createOrganization = async (
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> => {
  const raw = {
    name: formData.get('name'),
    slug: formData.get('slug'),
  }

  const result = createOrgSchema.safeParse(raw)
  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string') {
        fieldErrors[field] = issue.message
      }
    }
    return { fieldErrors }
  }

  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to create an organization' }
  }

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch (err) {
    console.error('Admin client creation failed:', err)
    return { error: 'Server configuration error. Please contact support.' }
  }

  try {
    // Check slug uniqueness (admin client bypasses RLS for accurate check)
    const { data: existing } = await admin
      .from('organizations')
      .select('id')
      .eq('slug', result.data.slug)
      .maybeSingle()

    if (existing) {
      return { fieldErrors: { slug: 'This slug is already taken' } }
    }

    // Use admin client for the multi-table org creation.
    // RLS policies create a chicken-and-egg problem: the org_members INSERT
    // policy needs membership to exist, but we're creating the first member.
    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({ name: result.data.name, slug: result.data.slug, created_by: user.id })
      .select('id')
      .single()

    if (orgError || !org) {
      console.error('Org creation error:', orgError?.message)
      return { error: 'Failed to create organization. Please try again.' }
    }

    // Create org_member with 'owner' role
    const { error: memberError } = await admin
      .from('org_members')
      .insert({ org_id: org.id, user_id: user.id, role: 'owner' })

    if (memberError) {
      console.error('Member creation error:', memberError.message)
      await admin.from('organizations').delete().eq('id', org.id)
      return { error: 'Failed to set up organization membership. Please try again.' }
    }

    // Create org_settings with defaults
    const { error: settingsError } = await admin.from('org_settings').insert({ org_id: org.id })

    if (settingsError) {
      // Non-critical — defaults will be used
      console.error('Failed to create org_settings:', settingsError.message)
    }

    // Create a default "General" org-wide channel
    const { data: generalChannel, error: channelError } = await admin
      .from('chat_channels')
      .insert({
        org_id: org.id,
        type: 'org',
        name: 'General',
        created_by: user.id,
      })
      .select('id')
      .single()

    if (channelError || !generalChannel) {
      // Non-critical — channel can be created later from the chat UI
      console.error('Failed to create General channel:', channelError?.message)
    } else {
      // Add the org owner as the first member of the General channel
      const { error: channelMemberError } = await admin.from('chat_channel_members').insert({
        channel_id: generalChannel.id,
        user_id: user.id,
      })

      if (channelMemberError) {
        console.error('Failed to add owner to General channel:', channelMemberError.message)
      }
    }
  } catch (err) {
    console.error('Unexpected error during org creation:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }

  trackServerEvent('org.created')

  redirect('/dashboard')
}
