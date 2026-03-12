'use server'

import { createClient } from '@/lib/supabase/server'
import { PIPS_STEPS, PIPS_STEP_ENUMS } from '@pips/shared'
import { requirePermission } from '@/lib/permissions'
import type { StepProgressData } from '@/components/reports/step-progress-chart'
import type { TicketVelocityData } from '@/components/reports/ticket-velocity-chart'
import type { StepFunnelData } from '@/components/reports/step-funnel-chart'
import type { TeamContributionData } from '@/components/reports/team-contributions-chart'
import type { ActivityTimelineData } from '@/components/reports/activity-timeline-chart'
import type { FormCompletionData } from '@/components/reports/form-completion-chart'
import type { StepDurationData } from '@/components/reports/step-duration-chart'
import type { ToolPopularityData } from '@/components/reports/tool-popularity-chart'

/* ============================================================
   Shared helpers
   ============================================================ */

const STEP_ENUM_TO_INDEX: Record<string, number> = {
  identify: 0,
  analyze: 1,
  generate: 2,
  select_plan: 3,
  implement: 4,
  evaluate: 5,
}

/** Format a Date into "MMM D" for chart labels */
const formatShortDate = (d: Date): string => {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Get the Monday of the week for a given date */
const getWeekStart = (d: Date): string => {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Monday
  date.setDate(diff)
  return date.toISOString().split('T')[0] ?? ''
}

/* ============================================================
   Reports Hub — Summary KPIs
   ============================================================ */

export type ReportsHubStats = {
  activeProjects: number
  openTickets: number
  totalMembers: number
  formsCompleted: number
}

export const getReportsHubStats = async (orgId: string): Promise<ReportsHubStats> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const [projectsRes, ticketsRes, membersRes] = await Promise.all([
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

    supabase.from('org_members').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
  ])

  // For forms we need to go through projects since project_forms doesn't have org_id
  const { data: orgProjects } = await supabase.from('projects').select('id').eq('org_id', orgId)

  let formsCount = 0
  if (orgProjects && orgProjects.length > 0) {
    const projectIds = orgProjects.map((p) => p.id)
    const { count } = await supabase
      .from('project_forms')
      .select('id', { count: 'exact', head: true })
      .in('project_id', projectIds)
    formsCount = count ?? 0
  }

  return {
    activeProjects: projectsRes.count ?? 0,
    openTickets: ticketsRes.count ?? 0,
    totalMembers: membersRes.count ?? 0,
    formsCompleted: formsCount,
  }
}

/* ============================================================
   Project Health Report
   ============================================================ */

export type ProjectHealthKpis = {
  activeProjects: number
  avgStepProgress: number
  overdueTickets: number
  completedThisMonth: number
}

export const getProjectHealthKpis = async (orgId: string): Promise<ProjectHealthKpis> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const today = now.toISOString().split('T')[0] ?? ''

  const [projectsRes, overdueRes, completedRes, stepsData] = await Promise.all([
    supabase
      .from('projects')
      .select('id, current_step', { count: 'exact' })
      .eq('org_id', orgId)
      .in('status', ['active', 'draft']),

    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('status', ['backlog', 'todo', 'in_progress', 'in_review', 'blocked'])
      .lt('due_date', today),

    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'completed')
      .gte('completed_at', startOfMonth),

    supabase
      .from('projects')
      .select('current_step')
      .eq('org_id', orgId)
      .in('status', ['active', 'draft']),
  ])

  // Calculate average step progress — each step = ~16.67% progress
  let avgProgress = 0
  if (stepsData.data && stepsData.data.length > 0) {
    const totalProgress = stepsData.data.reduce((sum, p) => {
      const idx = STEP_ENUM_TO_INDEX[p.current_step] ?? 0
      return sum + ((idx + 1) / 6) * 100
    }, 0)
    avgProgress = Math.round(totalProgress / stepsData.data.length)
  }

  return {
    activeProjects: projectsRes.count ?? 0,
    avgStepProgress: avgProgress,
    overdueTickets: overdueRes.count ?? 0,
    completedThisMonth: completedRes.count ?? 0,
  }
}

export const getProjectsByStep = async (orgId: string): Promise<StepProgressData[]> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('current_step')
    .eq('org_id', orgId)
    .in('status', ['active', 'draft'])

  const counts = PIPS_STEPS.map((step) => ({
    step: step.name.toLowerCase().replace(/ & /g, '_'),
    name: step.name,
    count: 0,
    color: step.color,
  }))

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

