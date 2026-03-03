'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createOrgSchema } from '@/lib/validations'

export type OnboardingActionState = {
  error?: string
  fieldErrors?: Record<string, string>
}

export const checkSlugAvailability = async (slug: string): Promise<{ available: boolean }> => {
  const supabase = await createClient()
  const { data } = await supabase.from('organizations').select('id').eq('slug', slug).maybeSingle()

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

  // Check slug uniqueness
  const { available } = await checkSlugAvailability(result.data.slug)
  if (!available) {
    return { fieldErrors: { slug: 'This slug is already taken' } }
  }

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: result.data.name, slug: result.data.slug, created_by: user.id })
    .select('id')
    .single()

  if (orgError || !org) {
    return { error: 'Failed to create organization. Please try again.' }
  }

  // Create org_member with 'owner' role
  const { error: memberError } = await supabase
    .from('org_members')
    .insert({ org_id: org.id, user_id: user.id, role: 'owner' })

  if (memberError) {
    // Clean up the org if member creation fails
    await supabase.from('organizations').delete().eq('id', org.id)
    return { error: 'Failed to set up organization membership. Please try again.' }
  }

  // Create org_settings with defaults
  const { error: settingsError } = await supabase.from('org_settings').insert({ org_id: org.id })

  if (settingsError) {
    // Non-critical — defaults will be used
    console.error('Failed to create org_settings:', settingsError.message)
  }

  redirect('/dashboard')
}
