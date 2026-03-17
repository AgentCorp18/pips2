'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { updateOrgSettingsSchema } from '@/lib/validations'
import { hasPermission } from '@pips/shared'
import type { OrgRole } from '@pips/shared'

export type SettingsActionState = {
  error?: string
  success?: string
  fieldErrors?: Record<string, string>
}

export const getOrgWithSettings = async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's active org (respects org switcher cookie)
  const currentOrg = await getCurrentOrg(supabase, user.id)

  if (!currentOrg) return null

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url, plan')
    .eq('id', currentOrg.orgId)
    .single()

  if (!org) return null

  const { data: settings } = await supabase
    .from('org_settings')
    .select('*')
    .eq('org_id', org.id)
    .single()

  return {
    org,
    role: currentOrg.role as string,
    settings: settings ?? {
      timezone: 'America/Chicago',
      date_format: 'MM/dd/yyyy',
      week_start: 'monday',
      default_ticket_priority: 'medium',
      ticket_prefix: 'PIPS',
      notification_settings: { email_digest: 'daily', in_app: true },
      branding: {},
    },
  }
}

export const updateOrgSettings = async (
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> => {
  const raw = {
    name: formData.get('name'),
    timezone: formData.get('timezone'),
    date_format: formData.get('date_format'),
    week_start: formData.get('week_start'),
    default_ticket_priority: formData.get('default_ticket_priority'),
    ticket_prefix: formData.get('ticket_prefix'),
  }

  const result = updateOrgSettingsSchema.safeParse(raw)
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to update settings' }
  }

  // Get user's active org (respects org switcher cookie) — must be owner or admin
  const currentOrg = await getCurrentOrg(supabase, user.id)

  if (!currentOrg) {
    return { error: 'You are not a member of any organization' }
  }

  if (!hasPermission(currentOrg.role as OrgRole, 'org.members.manage')) {
    return { error: 'Only owners and admins can update organization settings' }
  }

  // Update organization name
  const { error: orgError } = await supabase
    .from('organizations')
    .update({ name: result.data.name, updated_at: new Date().toISOString() })
    .eq('id', currentOrg.orgId)

  if (orgError) {
    return { error: 'Failed to update organization name' }
  }

  // Upsert org_settings (trigger auto-creates row, but upsert handles edge cases)
  const { error: settingsError } = await supabase.from('org_settings').upsert(
    {
      org_id: currentOrg.orgId,
      timezone: result.data.timezone,
      date_format: result.data.date_format,
      week_start: result.data.week_start,
      default_ticket_priority: result.data.default_ticket_priority,
      ticket_prefix: result.data.ticket_prefix,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'org_id' },
  )

  if (settingsError) {
    return { error: 'Failed to update organization settings' }
  }

  revalidatePath('/settings')
  return { success: 'Settings updated successfully' }
}
