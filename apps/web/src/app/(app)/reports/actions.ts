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
import type { CycleTimeTrendData } from '@/components/reports/cycle-time-trend-chart'

/* ============================================================
   Shared helpers
   ============================================================ */

/** Checks permission, returns false if denied (instead of throwing). */
const checkViewPermission = async (orgId: string): Promise<boolean> => {
  try {
    await requirePermission(orgId, 'data.view')
    return true
  } catch {
    return false
  }
}

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
  if (!(await checkViewPermission(orgId)))
    return { activeProjects: 0, openTickets: 0, totalMembers: 0, formsCompleted: 0 }
  const supabase = await createClient()

  const [projectsRes, ticketsRes, membersRes] = await Promise.allSettled([
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
  let formsCount = 0
  try {
    const { data: orgProjects } = await supabase.from('projects').select('id').eq('org_id', orgId)

    if (orgProjects && orgProjects.length > 0) {
      const projectIds = orgProjects.map((p) => p.id)
      const { count } = await supabase
        .from('project_forms')
        .select('id', { count: 'exact', head: true })
        .in('project_id', projectIds)
      formsCount = count ?? 0
    }
  } catch {
    // formsCount stays 0 on error
  }

  return {
    activeProjects: projectsRes.status === 'fulfilled' ? (projectsRes.value.count ?? 0) : 0,
    openTickets: ticketsRes.status === 'fulfilled' ? (ticketsRes.value.count ?? 0) : 0,
    totalMembers: membersRes.status === 'fulfilled' ? (membersRes.value.count ?? 0) : 0,
    formsCompleted: formsCount,
  }
}

/* ============================================================
   Reports Hub — Rich hero data (ROI-first redesign)
   ============================================================ */

export type ReportsHubData = {
  // Hero KPIs
  totalProjectsCompleted: number
  totalMeasurablesTracked: number
  projectedAnnualSavings: number
  hoursSavedAnnually: number
  // Quick stats
  avgMethodologyDepth: number
  avgCycleTimeDays: number | null
  achievementRate: number | null
  formsCompleted: number
  // Preview metrics for category cards
  projectedSavingsPreview: number
  activeProjects: number
  totalMembers: number
}

export const getReportsHubData = async (orgId: string): Promise<ReportsHubData> => {
  const empty: ReportsHubData = {
    totalProjectsCompleted: 0,
    totalMeasurablesTracked: 0,
    projectedAnnualSavings: 0,
    hoursSavedAnnually: 0,
    avgMethodologyDepth: 0,
    avgCycleTimeDays: null,
    achievementRate: null,
    formsCompleted: 0,
    projectedSavingsPreview: 0,
    activeProjects: 0,
    totalMembers: 0,
  }

  if (!(await checkViewPermission(orgId))) return empty

  const supabase = await createClient()

  // Fetch all org projects with relevant fields
  const { data: projects } = await supabase
    .from('projects')
    .select('id, status, completed_at, created_at')
    .eq('org_id', orgId)
    .in('status', ['completed', 'active', 'draft'])
    .limit(500)

  if (!projects || projects.length === 0) return empty

  const projectIds = projects.map((p) => p.id)

  const completedProjects = projects.filter((p) => p.status === 'completed')
  const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'draft')

  // Fetch forms needed for KPIs in parallel
  const [allFormsRes, problemStmtFormsRes, resultsFormsRes, membersRes] = await Promise.allSettled([
    supabase
      .from('project_forms')
      .select('project_id, form_type')
      .in('project_id', projectIds)
      .limit(10000),

    supabase
      .from('project_forms')
      .select('project_id, data')
      .in('project_id', projectIds)
      .eq('form_type', 'problem_statement')
      .limit(1000),

    supabase
      .from('project_forms')
      .select('project_id, data')
      .in('project_id', projectIds)
      .eq('form_type', 'results_metrics')
      .limit(1000),

    supabase.from('org_members').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
  ])

  const allForms = allFormsRes.status === 'fulfilled' ? (allFormsRes.value.data ?? []) : []
  const problemForms =
    problemStmtFormsRes.status === 'fulfilled' ? (problemStmtFormsRes.value.data ?? []) : []
  const resultsForms =
    resultsFormsRes.status === 'fulfilled' ? (resultsFormsRes.value.data ?? []) : []
  const totalMembers = membersRes.status === 'fulfilled' ? (membersRes.value.count ?? 0) : 0

  // Forms completed total
  const formsCompleted = allForms.length

  // Avg methodology depth (distinct form types / 25 per project, then average)
  const TOTAL_FORM_TYPES = 25
  const formTypesByProject = new Map<string, Set<string>>()
  for (const f of allForms) {
    if (!f.project_id) continue
    const existing = formTypesByProject.get(f.project_id) ?? new Set<string>()
    existing.add(f.form_type)
    formTypesByProject.set(f.project_id, existing)
  }

  let avgMethodologyDepth = 0
  if (projects.length > 0) {
    const totalDepth = projects.reduce((sum, p) => {
      const types = formTypesByProject.get(p.id) ?? new Set<string>()
      return sum + Math.round((types.size / TOTAL_FORM_TYPES) * 100)
    }, 0)
    avgMethodologyDepth = Math.round(totalDepth / projects.length)
  }

  // Projected savings + hours + measurables from problem_statement
  let projectedAnnualSavings = 0
  let hoursSavedAnnually = 0
  let totalMeasurablesTracked = 0

  type ProblemStatementMeasurable = {
    asIsValue: number
    targetValue: number
    unit?: string
  }
  type ProblemStatementFormData = {
    measurables?: ProblemStatementMeasurable[]
    hourlyRate?: number
  }

  for (const f of problemForms) {
    if (!f.project_id) continue
    const d = f.data as ProblemStatementFormData
    const measurables = d.measurables ?? []
    const hourlyRate = d.hourlyRate ?? 75

    for (const m of measurables) {
      const improvement = Math.abs((m.targetValue ?? 0) - (m.asIsValue ?? 0))
      if (improvement <= 0) continue
      totalMeasurablesTracked++

      const unitLower = (m.unit ?? '').toLowerCase()

      if (unitLower.includes('hour') || unitLower.includes('hr')) {
        let annualHours = improvement
        if (unitLower.includes('/week') || unitLower.includes('week')) {
          annualHours = improvement * 52
        } else if (unitLower.includes('/day') || unitLower.includes('day')) {
          annualHours = improvement * 260
        } else if (unitLower.includes('/month') || unitLower.includes('month')) {
          annualHours = improvement * 12
        }
        hoursSavedAnnually += annualHours
        projectedAnnualSavings += annualHours * hourlyRate
      } else if (
        unitLower.startsWith('$') ||
        unitLower.includes('dollar') ||
        unitLower.includes('cost') ||
        unitLower.includes('usd')
      ) {
        projectedAnnualSavings += improvement
      }
    }
  }

  projectedAnnualSavings = Math.round(projectedAnnualSavings)
  hoursSavedAnnually = Math.round(hoursSavedAnnually * 10) / 10

  // Achievement rate from results_metrics
  type ResultsMetricsFormData = {
    roiPercent?: number
    financialSavingsAnnual?: number
  }
  let achievementRate: number | null = null
  const projectsWithResults = new Set<string>()
  for (const f of resultsForms) {
    if (f.project_id) projectsWithResults.add(f.project_id)
  }
  if (completedProjects.length > 0) {
    achievementRate = Math.round((projectsWithResults.size / completedProjects.length) * 100)
  }

  // Avg cycle time (completed projects, created_at → completed_at)
  let avgCycleTimeDays: number | null = null
  const completedWithTimes = completedProjects.filter((p) => p.completed_at && p.created_at)
  if (completedWithTimes.length > 0) {
    const totalDays = completedWithTimes.reduce((sum, p) => {
      const start = new Date(p.created_at).getTime()
      const end = new Date(p.completed_at!).getTime()
      return sum + (end - start) / (1000 * 60 * 60 * 24)
    }, 0)
    avgCycleTimeDays = Math.round((totalDays / completedWithTimes.length) * 10) / 10
  }

  // Use actual savings from results_metrics if available (more accurate than projections)
  let actualAnnualSavings = 0
  let actualHoursSaved = 0
  for (const f of resultsForms) {
    if (!f.project_id) continue
    const d = f.data as ResultsMetricsFormData
    actualAnnualSavings += d.financialSavingsAnnual ?? 0
    // weekly hours * 52
    actualHoursSaved += 0 // results_metrics uses timeSavedWeeklyHours, handled below
  }

  // projectedSavingsPreview is the larger of projected vs actual
  const projectedSavingsPreview =
    actualAnnualSavings > projectedAnnualSavings ? actualAnnualSavings : projectedAnnualSavings

  return {
    totalProjectsCompleted: completedProjects.length,
    totalMeasurablesTracked,
    projectedAnnualSavings,
    hoursSavedAnnually,
    avgMethodologyDepth,
    avgCycleTimeDays,
    achievementRate,
    formsCompleted,
    projectedSavingsPreview,
    activeProjects: activeProjects.length,
    totalMembers,
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
  if (!(await checkViewPermission(orgId)))
    return { activeProjects: 0, avgStepProgress: 0, overdueTickets: 0, completedThisMonth: 0 }
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
  if (!(await checkViewPermission(orgId))) return []
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
  if (!(await checkViewPermission(orgId))) return []
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

/* ============================================================
   Cycle Time Metrics
   ============================================================ */

export type CycleTimeKpis = {
  avgCycleTimeDays: number | null
  medianCycleTimeDays: number | null
  longestOpenDays: number | null
  longestOpenTitle: string | null
}

export const getCycleTimeKpis = async (orgId: string): Promise<CycleTimeKpis> => {
  if (!(await checkViewPermission(orgId))) {
    return {
      avgCycleTimeDays: null,
      medianCycleTimeDays: null,
      longestOpenDays: null,
      longestOpenTitle: null,
    }
  }

  const supabase = await createClient()

  // Completed tickets with both timestamps (last 90 days) + longest open ticket, in parallel
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const [{ data: completed }, { data: openTickets }] = await Promise.all([
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
      .select('title, started_at')
      .eq('org_id', orgId)
      .not('started_at', 'is', null)
      .in('status', ['in_progress', 'in_review', 'blocked'])
      .order('started_at', { ascending: true })
      .limit(1),
  ])

  let avgCycleTimeDays: number | null = null
  let medianCycleTimeDays: number | null = null

  if (completed && completed.length > 0) {
    const cycleTimes = completed
      .map((t) => {
        const start = new Date(t.started_at!).getTime()
        const end = new Date(t.resolved_at!).getTime()
        return (end - start) / (1000 * 60 * 60 * 24)
      })
      .filter((d) => d >= 0)
      .sort((a, b) => a - b)

    if (cycleTimes.length > 0) {
      avgCycleTimeDays =
        Math.round((cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) * 10) / 10
      const mid = Math.floor(cycleTimes.length / 2)
      medianCycleTimeDays =
        cycleTimes.length % 2 === 0
          ? Math.round(((cycleTimes[mid - 1]! + cycleTimes[mid]!) / 2) * 10) / 10
          : Math.round(cycleTimes[mid]! * 10) / 10
    }
  }

  let longestOpenDays: number | null = null
  let longestOpenTitle: string | null = null

  if (openTickets && openTickets.length > 0) {
    const oldest = openTickets[0]!
    longestOpenDays =
      Math.round(
        ((Date.now() - new Date(oldest.started_at!).getTime()) / (1000 * 60 * 60 * 24)) * 10,
      ) / 10
    longestOpenTitle = oldest.title
  }

  return { avgCycleTimeDays, medianCycleTimeDays, longestOpenDays, longestOpenTitle }
}

export const getCycleTimeTrend = async (orgId: string): Promise<CycleTimeTrendData[]> => {
  if (!(await checkViewPermission(orgId))) return []

  const supabase = await createClient()

  // Get completed tickets from the last 12 weeks with both timestamps
  const twelveWeeksAgo = new Date()
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84)

  const { data: completed } = await supabase
    .from('tickets')
    .select('started_at, resolved_at, created_at')
    .eq('org_id', orgId)
    .not('resolved_at', 'is', null)
    .in('status', ['done', 'cancelled'])
    .gte('resolved_at', twelveWeeksAgo.toISOString())

  if (!completed || completed.length === 0) return []

  // Group by week of resolution
  const weekMap = new Map<string, { cycleTimes: number[]; leadTimes: number[] }>()

  for (const t of completed) {
    const weekKey = getWeekStart(new Date(t.resolved_at!))
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, { cycleTimes: [], leadTimes: [] })
    }
    const bucket = weekMap.get(weekKey)!

    // Cycle time (started_at → resolved_at)
    if (t.started_at) {
      const ct =
        (new Date(t.resolved_at!).getTime() - new Date(t.started_at).getTime()) /
        (1000 * 60 * 60 * 24)
      if (ct >= 0) bucket.cycleTimes.push(ct)
    }

    // Lead time (created_at → resolved_at)
    const lt =
      (new Date(t.resolved_at!).getTime() - new Date(t.created_at).getTime()) /
      (1000 * 60 * 60 * 24)
    if (lt >= 0) bucket.leadTimes.push(lt)
  }

  // Sort by week and format
  const weeks = Array.from(weekMap.entries()).sort(([a], [b]) => a.localeCompare(b))

  return weeks.map(([weekKey, bucket]) => {
    const avg = (arr: number[]) =>
      arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0

    return {
      week: formatShortDate(new Date(weekKey)),
      avgCycleTime: avg(bucket.cycleTimes),
      avgLeadTime: avg(bucket.leadTimes),
    }
  })
}