export const getTicketVelocity = async (orgId: string): Promise<TicketVelocityData[]> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const now = new Date()
  const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000)

  const [createdRes, completedRes] = await Promise.all([
    supabase
      .from('tickets')
      .select('created_at')
      .eq('org_id', orgId)
      .gte('created_at', eightWeeksAgo.toISOString()),

    supabase
      .from('tickets')
      .select('resolved_at')
      .eq('org_id', orgId)
      .eq('status', 'done')
      .gte('resolved_at', eightWeeksAgo.toISOString()),
  ])

  // Build weekly buckets
  const weeks: Map<string, { created: number; completed: number }> = new Map()
  for (let i = 0; i < 8; i++) {
    const weekDate = new Date(now.getTime() - (7 - i) * 7 * 24 * 60 * 60 * 1000)
    const weekKey = getWeekStart(weekDate)
    weeks.set(weekKey, { created: 0, completed: 0 })
  }

  if (createdRes.data) {
    for (const t of createdRes.data) {
      const weekKey = getWeekStart(new Date(t.created_at))
      const bucket = weeks.get(weekKey)
      if (bucket) bucket.created += 1
    }
  }

  if (completedRes.data) {
    for (const t of completedRes.data) {
      if (t.resolved_at) {
        const weekKey = getWeekStart(new Date(t.resolved_at))
        const bucket = weeks.get(weekKey)
        if (bucket) bucket.completed += 1
      }
    }
  }

  return Array.from(weeks.entries()).map(([weekKey, data]) => ({
    week: formatShortDate(new Date(weekKey)),
    created: data.created,
    completed: data.completed,
  }))
}

export const getStepCompletionFunnel = async (orgId: string): Promise<StepFunnelData[]> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('current_step, status')
    .eq('org_id', orgId)
    .in('status', ['active', 'draft', 'completed'])

  if (!projects || projects.length === 0) {
    return PIPS_STEPS.map((step) => ({
      name: step.name,
      percentage: 0,
      color: step.color,
    }))
  }

  const total = projects.length

  return PIPS_STEPS.map((step, stepIdx) => {
    const reached = projects.filter((p) => {
      if (p.status === 'completed') return true
      const projectIdx = STEP_ENUM_TO_INDEX[p.current_step] ?? 0
      return projectIdx >= stepIdx
    }).length

    return {
      name: step.name,
      percentage: Math.round((reached / total) * 100),
      color: step.color,
    }
  })
}

export type ProjectTableRow = {
  id: string
  name: string
  currentStep: string
  progressPercent: number
  openTickets: number
  overdueCount: number
  lastActivity: string | null
}

export const getProjectsTable = async (orgId: string): Promise<ProjectTableRow[]> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0] ?? ''

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, current_step, updated_at')
    .eq('org_id', orgId)
    .in('status', ['active', 'draft'])
    .order('updated_at', { ascending: false })
    .limit(50)

  if (!projects || projects.length === 0) return []

  const projectIds = projects.map((p) => p.id)

  const { data: tickets } = await supabase
    .from('tickets')
    .select('project_id, status, due_date')
    .in('project_id', projectIds)
    .in('status', ['backlog', 'todo', 'in_progress', 'in_review', 'blocked'])

  const ticketsByProject = new Map<string, { open: number; overdue: number }>()
  if (tickets) {
    for (const t of tickets) {
      if (!t.project_id) continue
      const entry = ticketsByProject.get(t.project_id) ?? { open: 0, overdue: 0 }
      entry.open += 1
      if (t.due_date && t.due_date < today) entry.overdue += 1
      ticketsByProject.set(t.project_id, entry)
    }
  }

  return projects.map((p) => {
    const stepIdx = STEP_ENUM_TO_INDEX[p.current_step] ?? 0
    const progressPercent = Math.round(((stepIdx + 1) / 6) * 100)
    const ticketInfo = ticketsByProject.get(p.id) ?? { open: 0, overdue: 0 }

    return {
      id: p.id,
      name: p.title,
      currentStep: PIPS_STEPS[stepIdx]?.name ?? 'Unknown',
      progressPercent,
      openTickets: ticketInfo.open,
      overdueCount: ticketInfo.overdue,
      lastActivity: p.updated_at,
    }
  })
}

/* ============================================================
   Team Activity Report
   ============================================================ */

export type TeamActivityKpis = {
  totalMembers: number
  activeThisWeek: number
  ticketsCompletedThisWeek: number
  avgResponseTimeDays: number
}

