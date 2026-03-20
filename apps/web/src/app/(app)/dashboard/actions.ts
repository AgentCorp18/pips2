'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { PIPS_STEPS, calculateMethodologyDepth } from '@pips/shared'

/* ============================================================
   Types
   ============================================================ */

export type DashboardStats = {
  totalProjects: number
  activeProjects: number
  openTickets: number
  overdueTickets: number
  blockedTickets: number
  completedThisMonth: number
  teamMembers: number
}

export type StatDelta = {
  current: number
  previousWeek: number
  delta: number
  direction: 'up' | 'down' | 'flat'
}

export type DashboardDeltas = {
  openTickets: StatDelta
  overdueTickets: StatDelta
  completedThisMonth: StatDelta
  activeProjects: StatDelta
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
      blockedTickets: 0,
      completedThisMonth: 0,
      teamMembers: 0,
    }
  }
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const today = now.toISOString().split('T')[0]

  // Consolidate: fetch project statuses in one query and count in-memory (replaces 2 queries).
  // Ticket queries still need separate round trips due to different column filters.
  const [projectsRes, openTicketsRes, overdueRes, completedRes, membersRes, blockedRes] =
    await Promise.all([
      supabase.from('projects').select('status').eq('org_id', orgId),

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

      supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'blocked'),
    ])

  // Count project stats in-memory from the single projects query
  const projectRows = projectsRes.data ?? []
  const totalProjects = projectRows.length
  const activeProjects = projectRows.filter(
    (p) => p.status === 'active' || p.status === 'draft',
  ).length

  return {
    totalProjects,
    activeProjects,
    openTickets: openTicketsRes.count ?? 0,
    overdueTickets: overdueRes.count ?? 0,
    blockedTickets: blockedRes.count ?? 0,
    completedThisMonth: completedRes.count ?? 0,
    teamMembers: membersRes.count ?? 0,
  }
}

/* ============================================================
   getDashboardDeltas — week-over-week stat deltas
   ============================================================ */

const buildDelta = (current: number, previousWeek: number): StatDelta => {
  const delta = current - previousWeek
  const direction: StatDelta['direction'] = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  return { current, previousWeek, delta, direction }
}

export const getDashboardDeltas = async (orgId: string): Promise<DashboardDeltas> => {
  const empty: DashboardDeltas = {
    openTickets: buildDelta(0, 0),
    overdueTickets: buildDelta(0, 0),
    completedThisMonth: buildDelta(0, 0),
    activeProjects: buildDelta(0, 0),
  }

  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return empty
  }

  const supabase = await createClient()

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString()

  const today = now.toISOString().split('T')[0]!
  const sevenDaysAgoDate = sevenDaysAgo.toISOString().split('T')[0]!

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    openNowRes,
    overdueNowRes,
    completedNowRes,
    projectsNowRes,
    openPrevRes,
    overduePrevRes,
    completedPrevRes,
    projectsPrevRes,
  ] = await Promise.all([
    // Current: open tickets
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('status', ['backlog', 'todo', 'in_progress', 'in_review', 'blocked']),

    // Current: overdue tickets
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('status', ['backlog', 'todo', 'in_progress', 'in_review', 'blocked'])
      .lt('due_date', today),

    // Current: completed this month
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'done')
      .gte('resolved_at', startOfMonth),

    // Current: active projects
    supabase.from('projects').select('status').eq('org_id', orgId),

    // Previous (7d ago): open tickets created before 7 days ago and not yet resolved
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('status', ['backlog', 'todo', 'in_progress', 'in_review', 'blocked'])
      .lt('created_at', sevenDaysAgoStr),

    // Previous (7d ago): overdue tickets — due before 7d ago date and open
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('status', ['backlog', 'todo', 'in_progress', 'in_review', 'blocked'])
      .lt('due_date', sevenDaysAgoDate),

    // Previous (7d ago): completed this month but resolved before 7d ago
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'done')
      .gte('resolved_at', startOfMonth)
      .lt('resolved_at', sevenDaysAgoStr),

    // Previous (7d ago): projects — created before 7d ago
    supabase
      .from('projects')
      .select('status, created_at')
      .eq('org_id', orgId)
      .lt('created_at', sevenDaysAgoStr),
  ])

  const activeProjectsNow = (projectsNowRes.data ?? []).filter(
    (p) => p.status === 'active' || p.status === 'draft',
  ).length

  const activeProjectsPrev = (projectsPrevRes.data ?? []).filter(
    (p) => p.status === 'active' || p.status === 'draft',
  ).length

  return {
    openTickets: buildDelta(openNowRes.count ?? 0, openPrevRes.count ?? 0),
    overdueTickets: buildDelta(overdueNowRes.count ?? 0, overduePrevRes.count ?? 0),
    completedThisMonth: buildDelta(completedNowRes.count ?? 0, completedPrevRes.count ?? 0),
    activeProjects: buildDelta(activeProjectsNow, activeProjectsPrev),
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
  status: 'in_progress' | 'in_review' | 'blocked'
}

