import { createClient } from '@/lib/supabase/server'
import { hasPermission, type Permission, type OrgRole } from '@pips/shared'

/** Get current user's role in an org */
export const getUserOrgRole = async (orgId: string): Promise<OrgRole | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

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

/** Get current user's org membership (org + role) */
export const getUserOrg = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('org_members')
    .select('org_id, role, organizations(id, name, slug)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  return data
}
