'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSystemAdmin } from '@/lib/permissions'
import type { OrgRole } from '@pips/shared'

/* ============================================================
   Types
   ============================================================ */

export type PlatformStats = {
  totalUsers: number
  activeUsers: number
  deactivatedUsers: number
  systemAdmins: number
  totalOrgs: number
  totalProjects: number
  totalTickets: number
  totalForms: number
}

export type PlatformUser = {
  id: string
  email: string
  full_name: string | null
  is_system_admin: boolean
  deactivated_at: string | null
  created_at: string
  orgs: { org_id: string; org_name: string; role: string }[]
}

export type PlatformOrg = {
  id: string
  name: string
  slug: string
  plan: string
  created_at: string
  member_count: number
  project_count: number
  owner_name: string | null
}

export type AdminLogEntry = {
  id: string
  admin_id: string
  admin_email: string
  action: string
  target_user_id: string | null
  target_user_email: string | null
  target_org_id: string | null
  target_org_name: string | null
  details: Record<string, unknown>
  created_at: string
}

export type AdminActionResult = {
  success: boolean
  error?: string
}

/* ============================================================
   Zod Schemas
   ============================================================ */

const uuidSchema = z.string().uuid()

const orgRoleSchema = z.enum(['owner', 'admin', 'manager', 'member', 'viewer'])

const addUserToOrgSchema = z.object({
  userId: uuidSchema,
  orgId: uuidSchema,
  role: orgRoleSchema,
})

const removeUserFromOrgSchema = z.object({
  userId: uuidSchema,
  orgId: uuidSchema,
})

const changeUserOrgRoleSchema = z.object({
  userId: uuidSchema,
  orgId: uuidSchema,
  newRole: orgRoleSchema,
})

const targetUserSchema = z.object({
  targetUserId: uuidSchema,
})

/* ============================================================
   Private Helper: Log Admin Action
   ============================================================ */

const logAdminAction = async (
  adminClient: ReturnType<typeof createAdminClient>,
  adminId: string,
  action: string,
  targetUserId?: string,
  targetOrgId?: string,
  details?: Record<string, unknown>,
) => {
  await adminClient.from('system_admin_log').insert({
    admin_id: adminId,
    action,
    target_user_id: targetUserId ?? null,
    target_org_id: targetOrgId ?? null,
    details: details ?? {},
  })
}

/* ============================================================
   isSystemAdmin — lightweight check for UI (sidebar nav)
   ============================================================ */

export const isSystemAdmin = async (): Promise<boolean> => {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false
    const { data } = await supabase
      .from('profiles')
      .select('is_system_admin')
      .eq('id', user.id)
      .maybeSingle()
    return data?.is_system_admin ?? false
  } catch {
    return false
  }
}

/* ============================================================
   getAdminDashboardStats
   ============================================================ */

export const getAdminDashboardStats = async (): Promise<PlatformStats> => {
  const { userId } = await requireSystemAdmin()
  const adminClient = createAdminClient()

  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: deactivatedUsers },
    { count: systemAdmins },
    { count: totalOrgs },
    { count: totalProjects },
    { count: totalTickets },
    { count: totalForms },
  ] = await Promise.all([
    adminClient.from('profiles').select('id', { count: 'exact', head: true }),
    adminClient
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .is('deactivated_at', null),
    adminClient
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .not('deactivated_at', 'is', null),
    adminClient
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_system_admin', true),
    adminClient.from('organizations').select('id', { count: 'exact', head: true }),
    adminClient.from('projects').select('id', { count: 'exact', head: true }),
    adminClient.from('tickets').select('id', { count: 'exact', head: true }),
    adminClient.from('project_forms').select('id', { count: 'exact', head: true }),
  ])

  // Suppress unused variable warning — userId used to satisfy requireSystemAdmin contract
  void userId

  return {
    totalUsers: totalUsers ?? 0,
    activeUsers: activeUsers ?? 0,
    deactivatedUsers: deactivatedUsers ?? 0,
    systemAdmins: systemAdmins ?? 0,
    totalOrgs: totalOrgs ?? 0,
    totalProjects: totalProjects ?? 0,
    totalTickets: totalTickets ?? 0,
    totalForms: totalForms ?? 0,
  }
}

/* ============================================================
   listAllUsers
   ============================================================ */

export const listAllUsers = async (search?: string): Promise<PlatformUser[]> => {
  await requireSystemAdmin()
  const adminClient = createAdminClient()

  let query = adminClient
    .from('profiles')
    .select('id, email, full_name, is_system_admin, deactivated_at, created_at')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  }

  const { data: profiles, error } = await query

  if (error || !profiles) return []

  // Fetch org memberships for all users
  const userIds = profiles.map((p) => p.id)
  const { data: memberships } = await adminClient
    .from('org_members')
    .select('user_id, org_id, role, organizations(id, name)')
    .in('user_id', userIds)

  // Build org membership map
  const orgsByUser = new Map<string, { org_id: string; org_name: string; role: string }[]>()
  for (const m of memberships ?? []) {
    const existing = orgsByUser.get(m.user_id) ?? []
    const orgData = m.organizations as unknown as { id: string; name: string } | null
    existing.push({
      org_id: m.org_id,
      org_name: orgData?.name ?? '',
      role: m.role as string,
    })
    orgsByUser.set(m.user_id, existing)
  }

  return profiles.map((p) => ({
    id: p.id as string,
    email: p.email as string,
    full_name: p.full_name as string | null,
    is_system_admin: (p.is_system_admin as boolean) ?? false,
    deactivated_at: p.deactivated_at as string | null,
    created_at: p.created_at as string,
    orgs: orgsByUser.get(p.id as string) ?? [],
  }))
}