export const getAgingTickets = async (orgId: string, limit = 10): Promise<AgingTicketRow[]> => {
  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return []
  }
  const supabase = await createClient()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [{ data }, { data: orgRow }] = await Promise.all([
    supabase
      .from('tickets')
      .select(
        `
      id, title, sequence_number, started_at, status,
      assignee:profiles!tickets_assignee_id_fkey ( display_name, full_name )
    `,
      )
      .eq('org_id', orgId)
      .in('status', ['in_progress', 'in_review', 'blocked'])
      .not('started_at', 'is', null)
      .lt('started_at', sevenDaysAgo.toISOString())
      .order('started_at', { ascending: true })
      .limit(limit),

    // Fetch org prefix for sequence IDs in parallel with ticket data
    supabase.from('org_settings').select('ticket_prefix').eq('org_id', orgId).single(),
  ])

  if (!data) return []

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
      status: t.status as AgingTicketRow['status'],
    }
  })
}

/* ============================================================
   getDashboardMetrics — completion rate, avg cycle time,
   ticket velocity for dashboard widget
   ============================================================ */

export type DashboardMetrics = {
  completionRate: number
  avgCycleTimeDays: number | null
  ticketsClosedThisWeek: number
  ticketsCreatedThisWeek: number
  formsCompletedCount: number
}

export const getDashboardMetrics = async (orgId: string): Promise<DashboardMetrics> => {
  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return {
      completionRate: 0,
      avgCycleTimeDays: null,
      ticketsClosedThisWeek: 0,
      ticketsCreatedThisWeek: 0,
      formsCompletedCount: 0,
    }
  }
  const supabase = await createClient()

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  // Consolidate: fetch project statuses + IDs in one query instead of two serial/parallel
  // project queries + a pre-fetch for project IDs (was 3 separate DB calls, now 1).
  const [projectsRes, completedTicketsRes, closedThisWeekRes, createdThisWeekRes] =
    await Promise.all([
      supabase
        .from('projects')
        .select('id, status')
        .eq('org_id', orgId)
        .in('status', ['active', 'draft', 'completed']),

      supabase
        .from('tickets')
        .select('started_at, resolved_at')
        .eq('org_id', orgId)
        .not('started_at', 'is', null)
        .not('resolved_at', 'is', null)
        .in('status', ['done', 'cancelled'])
        .gte('resolved_at', ninetyDaysAgo.toISOString()),

      supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'done')
        .gte('resolved_at', weekAgo.toISOString()),

      supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .gte('created_at', weekAgo.toISOString()),
    ])

  // Count project stats and collect IDs in-memory from the single projects query
  const projectRows = projectsRes.data ?? []
  const projectIds = projectRows.map((p) => p.id)
  const total = projectRows.length
  const completed = projectRows.filter((p) => p.status === 'completed').length

  // Fetch project_forms count scoped by project IDs (project_forms has no org_id column)
  const formsRes =
    projectIds.length > 0
      ? await supabase
          .from('project_forms')
          .select('id', { count: 'exact', head: true })
          .in('project_id', projectIds)
      : { count: 0, data: null, error: null }

  // Completion rate
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  // Average cycle time
  let avgCycleTimeDays: number | null = null
  if (completedTicketsRes.data && completedTicketsRes.data.length > 0) {
    const cycleTimes = completedTicketsRes.data
      .map((t) => {
        const start = new Date(t.started_at!).getTime()
        const end = new Date(t.resolved_at!).getTime()
        return (end - start) / (1000 * 60 * 60 * 24)
      })
      .filter((d) => d >= 0)

    if (cycleTimes.length > 0) {
      avgCycleTimeDays =
        Math.round((cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) * 10) / 10
    }
  }

  // Forms completed count (now resolved in parallel above)
  const formsCompletedCount = formsRes.count ?? 0

  return {
    completionRate,
    avgCycleTimeDays,
    ticketsClosedThisWeek: closedThisWeekRes.count ?? 0,
    ticketsCreatedThisWeek: createdThisWeekRes.count ?? 0,
    formsCompletedCount,
  }
}