export const getTeamActivityKpis = async (orgId: string): Promise<TeamActivityKpis> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [membersRes, completedRes] = await Promise.all([
    supabase.from('org_members').select('id, user_id', { count: 'exact' }).eq('org_id', orgId),

    supabase
      .from('tickets')
      .select('id, resolved_at, created_at')
      .eq('org_id', orgId)
      .eq('status', 'done')
      .gte('resolved_at', weekAgo.toISOString()),
  ])

  // Count active members this week from audit_log
  const { data: activeLogs } = await supabase
    .from('audit_log')
    .select('user_id')
    .eq('org_id', orgId)
    .gte('created_at', weekAgo.toISOString())

  const activeUserIds = new Set<string>()
  if (activeLogs) {
    for (const log of activeLogs) {
      if (log.user_id) activeUserIds.add(log.user_id)
    }
  }

  // Calculate avg response time from completed tickets this week
  let avgDays = 0
  if (completedRes.data && completedRes.data.length > 0) {
    const totalDays = completedRes.data.reduce((sum, t) => {
      if (t.resolved_at && t.created_at) {
        const created = new Date(t.created_at).getTime()
        const resolved = new Date(t.resolved_at).getTime()
        return sum + (resolved - created) / (1000 * 60 * 60 * 24)
      }
      return sum
    }, 0)
    avgDays = Math.round((totalDays / completedRes.data.length) * 10) / 10
  }

  return {
    totalMembers: membersRes.count ?? 0,
    activeThisWeek: activeUserIds.size,
    ticketsCompletedThisWeek: completedRes.data?.length ?? 0,
    avgResponseTimeDays: avgDays,
  }
}

export const getTeamContributions = async (orgId: string): Promise<TeamContributionData[]> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const { data: members } = await supabase.from('org_members').select('user_id').eq('org_id', orgId)

  if (!members || members.length === 0) return []

  const userIds = members.map((m) => m.user_id)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, display_name')
    .in('id', userIds)

  const profileMap = new Map<string, string>()
  if (profiles) {
    for (const p of profiles) {
      profileMap.set(p.id, p.display_name || p.full_name || 'Unknown')
    }
  }

  const { data: completedTickets } = await supabase
    .from('tickets')
    .select('assignee_id')
    .eq('org_id', orgId)
    .eq('status', 'done')
    .in('assignee_id', userIds)

  const countByUser = new Map<string, number>()
  if (completedTickets) {
    for (const t of completedTickets) {
      if (t.assignee_id) {
        countByUser.set(t.assignee_id, (countByUser.get(t.assignee_id) ?? 0) + 1)
      }
    }
  }

  return userIds
    .map((userId) => ({
      name: profileMap.get(userId) ?? 'Unknown',
      completed: countByUser.get(userId) ?? 0,
    }))
    .sort((a, b) => b.completed - a.completed)
}

export const getActivityTimeline = async (orgId: string): Promise<ActivityTimelineData[]> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const { data: logs } = await supabase
    .from('audit_log')
    .select('created_at')
    .eq('org_id', orgId)
    .gte('created_at', thirtyDaysAgo.toISOString())

  // Build daily buckets
  const days: Map<string, number> = new Map()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    days.set(date.toISOString().split('T')[0] ?? '', 0)
  }

  if (logs) {
    for (const log of logs) {
      const dateKey = log.created_at.split('T')[0] ?? ''
      if (days.has(dateKey)) {
        days.set(dateKey, (days.get(dateKey) ?? 0) + 1)
      }
    }
  }

  return Array.from(days.entries()).map(([dateKey, count]) => ({
    date: formatShortDate(new Date(dateKey)),
    actions: count,
  }))
}

export type TeamMemberRow = {
  id: string
  name: string
  role: string
  ticketsAssigned: number
  ticketsCompleted: number
  lastActive: string | null
}

