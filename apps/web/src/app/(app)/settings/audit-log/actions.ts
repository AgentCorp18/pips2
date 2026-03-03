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

  // Fetch audit log entries with user profile data via join
  const { data: entries, error } = await supabase
    .from('audit_log')
    .select(
      'id, user_id, action, entity_type, entity_id, old_data, new_data, ip_address, user_agent, created_at, profiles(full_name)',
    )
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return { entries: [], total: 0, page, limit, error: error.message }
  }

  const mapped: AuditLogEntry[] = (entries ?? []).map((entry) => {
    const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles

    return {
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
      user_display_name: (profile as { full_name: string } | null)?.full_name ?? null,
    }
  })

  return { entries: mapped, total, page, limit }
}
