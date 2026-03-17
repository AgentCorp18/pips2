'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { PIPS_STEPS } from '@pips/shared'

/* ============================================================
   Types
   ============================================================ */

export type DashboardStats = {
  totalProjects: number
  activeProjects: number
  openTickets: number
  overdueTickets: number
  completedThisMonth: number
  teamMembers: number
}

export type StepDistribution = {
  step: string
  name: string
  count: number
  color: string
}

export type ActivityItem = {
  id: string
  action: string
  entityType: string
  entityId: string
  description: string
  createdAt: string
  userName: string | null
}

/* ============================================================
   getDashboardStats
   ============================================================ */

export const getDashboardStats = async (orgId: string): Promise<DashboardStats> => {
  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return {
      totalProjects: 0,
      activeProjects: 0,
      openTickets: 0,
      overdueTickets: 0,
      completedThisMonth: 0,
      teamMembers: 0,
    }
  }
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const today = now.toISOString().split('T')[0]

  const [totalProjectsRes, projectsRes, openTicketsRes, overdueRes, completedRes, membersRes] =
    await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('org_id', orgId),

      supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('status', ['active', 'draft']),

      supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('status', ['backlog', 'todo', 'in_progress', 'in_review', 'blocked']),

      supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('status', ['backlog', 'todo', 'in_progress', 'in_review', 'blocked'])
        .lt('due_date', today),

      supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'done')
        .gte('resolved_at', startOfMonth),

      supabase.from('org_members').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
    ])

  return {
    totalProjects: totalProjectsRes.count ?? 0,
    activeProjects: projectsRes.count ?? 0,
    openTickets: openTicketsRes.count ?? 0,
    overdueTickets: overdueRes.count ?? 0,
    completedThisMonth: completedRes.count ?? 0,
    teamMembers: membersRes.count ?? 0,
  }
}

/* ============================================================
   getProjectsByStep
   ============================================================ */

const STEP_ENUM_TO_INDEX: Record<string, number> = {
  identify: 0,
  analyze: 1,
  generate: 2,
  select_plan: 3,
  implement: 4,
  evaluate: 5,
}

export const getProjectsByStep = async (orgId: string): Promise<StepDistribution[]> => {
  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return []
  }
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('current_step')
    .eq('org_id', orgId)
    .in('status', ['active', 'draft'])

  // Initialize counts
  const counts = PIPS_STEPS.map((step) => ({
    step: step.name.toLowerCase().replace(/ & /g, '_'),
    name: step.name,
    count: 0,
    color: step.color,
  }))

  // Tally
  if (projects) {
    for (const p of projects) {
      const idx = STEP_ENUM_TO_INDEX[p.current_step]
      if (idx !== undefined && counts[idx]) {
        counts[idx].count += 1
      }
    }
  }

  return counts
}

/* ============================================================
   getAgingTickets
   ============================================================ */

export type AgingTicketRow = {
  id: string
  sequenceId: string
  title: string
  assigneeName: string | null
  daysOpen: number
}

export const getAgingTickets = async (orgId: string, limit = 10): Promise<AgingTicketRow[]> => {
  const supabase = await createClient()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data } = await supabase
    .from('tickets')
    .select(
      `
      id, title, sequence_number, started_at,
      assignee:profiles!tickets_assignee_id_fkey ( display_name, full_name )
    `,
    )
    .eq('org_id', orgId)
    .in('status', ['in_progress', 'in_review', 'blocked'])
    .not('started_at', 'is', null)
    .lt('started_at', sevenDaysAgo.toISOString())
    .order('started_at', { ascending: true })
    .limit(limit)

  if (!data) return []

  // Get org prefix for sequence IDs
  const { data: orgRow } = await supabase
    .from('organizations')
    .select('ticket_prefix')
    .eq('id', orgId)
    .single()

  const prefix = (orgRow?.ticket_prefix as string) ?? 'TKT'

  return data.map((t) => {
    const assignee = t.assignee as unknown as {
      display_name: string | null
      full_name: string | null
    } | null
    const daysOpen = (Date.now() - new Date(t.started_at!).getTime()) / (1000 * 60 * 60 * 24)
    return {
      id: t.id,
      sequenceId: `${prefix}-${t.sequence_number}`,
      title: t.title as string,
      assigneeName: assignee?.display_name ?? assignee?.full_name ?? null,
      daysOpen: Math.round(daysOpen * 10) / 10,
    }
  })
}

/* ============================================================
   getRecentActivity
   ============================================================ */

export const getRecentActivity = async (orgId: string, limit = 10): Promise<ActivityItem[]> => {
  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return []
  }
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('audit_log')
    .select('id, action, entity_type, entity_id, new_data, user_id, created_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!logs || logs.length === 0) {
    return []
  }

  // Gather unique user IDs for display names
  const userIds = [...new Set(logs.map((l) => l.user_id).filter(Boolean))] as string[]
  const userMap = new Map<string, string>()

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, display_name')
      .in('id', userIds)

    if (profiles) {
      for (const p of profiles) {
        userMap.set(p.id, p.display_name || p.full_name || 'Unknown')
      }
    }
  }

  return logs.map((log) => {
    const userName = log.user_id ? (userMap.get(log.user_id) ?? 'Unknown') : 'System'
    const newData = log.new_data as Record<string, unknown> | null

    // Extract a human-readable label for the entity
    const entityLabel =
      (newData?.title as string) ??
      (newData?.name as string) ??
      (newData?.body as string)?.slice(0, 60) ??
      null

    // Friendly entity type names
    const ENTITY_NAMES: Record<string, string> = {
      tickets: 'ticket',
      projects: 'project',
      comments: 'comment',
      chat_messages: 'message',
      chat_channels: 'channel',
      organizations: 'organization',
      initiatives: 'initiative',
    }
    const entityName = ENTITY_NAMES[log.entity_type] ?? log.entity_type

    const ACTION_VERBS: Record<string, string> = {
      insert: 'created',
      update: 'updated',
      delete: 'deleted',
    }
    const verb = ACTION_VERBS[log.action]

    let description: string
    if (verb) {
      description = entityLabel
        ? `${userName} ${verb} ${entityName} "${entityLabel}"`
        : `${userName} ${verb} a ${entityName}`
    } else {
      description = `${userName} performed ${log.action} on ${entityName}`
    }

    return {
      id: log.id,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      description,
      createdAt: log.created_at,
      userName,
    }
  })
}