export const getTeamMembersTable = async (orgId: string): Promise<TeamMemberRow[]> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const { data: members } = await supabase
    .from('org_members')
    .select('user_id, role, updated_at')
    .eq('org_id', orgId)

  if (!members || members.length === 0) return []

  const userIds = members.map((m) => m.user_id)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, display_name')
    .in('id', userIds)

  const profileMap = new Map<string, string>()
  if (profiles) {
    for (const p of profiles) {
      profileMap.set(p.id, p.display_name || p.full_name || 'Unknown')
    }
  }

  const { data: assignedTickets } = await supabase
    .from('tickets')
    .select('assignee_id, status')
    .eq('org_id', orgId)
    .in('assignee_id', userIds)

  const assignedByUser = new Map<string, number>()
  const completedByUser = new Map<string, number>()
  if (assignedTickets) {
    for (const t of assignedTickets) {
      if (t.assignee_id) {
        assignedByUser.set(t.assignee_id, (assignedByUser.get(t.assignee_id) ?? 0) + 1)
        if (t.status === 'done') {
          completedByUser.set(t.assignee_id, (completedByUser.get(t.assignee_id) ?? 0) + 1)
        }
      }
    }
  }

  const { data: latestLogs } = await supabase
    .from('audit_log')
    .select('user_id, created_at')
    .eq('org_id', orgId)
    .in('user_id', userIds)
    .order('created_at', { ascending: false })

  const lastActiveByUser = new Map<string, string>()
  if (latestLogs) {
    for (const log of latestLogs) {
      if (log.user_id && !lastActiveByUser.has(log.user_id)) {
        lastActiveByUser.set(log.user_id, log.created_at)
      }
    }
  }

  return members.map((m) => ({
    id: m.user_id,
    name: profileMap.get(m.user_id) ?? 'Unknown',
    role: (m.role as string).charAt(0).toUpperCase() + (m.role as string).slice(1),
    ticketsAssigned: assignedByUser.get(m.user_id) ?? 0,
    ticketsCompleted: completedByUser.get(m.user_id) ?? 0,
    lastActive: lastActiveByUser.get(m.user_id) ?? null,
  }))
}

/* ============================================================
   Methodology Insights Report
   ============================================================ */

export type MethodologyKpis = {
  totalFormsCompleted: number
  avgTimePerStep: number
  mostUsedTool: string
  completionRate: number
}

export const getMethodologyKpis = async (orgId: string): Promise<MethodologyKpis> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const { data: orgProjects } = await supabase.from('projects').select('id').eq('org_id', orgId)

  if (!orgProjects || orgProjects.length === 0) {
    return {
      totalFormsCompleted: 0,
      avgTimePerStep: 0,
      mostUsedTool: 'N/A',
      completionRate: 0,
    }
  }

  const projectIds = orgProjects.map((p) => p.id)

  const [formsRes, stepsRes, projectStatusRes] = await Promise.all([
    supabase.from('project_forms').select('id, form_type').in('project_id', projectIds),

    supabase
      .from('project_steps')
      .select('started_at, completed_at, status')
      .in('project_id', projectIds),

    supabase
      .from('projects')
      .select('status')
      .eq('org_id', orgId)
      .in('status', ['active', 'draft', 'completed']),
  ])

  const totalForms = formsRes.data?.length ?? 0

  // Most used tool
  const toolCounts = new Map<string, number>()
  if (formsRes.data) {
    for (const f of formsRes.data) {
      toolCounts.set(f.form_type, (toolCounts.get(f.form_type) ?? 0) + 1)
    }
  }
  let mostUsedTool = 'N/A'
  let maxCount = 0
  for (const [tool, count] of toolCounts) {
    if (count > maxCount) {
      maxCount = count
      mostUsedTool = tool.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    }
  }

  // Avg time per step (completed steps only)
  let avgDays = 0
  if (stepsRes.data) {
    const completedSteps = stepsRes.data.filter(
      (s) => s.status === 'completed' && s.started_at && s.completed_at,
    )
    if (completedSteps.length > 0) {
      const totalDays = completedSteps.reduce((sum, s) => {
        const start = new Date(s.started_at!).getTime()
        const end = new Date(s.completed_at!).getTime()
        return sum + (end - start) / (1000 * 60 * 60 * 24)
      }, 0)
      avgDays = Math.round((totalDays / completedSteps.length) * 10) / 10
    }
  }

  // Completion rate
  const allProjects = projectStatusRes.data?.length ?? 0
  const completedProjects =
    projectStatusRes.data?.filter((p) => p.status === 'completed').length ?? 0
  const completionRate = allProjects > 0 ? Math.round((completedProjects / allProjects) * 100) : 0

  return {
    totalFormsCompleted: totalForms,
    avgTimePerStep: avgDays,
    mostUsedTool,
    completionRate,
  }
}

export const getFormCompletionByStep = async (orgId: string): Promise<FormCompletionData[]> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const { data: orgProjects } = await supabase.from('projects').select('id').eq('org_id', orgId)

  if (!orgProjects || orgProjects.length === 0) {
    return PIPS_STEPS.map((step) => ({
      step: step.name,
      started: 0,
      completed: 0,
    }))
  }

  const projectIds = orgProjects.map((p) => p.id)

  const { data: steps } = await supabase
    .from('project_steps')
    .select('step, status')
    .in('project_id', projectIds)

  return PIPS_STEPS.map((pipsStep, idx) => {
    const stepEnum = PIPS_STEP_ENUMS[idx]
    const matching = steps?.filter((s) => s.step === stepEnum) ?? []
    const started = matching.filter(
      (s) => s.status === 'in_progress' || s.status === 'completed',
    ).length
    const completed = matching.filter((s) => s.status === 'completed').length

    return {
      step: pipsStep.name,
      started,
      completed,
    }
  })
}

