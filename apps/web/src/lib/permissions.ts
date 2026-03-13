import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { hasPermission, type Permission, type OrgRole } from '@pips/shared'
import { ORG_COOKIE_NAME } from '@/lib/get-current-org'

/** Get current user's role in an org (system admins get 'owner' everywhere) */
export const getUserOrgRole = async (orgId: string): Promise<OrgRole | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // System admins get owner-level access to every org
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_system_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.is_system_admin) return 'owner'

  const { data } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle()

  return (data?.role as OrgRole) ?? null
}

/** Check if current user has permission — throws if not */
export const requirePermission = async (
  orgId: string,
  permission: Permission,
): Promise<OrgRole> => {
  const role = await getUserOrgRole(orgId)
  if (!role) throw new Error('Not a member of this organization')
  if (!hasPermission(role, permission)) {
    throw new Error(`Insufficient permissions: requires ${permission}`)
  }
  return role
}

/** Get current user's org membership (org + role), respecting the active org cookie */
export const getUserOrg = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Check if a specific org is selected via cookie
  const cookieStore = await cookies()
  const cookieOrgId = cookieStore.get(ORG_COOKIE_NAME)?.value ?? null

  if (cookieOrgId) {
    const { data: cookieMembership } = await supabase
      .from('org_members')
      .select('org_id, role, organizations(id, name, slug)')
      .eq('user_id', user.id)
      .eq('org_id', cookieOrgId)
      .maybeSingle()

    if (cookieMembership) return cookieMembership
  }

  // Fallback: first org by joined_at
  const { data } = await supabase
    .from('org_members')
    .select('org_id, role, organizations(id, name, slug)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  return data
}
