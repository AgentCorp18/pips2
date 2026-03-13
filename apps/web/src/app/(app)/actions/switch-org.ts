'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ORG_COOKIE_NAME } from '@/lib/get-current-org'

/**
 * Server action to switch the active organization.
 * Validates that the current user is a member of the target org,
 * sets the org cookie, and revalidates the app layout.
 */
export const switchOrg = async (orgId: string): Promise<{ success: boolean; error?: string }> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Validate that the user is a member of the target org
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .eq('org_id', orgId)
    .maybeSingle()

  if (!membership) {
    return { success: false, error: 'Not a member of this organization' }
  }

  // Set the cookie with 30-day expiry
  const cookieStore = await cookies()
  cookieStore.set(ORG_COOKIE_NAME, orgId, {
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    sameSite: 'lax',
    httpOnly: false, // client needs to read this for optimistic updates
  })

  // Revalidate the entire app layout so server components re-fetch with the new org
  revalidatePath('/(app)', 'layout')

  return { success: true }
}
