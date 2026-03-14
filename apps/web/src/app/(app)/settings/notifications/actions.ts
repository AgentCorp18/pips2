'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'

/* ============================================================
   Types
   ============================================================ */

export type NotificationPreferences = {
  id: string
  user_id: string
  org_id: string
  ticket_assigned: boolean
  mention: boolean
  project_updated: boolean
  ticket_updated: boolean
  ticket_commented: boolean
  email_enabled: boolean
  created_at: string
  updated_at: string
}

export type NotificationPreferencesActionResult = {
  error?: string
  preferences?: NotificationPreferences
}

/* ============================================================
   getNotificationPreferences
   Fetches the current user's notification preferences for their
   active org. Creates a default row if none exists (upsert).
   ============================================================ */

export const getNotificationPreferences =
  async (): Promise<NotificationPreferencesActionResult> => {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'You must be signed in' }
    }

    // Get user's active org (respects org switcher cookie)
    const currentOrg = await getCurrentOrg(supabase, user.id)

    if (!currentOrg) {
      return { error: 'You are not a member of any organization' }
    }

    const orgId = currentOrg.orgId

    // Try to fetch existing preferences
    const { data: existing } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .eq('org_id', orgId)
      .maybeSingle()

    if (existing) {
      return { preferences: existing as NotificationPreferences }
    }

    // Create default preferences via upsert
    const { data: created, error: insertError } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: user.id,
        org_id: orgId,
        ticket_assigned: true,
        mention: true,
        project_updated: true,
        ticket_updated: true,
        ticket_commented: true,
        email_enabled: true,
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Failed to create notification preferences:', insertError.message)
      return { error: 'Failed to create notification preferences' }
    }

    return { preferences: created as NotificationPreferences }
  }

/* ============================================================
   updateNotificationPreferences
   Updates a single preference field by key.
   ============================================================ */

export type PreferenceKey =
  | 'ticket_assigned'
  | 'mention'
  | 'project_updated'
  | 'ticket_updated'
  | 'ticket_commented'
  | 'email_enabled'

const ALLOWED_KEYS: ReadonlySet<string> = new Set<PreferenceKey>([
  'ticket_assigned',
  'mention',
  'project_updated',
  'ticket_updated',
  'ticket_commented',
  'email_enabled',
])

export const updateNotificationPreferences = async (
  preferencesId: string,
  key: PreferenceKey,
  value: boolean,
): Promise<NotificationPreferencesActionResult> => {
  if (!ALLOWED_KEYS.has(key)) {
    return { error: 'Invalid preference key' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .update({ [key]: value })
    .eq('id', preferencesId)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) {
    console.error('Failed to update notification preferences:', error.message)
    return { error: 'Failed to update preferences' }
  }

  return { preferences: data as NotificationPreferences }
}
