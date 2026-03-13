'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { OrgRole } from '@/stores/org-store'

export type UserOrg = {
  orgId: string
  orgName: string
  role: OrgRole
}

/**
 * Returns all orgs the current user belongs to, with their role in each.
 * Redirects to /login if the user is not authenticated.
 */
export const getUserOrgs = async (): Promise<UserOrg[]> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: memberships } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })

  if (!memberships || memberships.length === 0) return []

  const orgIds = memberships.map((m) => m.org_id)

  const { data: orgs } = await supabase.from('organizations').select('id, name').in('id', orgIds)

  if (!orgs) return []

  const orgMap = new Map(orgs.map((o) => [o.id, o.name]))

  return memberships
    .filter((m) => orgMap.has(m.org_id))
    .map((m) => ({
      orgId: m.org_id,
      orgName: orgMap.get(m.org_id) as string,
      role: m.role as OrgRole,
    }))
}
