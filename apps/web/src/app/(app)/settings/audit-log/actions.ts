'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/permissions'
import type { OrgRole } from '@pips/shared'

export type AuditLogEntry = {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user_display_name: string | null
}

export type AuditLogResult = {
  entries: AuditLogEntry[]
  total: number
  page: number
  limit: number
  error?: string
}

const ALLOWED_ROLES: OrgRole[] = ['owner', 'admin']

export const getAuditLog = async (
  page: number = 1,
  limit: number = 25,
): Promise<AuditLogResult> => {
  const membership = await getUserOrg()

  if (!membership) {
    return { entries: [], total: 0, page, limit, error: 'Not authenticated' }
  }

  const role = membership.role as OrgRole

  if (!ALLOWED_ROLES.includes(role)) {
    return { entries: [], total: 0, page, limit, error: 'Insufficient permissions' }
  }

  const orgId = membership.org_id as string
  const supabase = await createClient()

  // Get total count for pagination
  const { count } = await supabase
    .from('audit_log')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)

  const total = count ?? 0
  const offset = (page - 1) * limit

  // Fetch audit log entries (no FK join — audit records survive user deletion)
  const { data: entries, error } = await supabase
    .from('audit_log')
    .select(
      'id, user_id, action, entity_type, entity_id, old_data, new_data, ip_address, user_agent, created_at',
    )
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Failed to fetch audit log:', error.message)
    return { entries: [], total: 0, page, limit, error: 'Failed to fetch audit log' }
  }

  // Fetch display names for users
  const userIds = [...new Set((entries ?? []).map((e) => e.user_id).filter(Boolean))] as string[]
  const profileMap = new Map<string, string>()

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds)

    for (const p of profiles ?? []) {
      if (p.full_name) {
        profileMap.set(p.id, p.full_name)
      }
    }
  }

  const mapped: AuditLogEntry[] = (entries ?? []).map((entry) => ({
    id: entry.id as string,
    user_id: entry.user_id as string | null,
    action: entry.action as string,
    entity_type: entry.entity_type as string,
    entity_id: entry.entity_id as string | null,
    old_data: entry.old_data as Record<string, unknown> | null,
    new_data: entry.new_data as Record<string, unknown> | null,
    ip_address: entry.ip_address as string | null,
    user_agent: entry.user_agent as string | null,
    created_at: entry.created_at as string,
    user_display_name: entry.user_id ? (profileMap.get(entry.user_id as string) ?? null) : null,
  }))

  return { entries: mapped, total, page, limit }
}