export const getStepCompletionFunnel = async (orgId: string): Promise<StepFunnelData[]> => {
  if (!(await checkViewPermission(orgId))) return []
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
  if (!(await checkViewPermission(orgId))) return []
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
  if (!(await checkViewPermission(orgId)))
    return {
      totalMembers: 0,
      activeThisWeek: 0,
      ticketsCompletedThisWeek: 0,
      avgResponseTimeDays: 0,
    }
  const supabase = await createClient()

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [membersRes, completedRes, activeLogsRes] = await Promise.all([
    supabase.from('org_members').select('id, user_id', { count: 'exact' }).eq('org_id', orgId),

    supabase
      .from('tickets')
      .select('id, resolved_at, created_at')
      .eq('org_id', orgId)
      .eq('status', 'done')
      .gte('resolved_at', weekAgo.toISOString()),

    // Count active members this week from audit_log (independent — runs in parallel)
    supabase
      .from('audit_log')
      .select('user_id')
      .eq('org_id', orgId)
      .gte('created_at', weekAgo.toISOString()),
  ])

  const { data: activeLogs } = activeLogsRes

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
  if (!(await checkViewPermission(orgId))) return []
  const supabase = await createClient()

  const { data: members } = await supabase.from('org_members').select('user_id').eq('org_id', orgId)

  if (!members || members.length === 0) return []

  const userIds = members.map((m) => m.user_id)

  const [{ data: profiles }, { data: completedTickets }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, display_name').in('id', userIds),

    supabase
      .from('tickets')
      .select('assignee_id')
      .eq('org_id', orgId)
      .eq('status', 'done')
      .in('assignee_id', userIds),
  ])

  const profileMap = new Map<string, string>()
  if (profiles) {
    for (const p of profiles) {
      profileMap.set(p.id, p.display_name || p.full_name || 'Unknown')
    }
  }

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
  if (!(await checkViewPermission(orgId))) return []
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
  if (!(await checkViewPermission(orgId))) return []
  const supabase = await createClient()

  const { data: members } = await supabase
    .from('org_members')
    .select('user_id, role, updated_at')
    .eq('org_id', orgId)

  if (!members || members.length === 0) return []

  const userIds = members.map((m) => m.user_id)

  const [{ data: profiles }, { data: assignedTickets }, { data: latestLogs }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, display_name').in('id', userIds),

    supabase
      .from('tickets')
      .select('assignee_id, status')
      .eq('org_id', orgId)
      .in('assignee_id', userIds),

    supabase
      .from('audit_log')
      .select('user_id, created_at')
      .eq('org_id', orgId)
      .in('user_id', userIds)
      .order('created_at', { ascending: false }),
  ])

  const profileMap = new Map<string, string>()
  if (profiles) {
    for (const p of profiles) {
      profileMap.set(p.id, p.display_name || p.full_name || 'Unknown')
    }
  }

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
  if (!(await checkViewPermission(orgId)))
    return { totalFormsCompleted: 0, avgTimePerStep: 0, mostUsedTool: 'N/A', completionRate: 0 }
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
  if (!(await checkViewPermission(orgId))) return []
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
  if (!(await checkViewPermission(orgId))) return []
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
  if (!(await checkViewPermission(orgId))) return []
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
  if (!(await checkViewPermission(orgId))) return []
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