/* ============================================================
   listAllOrgs
   ============================================================ */

export const listAllOrgs = async (): Promise<PlatformOrg[]> => {
  await requireSystemAdmin()
  const adminClient = createAdminClient()

  const { data: orgs, error } = await adminClient
    .from('organizations')
    .select('id, name, slug, plan, created_at')
    .order('created_at', { ascending: false })

  if (error || !orgs) return []

  const orgIds = orgs.map((o) => o.id)

  // Fetch member counts
  const { data: memberCounts } = await adminClient
    .from('org_members')
    .select('org_id')
    .in('org_id', orgIds)

  // Fetch project counts
  const { data: projectCounts } = await adminClient
    .from('projects')
    .select('org_id')
    .in('org_id', orgIds)

  // Fetch owner names
  const { data: owners } = await adminClient
    .from('org_members')
    .select('org_id, profiles(full_name)')
    .in('org_id', orgIds)
    .eq('role', 'owner')

  const memberCountMap = new Map<string, number>()
  for (const m of memberCounts ?? []) {
    memberCountMap.set(m.org_id, (memberCountMap.get(m.org_id) ?? 0) + 1)
  }

  const projectCountMap = new Map<string, number>()
  for (const p of projectCounts ?? []) {
    projectCountMap.set(p.org_id, (projectCountMap.get(p.org_id) ?? 0) + 1)
  }

  const ownerMap = new Map<string, string | null>()
  for (const o of owners ?? []) {
    const profile = o.profiles as unknown as { full_name: string | null } | null
    if (!ownerMap.has(o.org_id)) {
      ownerMap.set(o.org_id, profile?.full_name ?? null)
    }
  }

  return orgs.map((org) => ({
    id: org.id as string,
    name: org.name as string,
    slug: org.slug as string,
    plan: (org.plan as string) ?? 'free',
    created_at: org.created_at as string,
    member_count: memberCountMap.get(org.id as string) ?? 0,
    project_count: projectCountMap.get(org.id as string) ?? 0,
    owner_name: ownerMap.get(org.id as string) ?? null,
  }))
}

/* ============================================================
   addUserToOrg
   ============================================================ */

export const addUserToOrg = async (
  userId: string,
  orgId: string,
  role: OrgRole,
): Promise<AdminActionResult> => {
  const { userId: adminId } = await requireSystemAdmin()

  const parsed = addUserToOrgSchema.safeParse({ userId, orgId, role })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient.from('org_members').insert({
    user_id: parsed.data.userId,
    org_id: parsed.data.orgId,
    role: parsed.data.role,
    joined_at: new Date().toISOString(),
  })

  if (error) {
    return { success: false, error: error.message }
  }

  await logAdminAction(adminClient, adminId, 'add_to_org', parsed.data.userId, parsed.data.orgId, {
    role: parsed.data.role,
  })

  return { success: true }
}

/* ============================================================
   removeUserFromOrg
   ============================================================ */

export const removeUserFromOrg = async (
  userId: string,
  orgId: string,
): Promise<AdminActionResult> => {
  const { userId: adminId } = await requireSystemAdmin()

  const parsed = removeUserFromOrgSchema.safeParse({ userId, orgId })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const adminClient = createAdminClient()

  // Prevent removing the last owner
  const { data: owners } = await adminClient
    .from('org_members')
    .select('user_id')
    .eq('org_id', parsed.data.orgId)
    .eq('role', 'owner')

  if (owners && owners.length === 1 && owners[0]?.user_id === parsed.data.userId) {
    return { success: false, error: 'Cannot remove the last owner from an organization' }
  }

  const { error } = await adminClient
    .from('org_members')
    .delete()
    .eq('user_id', parsed.data.userId)
    .eq('org_id', parsed.data.orgId)

  if (error) {
    return { success: false, error: error.message }
  }

  await logAdminAction(
    adminClient,
    adminId,
    'remove_from_org',
    parsed.data.userId,
    parsed.data.orgId,
  )

  return { success: true }
}

/* ============================================================
   changeUserOrgRole
   ============================================================ */

export const changeUserOrgRole = async (
  userId: string,
  orgId: string,
  newRole: OrgRole,
): Promise<AdminActionResult> => {
  const { userId: adminId } = await requireSystemAdmin()

  const parsed = changeUserOrgRoleSchema.safeParse({ userId, orgId, newRole })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('org_members')
    .update({ role: parsed.data.newRole })
    .eq('user_id', parsed.data.userId)
    .eq('org_id', parsed.data.orgId)

  if (error) {
    return { success: false, error: error.message }
  }

  await logAdminAction(
    adminClient,
    adminId,
    'change_org_role',
    parsed.data.userId,
    parsed.data.orgId,
    { new_role: parsed.data.newRole },
  )

  return { success: true }
}