/* ============================================================
   getOrgImpactSummary — Phase 0A ROI Visibility
   ============================================================ */

export type OrgImpactSummary = {
  projectsCompleted: number
  ticketsResolved: number
  formsCompleted: number
  avgMethodologyDepth: number | null // 0-100
  avgCycleTimeDays: number | null
  rootCausesIdentified: number // count of fishbone + five_why forms
  solutionsEvaluated: number // count of brainstorming + criteria_matrix forms
  lessonsDocumented: number // count of evaluation + lessons_learned + before_after forms
}

export const getOrgImpactSummary = async (orgId: string): Promise<OrgImpactSummary> => {
  const empty: OrgImpactSummary = {
    projectsCompleted: 0,
    ticketsResolved: 0,
    formsCompleted: 0,
    avgMethodologyDepth: null,
    avgCycleTimeDays: null,
    rootCausesIdentified: 0,
    solutionsEvaluated: 0,
    lessonsDocumented: 0,
  }

  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return empty
  }

  const supabase = await createClient()

  // Consolidate: fetch project IDs + status in one query instead of a serial pre-fetch
  // followed by a separate completed-count query (was 2 serial/parallel calls, now 1).
  const [projectsRes, resolvedTicketsRes, cycleTimeTicketsRes] = await Promise.all([
    supabase.from('projects').select('id, status').eq('org_id', orgId),

    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'done'),

    supabase
      .from('tickets')
      .select('created_at, resolved_at')
      .eq('org_id', orgId)
      .eq('status', 'done')
      .not('resolved_at', 'is', null),
  ])

  // Derive project IDs and completed count in-memory
  const projectRows = projectsRes.data ?? []
  const projectIds = projectRows.map((p) => p.id)
  const completedProjectsCount = projectRows.filter((p) => p.status === 'completed').length

  // Fetch all project_forms for this org's projects in one query (project_forms has no org_id)
  const formsRes =
    projectIds.length > 0
      ? await supabase
          .from('project_forms')
          .select('project_id, form_type')
          .in('project_id', projectIds)
      : { data: [] as Array<{ project_id: string; form_type: string }>, error: null }

  const forms = formsRes.data ?? []

  // Total forms completed
  const formsCompleted = forms.length

  // Root causes: fishbone + five_why forms
  const rootCausesIdentified = forms.filter(
    (f) => f.form_type === 'fishbone' || f.form_type === 'five_why',
  ).length

  // Solutions evaluated: brainstorming + criteria_matrix forms
  const solutionsEvaluated = forms.filter(
    (f) => f.form_type === 'brainstorming' || f.form_type === 'criteria_matrix',
  ).length

  // Lessons documented: evaluation + lessons_learned + before_after forms
  const lessonsDocumented = forms.filter(
    (f) =>
      f.form_type === 'evaluation' ||
      f.form_type === 'lessons_learned' ||
      f.form_type === 'before_after',
  ).length

  // Avg methodology depth — per project: count of distinct form_types / total possible, scaled 0-100
  let avgMethodologyDepth: number | null = null
  if (projectIds.length > 0 && forms.length > 0) {
    // Total possible form types across all steps (matches calculateMethodologyDepth totalCount)
    // Computed from STEP_CONTENT in @pips/shared — 25 form types total
    const TOTAL_FORM_TYPES = 25
    const formsByProject = new Map<string, Set<string>>()
    for (const f of forms) {
      const existing = formsByProject.get(f.project_id) ?? new Set<string>()
      existing.add(f.form_type)
      formsByProject.set(f.project_id, existing)
    }
    const depthScores: number[] = []
    for (const [, formTypes] of formsByProject) {
      depthScores.push(Math.round((formTypes.size / TOTAL_FORM_TYPES) * 100))
    }
    if (depthScores.length > 0) {
      avgMethodologyDepth = Math.round(depthScores.reduce((a, b) => a + b, 0) / depthScores.length)
    }
  }

  // Avg cycle time: (resolved_at - created_at) on done tickets
  let avgCycleTimeDays: number | null = null
  const cycleTickets = cycleTimeTicketsRes.data ?? []
  if (cycleTickets.length > 0) {
    const cycleTimes = cycleTickets
      .map((t) => {
        const start = new Date(t.created_at).getTime()
        const end = new Date(t.resolved_at!).getTime()
        return (end - start) / (1000 * 60 * 60 * 24)
      })
      .filter((d) => d >= 0)

    if (cycleTimes.length > 0) {
      avgCycleTimeDays =
        Math.round((cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) * 10) / 10
    }
  }

  return {
    projectsCompleted: completedProjectsCount,
    ticketsResolved: resolvedTicketsRes.count ?? 0,
    formsCompleted,
    avgMethodologyDepth,
    avgCycleTimeDays,
    rootCausesIdentified,
    solutionsEvaluated,
    lessonsDocumented,
  }
}