export const getStepDurations = async (orgId: string): Promise<StepDurationData[]> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const { data: orgProjects } = await supabase.from('projects').select('id').eq('org_id', orgId)

  if (!orgProjects || orgProjects.length === 0) {
    return PIPS_STEPS.map((step) => ({
      name: step.name,
      avgDays: 0,
      color: step.color,
    }))
  }

  const projectIds = orgProjects.map((p) => p.id)

  const { data: steps } = await supabase
    .from('project_steps')
    .select('step, started_at, completed_at, status')
    .in('project_id', projectIds)
    .eq('status', 'completed')

  return PIPS_STEPS.map((pipsStep, idx) => {
    const stepEnum = PIPS_STEP_ENUMS[idx]
    const completed =
      steps?.filter((s) => s.step === stepEnum && s.started_at && s.completed_at) ?? []

    let avgDays = 0
    if (completed.length > 0) {
      const totalDays = completed.reduce((sum, s) => {
        const start = new Date(s.started_at!).getTime()
        const end = new Date(s.completed_at!).getTime()
        return sum + (end - start) / (1000 * 60 * 60 * 24)
      }, 0)
      avgDays = Math.round((totalDays / completed.length) * 10) / 10
    }

    return {
      name: pipsStep.name,
      avgDays,
      color: pipsStep.color,
    }
  })
}

export const getToolPopularity = async (orgId: string): Promise<ToolPopularityData[]> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const { data: orgProjects } = await supabase.from('projects').select('id').eq('org_id', orgId)

  if (!orgProjects || orgProjects.length === 0) return []

  const projectIds = orgProjects.map((p) => p.id)

  const { data: forms } = await supabase
    .from('project_forms')
    .select('form_type')
    .in('project_id', projectIds)

  if (!forms || forms.length === 0) return []

  const counts = new Map<string, number>()
  for (const f of forms) {
    counts.set(f.form_type, (counts.get(f.form_type) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([type, count]) => ({
      name: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

export type StepBreakdownRow = {
  stepName: string
  avgDuration: number
  formsCompleted: number
  completionRate: number
  color: string
}

export const getStepBreakdownTable = async (orgId: string): Promise<StepBreakdownRow[]> => {
  await requirePermission(orgId, 'data.view')
  const supabase = await createClient()

  const { data: orgProjects } = await supabase.from('projects').select('id').eq('org_id', orgId)

  if (!orgProjects || orgProjects.length === 0) {
    return PIPS_STEPS.map((step) => ({
      stepName: step.name,
      avgDuration: 0,
      formsCompleted: 0,
      completionRate: 0,
      color: step.color,
    }))
  }

  const projectIds = orgProjects.map((p) => p.id)

  const [stepsRes, formsRes] = await Promise.all([
    supabase
      .from('project_steps')
      .select('step, status, started_at, completed_at')
      .in('project_id', projectIds),

    supabase.from('project_forms').select('step').in('project_id', projectIds),
  ])

  return PIPS_STEPS.map((pipsStep, idx) => {
    const stepEnum = PIPS_STEP_ENUMS[idx]

    const allStepRows = stepsRes.data?.filter((s) => s.step === stepEnum) ?? []
    const completedStepRows = allStepRows.filter((s) => s.status === 'completed')
    const startedOrCompleted = allStepRows.filter(
      (s) => s.status === 'in_progress' || s.status === 'completed',
    )

    let avgDuration = 0
    const durableRows = completedStepRows.filter((s) => s.started_at && s.completed_at)
    if (durableRows.length > 0) {
      const totalDays = durableRows.reduce((sum, s) => {
        const start = new Date(s.started_at!).getTime()
        const end = new Date(s.completed_at!).getTime()
        return sum + (end - start) / (1000 * 60 * 60 * 24)
      }, 0)
      avgDuration = Math.round((totalDays / durableRows.length) * 10) / 10
    }

    const formsForStep = formsRes.data?.filter((f) => f.step === stepEnum).length ?? 0

    const completionRate =
      startedOrCompleted.length > 0
        ? Math.round((completedStepRows.length / startedOrCompleted.length) * 100)
        : 0

    return {
      stepName: pipsStep.name,
      avgDuration,
      formsCompleted: formsForStep,
      completionRate,
      color: pipsStep.color,
    }
  })
}
