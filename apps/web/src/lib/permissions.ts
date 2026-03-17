import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { hasPermission, type Permission, type OrgRole } from '@pips/shared'
import { ORG_COOKIE_NAME } from '@/lib/get-current-org'

/**
 * Optional context supplied by callers that have already bootstrapped auth.
 * When provided, `requirePermission` skips its internal `createClient()` +
 * `getUser()` calls — eliminating 2-3 redundant DB round-trips per request.
 */
export type PermissionContext = {
  supabase: SupabaseClient
  userId: string
}

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

/**
 * Check if a role has a specific permission in an org,
 * respecting per-org overrides stored in org_permission_overrides.
 */
export const hasOrgPermission = async (
  orgId: string,
  role: OrgRole,
  permission: Permission,
): Promise<boolean> => {
  // Owner always has everything — no overrides apply
  if (role === 'owner') return true

  // Check for org-specific override
  const supabase = await createClient()
  const { data: override } = await supabase
    .from('org_permission_overrides')
    .select('allowed')
    .eq('org_id', orgId)
    .eq('role', role)
    .eq('permission', permission)
    .maybeSingle()

  if (override !== null) return override.allowed as boolean

  // Fall back to default permission matrix
  return hasPermission(role, permission)
}

/** Check if current user has permission — throws if not */
export const requirePermission = async (
  orgId: string,
  permission: Permission,
  context?: PermissionContext,
): Promise<OrgRole> => {
  let role: OrgRole | null

  if (context) {
    // Fast path: caller already has the authenticated user — skip createClient() + getUser()
    const { supabase, userId } = context

    // System admins get owner-level access to every org
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_system_admin')
      .eq('id', userId)
      .maybeSingle()

    if (profile?.is_system_admin) {
      role = 'owner'
    } else {
      const { data } = await supabase
        .from('org_members')
        .select('role')
        .eq('org_id', orgId)
        .eq('user_id', userId)
        .maybeSingle()

      role = (data?.role as OrgRole) ?? null
    }
  } else {
    // Slow path: no context provided — fall back to original behavior
    role = await getUserOrgRole(orgId)
  }

  if (!role) throw new Error('Not a member of this organization')

  const allowed = await hasOrgPermission(orgId, role, permission)
  if (!allowed) {
    throw new Error(`Insufficient permissions: requires ${permission}`)
  }
  return role
}

/** Check if current user is a system admin. Returns user ID or throws. */
export const requireSystemAdmin = async (): Promise<{
  userId: string
  supabase: SupabaseClient
}> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_system_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.is_system_admin) throw new Error('System admin access required')

  return { userId: user.id, supabase }
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