/* ============================================================
   getDashboardPersonalSummary
   ============================================================ */

export type PersonalSummary = {
  assignedTickets: number
  overdueTickets: number
  pendingNotifications: number
}

export const getDashboardPersonalSummary = async (
  userId: string,
  orgId: string,
): Promise<PersonalSummary> => {
  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return { assignedTickets: 0, overdueTickets: 0, pendingNotifications: 0 }
  }

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [assignedRes, overdueRes, notificationsRes] = await Promise.all([
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('assignee_id', userId)
      .not('status', 'in', '("done","cancelled")'),

    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('assignee_id', userId)
      .not('status', 'in', '("done","cancelled")')
      .lt('due_date', today),

    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null),
  ])

  return {
    assignedTickets: assignedRes.count ?? 0,
    overdueTickets: overdueRes.count ?? 0,
    pendingNotifications: notificationsRes.count ?? 0,
  }
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

/* ============================================================
   getComplianceAlerts
   Returns active projects that fall below the org's minimum
   methodology depth threshold. Returns null when no threshold is set.
   ============================================================ */

export type ComplianceAlert = {
  /** Number of active projects below the threshold */
  belowCount: number
  /** The configured threshold (0 = disabled) */
  threshold: number
}

export const getComplianceAlerts = async (orgId: string): Promise<ComplianceAlert | null> => {
  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return null
  }
  const supabase = await createClient()

  // Read the threshold from notification_settings JSONB
  const { data: orgSettings } = await supabase
    .from('org_settings')
    .select('notification_settings')
    .eq('org_id', orgId)
    .single()

  const notifSettings = (orgSettings?.notification_settings as Record<string, unknown> | null) ?? {}
  const threshold =
    typeof notifSettings.min_methodology_depth === 'number'
      ? notifSettings.min_methodology_depth
      : 0

  // Threshold of 0 means disabled — skip the check
  if (threshold === 0) return null

  // Fetch active project IDs
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('org_id', orgId)
    .eq('status', 'active')
    .is('archived_at', null)

  if (!projects || projects.length === 0) return null

  const projectIds = projects.map((p) => p.id)

  // Fetch all form types for these projects
  const { data: forms } = await supabase
    .from('project_forms')
    .select('project_id, form_type')
    .in('project_id', projectIds)

  // Calculate methodology depth per project
  const formsByProject = new Map<string, Set<string>>()
  for (const f of forms ?? []) {
    const existing = formsByProject.get(f.project_id) ?? new Set<string>()
    existing.add(f.form_type)
    formsByProject.set(f.project_id, existing)
  }

  let belowCount = 0
  for (const projectId of projectIds) {
    const completedTypes = formsByProject.get(projectId) ?? new Set<string>()
    const result = calculateMethodologyDepth(completedTypes)
    if (result.score < threshold) {
      belowCount++
    }
  }

  if (belowCount === 0) return null

  return { belowCount, threshold }
}