/* ============================================================
   toggleSystemAdmin
   ============================================================ */

export const toggleSystemAdmin = async (targetUserId: string): Promise<AdminActionResult> => {
  const { userId: adminId } = await requireSystemAdmin()

  const parsed = targetUserSchema.safeParse({ targetUserId })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  if (parsed.data.targetUserId === adminId) {
    return { success: false, error: 'Cannot change your own system admin status' }
  }

  const adminClient = createAdminClient()

  // Fetch current state
  const { data: profile, error: fetchError } = await adminClient
    .from('profiles')
    .select('is_system_admin')
    .eq('id', parsed.data.targetUserId)
    .maybeSingle()

  if (fetchError || !profile) {
    return { success: false, error: 'User not found' }
  }

  const newValue = !(profile.is_system_admin as boolean)

  const { error } = await adminClient
    .from('profiles')
    .update({ is_system_admin: newValue })
    .eq('id', parsed.data.targetUserId)

  if (error) {
    return { success: false, error: error.message }
  }

  await logAdminAction(
    adminClient,
    adminId,
    'toggle_system_admin',
    parsed.data.targetUserId,
    undefined,
    {
      new_value: newValue,
    },
  )

  return { success: true }
}

/* ============================================================
   deactivateUser
   ============================================================ */

export const deactivateUser = async (targetUserId: string): Promise<AdminActionResult> => {
  const { userId: adminId } = await requireSystemAdmin()

  const parsed = targetUserSchema.safeParse({ targetUserId })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  if (parsed.data.targetUserId === adminId) {
    return { success: false, error: 'Cannot deactivate your own account' }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('profiles')
    .update({ deactivated_at: new Date().toISOString() })
    .eq('id', parsed.data.targetUserId)

  if (error) {
    return { success: false, error: error.message }
  }

  await logAdminAction(adminClient, adminId, 'deactivate_user', parsed.data.targetUserId)

  return { success: true }
}

/* ============================================================
   reactivateUser
   ============================================================ */

export const reactivateUser = async (targetUserId: string): Promise<AdminActionResult> => {
  const { userId: adminId } = await requireSystemAdmin()

  const parsed = targetUserSchema.safeParse({ targetUserId })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('profiles')
    .update({ deactivated_at: null })
    .eq('id', parsed.data.targetUserId)

  if (error) {
    return { success: false, error: error.message }
  }

  await logAdminAction(adminClient, adminId, 'reactivate_user', parsed.data.targetUserId)

  return { success: true }
}

/* ============================================================
   getAdminAuditLog
   ============================================================ */

const PAGE_SIZE = 25

export const getAdminAuditLog = async (
  page: number = 1,
  filters?: { action?: string; userId?: string; orgId?: string },
): Promise<{ entries: AdminLogEntry[]; total: number }> => {
  await requireSystemAdmin()
  const adminClient = createAdminClient()

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = adminClient
    .from('system_admin_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters?.action) {
    query = query.eq('action', filters.action)
  }
  if (filters?.userId) {
    query = query.eq('admin_id', filters.userId)
  }
  if (filters?.orgId) {
    query = query.eq('target_org_id', filters.orgId)
  }

  const { data: rows, count, error } = await query

  if (error || !rows) return { entries: [], total: 0 }

  // Collect all unique user IDs to batch-fetch emails
  const adminIds = [...new Set(rows.map((r) => r.admin_id as string))]
  const targetUserIds = [
    ...new Set(rows.map((r) => r.target_user_id as string | null).filter(Boolean)),
  ] as string[]
  const allUserIds = [...new Set([...adminIds, ...targetUserIds])]

  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, email')
    .in('id', allUserIds)

  // Collect all unique org IDs to batch-fetch names
  const orgIds = [
    ...new Set(rows.map((r) => r.target_org_id as string | null).filter(Boolean)),
  ] as string[]

  const { data: orgs } =
    orgIds.length > 0
      ? await adminClient.from('organizations').select('id, name').in('id', orgIds)
      : { data: [] }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id as string, p.email as string]))
  const orgMap = new Map((orgs ?? []).map((o) => [o.id as string, o.name as string]))

  const entries: AdminLogEntry[] = rows.map((row) => ({
    id: row.id as string,
    admin_id: row.admin_id as string,
    admin_email: profileMap.get(row.admin_id as string) ?? '',
    action: row.action as string,
    target_user_id: (row.target_user_id as string | null) ?? null,
    target_user_email: row.target_user_id
      ? (profileMap.get(row.target_user_id as string) ?? null)
      : null,
    target_org_id: (row.target_org_id as string | null) ?? null,
    target_org_name: row.target_org_id ? (orgMap.get(row.target_org_id as string) ?? null) : null,
    details: (row.details as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
  }))

  return { entries, total: count ?? 0 }
}
