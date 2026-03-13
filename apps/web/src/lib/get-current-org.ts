import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { OrgRole } from '@/stores/org-store'

export const ORG_COOKIE_NAME = 'pips-org-id'

export type CurrentOrg = {
  orgId: string
  orgName: string
  role: OrgRole
}

/**
 * Resolves the active org for the current user.
 *
 * Priority order:
 * 1. `pips-org-id` cookie value, if the user is a member of that org
 * 2. First org by `joined_at` (ascending) — the original fallback
 *
 * Returns null when the user has no org memberships.
 */
export const getCurrentOrg = async (
  supabase: SupabaseClient,
  userId: string,
): Promise<CurrentOrg | null> => {
  const cookieStore = await cookies()
  const cookieOrgId = cookieStore.get(ORG_COOKIE_NAME)?.value ?? null

  // If there's a cookie value, verify the user is actually a member of that org
  if (cookieOrgId) {
    const { data: cookieMembership } = await supabase
      .from('org_members')
      .select('org_id, role')
      .eq('user_id', userId)
      .eq('org_id', cookieOrgId)
      .maybeSingle()

    if (cookieMembership) {
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', cookieMembership.org_id)
        .single()

      if (org) {
        return {
          orgId: cookieMembership.org_id,
          orgName: org.name,
          role: cookieMembership.role as OrgRole,
        }
      }
    }
  }

  // Fallback: first org by joined_at
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', userId)
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership) return null

  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', membership.org_id)
    .single()

  if (!org) return null

  return {
    orgId: membership.org_id,
    orgName: org.name,
    role: membership.role as OrgRole,
  }
}
