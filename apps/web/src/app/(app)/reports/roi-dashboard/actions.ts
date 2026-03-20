'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import type {
  ResultsMetricsData,
  ImpactMetricsData,
  ProblemStatementData,
} from '@/lib/form-schemas'

/* ============================================================
   Types
   ============================================================ */

export type Period = 'this-quarter' | 'last-quarter' | 'ytd' | 'last-12-months' | 'all-time'

export const VALID_PERIODS: Period[] = [
  'this-quarter',
  'last-quarter',
  'ytd',
  'last-12-months',
  'all-time',
]

export const PERIOD_LABELS: Record<Period, string> = {
  'this-quarter': 'This Quarter',
  'last-quarter': 'Last Quarter',
  ytd: 'Year to Date',
  'last-12-months': 'Last 12 Months',
  'all-time': 'All Time',
}

export const parsePeriod = (raw: string | undefined): Period =>
  VALID_PERIODS.includes(raw as Period) ? (raw as Period) : 'this-quarter'

/**
 * Returns { start, end } date boundaries for a given period.
 * Returns null for 'all-time' (no filtering).
 */
export const getPeriodBounds = (
  period: Period,
): { start: Date; end: Date; label: string } | null => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const quarter = Math.floor(month / 3)

  if (period === 'all-time') return null

  if (period === 'this-quarter') {
    const start = new Date(year, quarter * 3, 1)
    const end = new Date(year, quarter * 3 + 3, 0, 23, 59, 59)
    return { start, end, label: `Q${quarter + 1} ${year}` }
  }

  if (period === 'last-quarter') {
    const prevQ = quarter === 0 ? 3 : quarter - 1
    const prevYear = quarter === 0 ? year - 1 : year
    const start = new Date(prevYear, prevQ * 3, 1)
    const end = new Date(prevYear, prevQ * 3 + 3, 0, 23, 59, 59)
    return { start, end, label: `Q${prevQ + 1} ${prevYear}` }
  }

  if (period === 'ytd') {
    const start = new Date(year, 0, 1)
    const end = now
    return { start, end, label: `Year to Date ${year}` }
  }

  if (period === 'last-12-months') {
    const start = new Date(year, month - 12, 1)
    const end = now
    return { start, end, label: 'Last 12 Months' }
  }

  return null
}

export type CorrelationDataPoint = {
  projectId: string
  projectTitle: string
  methodologyDepthPercent: number
  roiPercent: number | null
  annualSavings: number | null
  cycleTimeDays: number | null
  formsCompleted: number
}

export type CorrelationInsight = {
  label: string
  value: string
  description: string
}

export type MethodologyCorrelation = {
  dataPoints: CorrelationDataPoint[]
  insights: CorrelationInsight[]
  avgRoiHighDepth: number | null
  avgRoiLowDepth: number | null
  multiplier: number | null
}

export type ROIDashboardData = {
  /** Realised savings — from results_metrics forms (Step 6) */
  totalAnnualSavings: number
  totalWeeklyHoursSaved: number
  avgRoiPercent: number | null
  projectsWithRoiData: number
  /** Projected savings — from problem_statement measurables (Step 1) */
  totalProjectedSavings: number
  totalProjectedHoursSaved: number
  measurablesCount: number
  projectsWithMeasurables: number
  /** Realisation rate: realised / projected * 100 */
  realisationRate: number | null
  topProjectsByImpact: Array<{
    id: string
    title: string
    annualSavings: number
    roiPercent: number
    depthPercent: number
    cycleTimeDays: number | null
  }>
  monthlyTrend: Array<{
    month: string
    cumulativeSavings: number
    projectsCompleted: number
  }>
  periodLabel: string
}

/* ============================================================
   Internal helpers
   ============================================================ */

const TOTAL_FORM_TYPES = 25

/** Format a date as "YYYY-MM" */
const toYearMonth = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** Format "YYYY-MM" as "MMM YYYY" for display */
const formatMonth = (ym: string): string => {
  const [year, month] = ym.split('-')
  if (!year || !month) return ym
  const d = new Date(Number(year), Number(month) - 1, 1)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/* ============================================================
   getMethodologyCorrelation
   ============================================================ */

export const getMethodologyCorrelation = async (orgId: string): Promise<MethodologyCorrelation> => {
  await requirePermission(orgId, 'data.view')

  const supabase = await createClient()

  // Fetch all projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, status, completed_at, created_at')
    .eq('org_id', orgId)
    .in('status', ['completed', 'active', 'draft'])
    .order('created_at', { ascending: false })
    .limit(200)

  if (!projects || projects.length === 0) {
    return {
      dataPoints: [],
      insights: [
        {
          label: 'No projects yet',
          value: '--',
          description:
            'Create projects and use PIPS methodology tools to see correlation insights.',
        },
      ],
      avgRoiHighDepth: null,
      avgRoiLowDepth: null,
      multiplier: null,
    }
  }

  const projectIds = projects.map((p) => p.id)

  // Fetch all forms for org projects
  const { data: forms } = await supabase
    .from('project_forms')
    .select('project_id, form_type, data')
    .in('project_id', projectIds)
    .limit(5000)

  // Group forms by project
  const formsByProject = new Map<
    string,
    Array<{ form_type: string; data: Record<string, unknown> }>
  >()
  for (const f of forms ?? []) {
    if (!f.project_id) continue
    const existing = formsByProject.get(f.project_id) ?? []
    existing.push({ form_type: f.form_type, data: f.data as Record<string, unknown> })
    formsByProject.set(f.project_id, existing)
  }

  // Build data points
  const dataPoints: CorrelationDataPoint[] = projects.map((project) => {
    const projectForms = formsByProject.get(project.id) ?? []

    const distinctTypes = new Set(projectForms.map((f) => f.form_type))
    const methodologyDepthPercent = Math.round((distinctTypes.size / TOTAL_FORM_TYPES) * 100)

    // Extract ROI from results_metrics
    const resultsForm = projectForms.find((f) => f.form_type === 'results_metrics')
    let roiPercent: number | null = null
    let annualSavings: number | null = null

    if (resultsForm) {
      const d = resultsForm.data as ResultsMetricsData
      if (typeof d.roiPercent === 'number' && d.roiPercent > 0) {
        roiPercent = d.roiPercent
      }
      if (typeof d.financialSavingsAnnual === 'number' && d.financialSavingsAnnual > 0) {
        annualSavings = d.financialSavingsAnnual
      }
    }

    // Cycle time (created → completed for completed projects)
    let cycleTimeDays: number | null = null
    if (project.completed_at) {
      const start = new Date(project.created_at).getTime()
      const end = new Date(project.completed_at).getTime()
      cycleTimeDays = Math.round(((end - start) / (1000 * 60 * 60 * 24)) * 10) / 10
    }

    return {
      projectId: project.id,
      projectTitle: project.title,
      methodologyDepthPercent,
      roiPercent,
      annualSavings,
      cycleTimeDays,
      formsCompleted: projectForms.length,
    }
  })

  // Split into high-depth (>60%) vs low-depth (<=60%)
  const highDepth = dataPoints.filter((d) => d.methodologyDepthPercent > 60)
  const lowDepth = dataPoints.filter((d) => d.methodologyDepthPercent <= 60)

  // Average ROI by group (only for projects with ROI data)
  const avgRoiForGroup = (group: CorrelationDataPoint[]): number | null => {
    const withRoi = group.filter((d) => d.roiPercent !== null)
    if (withRoi.length === 0) return null
    return (
      Math.round((withRoi.reduce((sum, d) => sum + (d.roiPercent ?? 0), 0) / withRoi.length) * 10) /
      10
    )
  }

  const avgRoiHighDepth = avgRoiForGroup(highDepth)
  const avgRoiLowDepth = avgRoiForGroup(lowDepth)
  const multiplier =
    avgRoiHighDepth !== null && avgRoiLowDepth !== null && avgRoiLowDepth > 0
      ? Math.round((avgRoiHighDepth / avgRoiLowDepth) * 10) / 10
      : null

  // Build insights
  const insights: CorrelationInsight[] = []

  // Insight 1: methodology adoption rate
  const withForms = dataPoints.filter((d) => d.formsCompleted > 0)
  const adoptionRate =
    dataPoints.length > 0 ? Math.round((withForms.length / dataPoints.length) * 100) : 0
  insights.push({
    label: 'Methodology Adoption',
    value: `${adoptionRate}%`,
    description: `${withForms.length} of ${dataPoints.length} project${dataPoints.length !== 1 ? 's' : ''} use PIPS methodology tools`,
  })

  // Insight 2: average depth across all projects
  const avgDepth =
    dataPoints.length > 0
      ? Math.round(
          dataPoints.reduce((sum, d) => sum + d.methodologyDepthPercent, 0) / dataPoints.length,
        )
      : 0
  insights.push({
    label: 'Avg Methodology Depth',
    value: `${avgDepth}%`,
    description:
      avgDepth >= 60
        ? 'Strong methodology engagement across projects'
        : 'Room to deepen methodology practice for better outcomes',
  })

  // Insight 3: cycle time comparison
  const highDepthWithCycle = highDepth.filter((d) => d.cycleTimeDays !== null)
  const lowDepthWithCycle = lowDepth.filter((d) => d.cycleTimeDays !== null)

  if (highDepthWithCycle.length > 0 && lowDepthWithCycle.length > 0) {
    const avgCycleHigh =
      highDepthWithCycle.reduce((sum, d) => sum + (d.cycleTimeDays ?? 0), 0) /
      highDepthWithCycle.length
    const avgCycleLow =
      lowDepthWithCycle.reduce((sum, d) => sum + (d.cycleTimeDays ?? 0), 0) /
      lowDepthWithCycle.length
    const diff = Math.round((avgCycleLow - avgCycleHigh) * 10) / 10
    if (Math.abs(diff) > 0) {
      insights.push({
        label: 'Cycle Time (High vs Low Depth)',
        value: diff > 0 ? `${Math.abs(diff)}d faster` : `${Math.abs(diff)}d slower`,
        description:
          diff > 0
            ? `Deep-methodology projects complete ${Math.abs(diff)} days faster on average`
            : `Deep-methodology projects take ${Math.abs(diff)} more days — often tackling harder problems`,
      })
    }
  } else {
    // Fallback: depth vs forms correlation
    const avgForms =
      dataPoints.length > 0
        ? Math.round(
            (dataPoints.reduce((sum, d) => sum + d.formsCompleted, 0) / dataPoints.length) * 10,
          ) / 10
        : 0
    insights.push({
      label: 'Avg Forms Per Project',
      value: `${avgForms}`,
      description: 'More forms filled = deeper analysis = better outcomes',
    })
  }

  // Insight 4: ROI multiplier (if available)
  if (multiplier !== null && avgRoiHighDepth !== null && avgRoiLowDepth !== null) {
    insights.push({
      label: 'ROI Multiplier',
      value: `${multiplier}x`,
      description: `Projects with >60% depth achieve ${avgRoiHighDepth}% ROI vs ${avgRoiLowDepth}% for lower-depth projects`,
    })
  } else if (highDepth.length > 0) {
    insights.push({
      label: 'High-Depth Projects',
      value: `${highDepth.length}`,
      description: `${highDepth.length} project${highDepth.length !== 1 ? 's' : ''} exceed 60% methodology depth — add results metrics to measure ROI`,
    })
  }

  return {
    dataPoints,
    insights,
    avgRoiHighDepth,
    avgRoiLowDepth,
    multiplier,
  }
}

/* ============================================================
   getROIDashboardData
   ============================================================ */

export const getROIDashboardData = async (
  orgId: string,
  period: Period = 'this-quarter',
): Promise<ROIDashboardData> => {
  await requirePermission(orgId, 'data.view')

  const supabase = await createClient()

  const periodBounds = getPeriodBounds(period)
  const periodLabel = periodBounds?.label ?? 'All Time'

  // Fetch all projects (for measurables/depth, no period filter)
  let projectsQuery = supabase
    .from('projects')
    .select('id, title, status, completed_at, created_at')
    .eq('org_id', orgId)
    .in('status', ['completed', 'active', 'draft'])
    .order('completed_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(200)

  // For period-filtered KPIs: only projects completed within the period
  // For measurables (projected): use all projects (targets exist regardless of completion)
  // Apply period filter to completed_at when not all-time
  if (periodBounds) {
    projectsQuery = projectsQuery
      .gte('completed_at', periodBounds.start.toISOString())
      .lte('completed_at', periodBounds.end.toISOString())
  }

  const { data: projects } = await projectsQuery

  const emptyResult: ROIDashboardData = {
    totalAnnualSavings: 0,
    totalWeeklyHoursSaved: 0,
    avgRoiPercent: null,
    projectsWithRoiData: 0,
    topProjectsByImpact: [],
    monthlyTrend: [],
    totalProjectedSavings: 0,
    totalProjectedHoursSaved: 0,
    measurablesCount: 0,
    projectsWithMeasurables: 0,
    realisationRate: null,
    periodLabel,
  }

  if (!projects || projects.length === 0) {
    return emptyResult
  }

  const projectIds = projects.map((p) => p.id)

  // Fetch results_metrics, impact_metrics, problem_statement forms + distinct form counts for depth
  const [resultsFormsRes, impactFormsRes, problemStmtFormsRes, allFormsRes] = await Promise.all([
    supabase
      .from('project_forms')
      .select('project_id, form_type, data')
      .in('project_id', projectIds)
      .eq('form_type', 'results_metrics')
      .limit(1000),

    supabase
      .from('project_forms')
      .select('project_id, form_type, data')
      .in('project_id', projectIds)
      .eq('form_type', 'impact_metrics')
      .limit(1000),

    supabase
      .from('project_forms')
      .select('project_id, form_type, data')
      .in('project_id', projectIds)
      .eq('form_type', 'problem_statement')
      .limit(1000),

    supabase
      .from('project_forms')
      .select('project_id, form_type')
      .in('project_id', projectIds)
      .limit(5000),
  ])

  // Index results_metrics by project
  type ResultsEntry = {
    annualSavings: number
    weeklyHoursSaved: number
    roiPercent: number
    completedAt: string | null
  }
  const resultsByProject = new Map<string, ResultsEntry>()
  for (const f of resultsFormsRes.data ?? []) {
    if (!f.project_id) continue
    const d = f.data as ResultsMetricsData
    resultsByProject.set(f.project_id, {
      annualSavings: d.financialSavingsAnnual ?? 0,
      weeklyHoursSaved: d.timeSavedWeeklyHours ?? 0,
      roiPercent: d.roiPercent ?? 0,
      completedAt: projects.find((p) => p.id === f.project_id)?.completed_at ?? null,
    })
  }

  // Also check impact_metrics for weekly hours (pre-solution baseline)
  const impactByProject = new Map<string, ImpactMetricsData>()
  for (const f of impactFormsRes.data ?? []) {
    if (!f.project_id) continue
    impactByProject.set(f.project_id, f.data as ImpactMetricsData)
  }

  // Count distinct form types per project for depth
  const formTypesByProject = new Map<string, Set<string>>()
  for (const f of allFormsRes.data ?? []) {
    if (!f.project_id) continue
    const existing = formTypesByProject.get(f.project_id) ?? new Set<string>()
    existing.add(f.form_type)
    formTypesByProject.set(f.project_id, existing)
  }

  // Aggregate metrics
  let totalAnnualSavings = 0
  let totalWeeklyHoursSaved = 0
  const roiValues: number[] = []

  for (const [, entry] of resultsByProject) {
    totalAnnualSavings += entry.annualSavings
    totalWeeklyHoursSaved += entry.weeklyHoursSaved
    if (entry.roiPercent > 0) roiValues.push(entry.roiPercent)
  }

  const projectsWithRoiData = resultsByProject.size
  const avgRoiPercent =
    roiValues.length > 0
      ? Math.round((roiValues.reduce((a, b) => a + b, 0) / roiValues.length) * 10) / 10
      : null

  // Compute projected savings + hours from problem_statement measurables
  let totalProjectedSavings = 0
  let totalProjectedHoursSaved = 0
  let measurablesCount = 0
  const projectsWithMeasurablesSet = new Set<string>()

  for (const f of problemStmtFormsRes.data ?? []) {
    if (!f.project_id) continue
    const d = f.data as ProblemStatementData
    const measurables = d.measurables ?? []
    const hourlyRate = d.hourlyRate ?? 75

    for (const m of measurables) {
      const improvement = Math.abs(m.targetValue - m.asIsValue)
      if (improvement <= 0) continue

      measurablesCount++
      projectsWithMeasurablesSet.add(f.project_id)

      const unitLower = (m.unit ?? '').toLowerCase()

      if (unitLower.includes('hour') || unitLower.includes('hr')) {
        // Convert to annual hours based on the time period in the unit
        let annualHours = improvement
        if (unitLower.includes('/week') || unitLower.includes('week')) {
          annualHours = improvement * 52
        } else if (unitLower.includes('/day') || unitLower.includes('day')) {
          annualHours = improvement * 260
        } else if (unitLower.includes('/month') || unitLower.includes('month')) {
          annualHours = improvement * 12
        }
        // default: assume annual if no period specified
        totalProjectedHoursSaved += annualHours
        totalProjectedSavings += annualHours * hourlyRate
      } else if (
        unitLower.startsWith('$') ||
        unitLower.includes('dollar') ||
        unitLower.includes('cost') ||
        unitLower.includes('usd')
      ) {
        // Direct cost saving — assume annual
        totalProjectedSavings += improvement
      }
      // For other units (%, items, defects, etc.) we track count but not dollar value
    }
  }

  totalProjectedSavings = Math.round(totalProjectedSavings)
  totalProjectedHoursSaved = Math.round(totalProjectedHoursSaved * 10) / 10
  const projectsWithMeasurables = projectsWithMeasurablesSet.size

  // Build top projects by impact (by annual savings, or by depth if no financial data)
  type ImpactProject = {
    id: string
    title: string
    annualSavings: number
    roiPercent: number
    depthPercent: number
    cycleTimeDays: number | null
  }

  const impactProjects: ImpactProject[] = projects.map((project) => {
    const results = resultsByProject.get(project.id)
    const distinctTypes = formTypesByProject.get(project.id) ?? new Set<string>()
    const depthPercent = Math.round((distinctTypes.size / TOTAL_FORM_TYPES) * 100)

    let cycleTimeDays: number | null = null
    if (project.completed_at) {
      const start = new Date(project.created_at).getTime()
      const end = new Date(project.completed_at).getTime()
      cycleTimeDays = Math.round(((end - start) / (1000 * 60 * 60 * 24)) * 10) / 10
    }

    return {
      id: project.id,
      title: project.title,
      annualSavings: results?.annualSavings ?? 0,
      roiPercent: results?.roiPercent ?? 0,
      depthPercent,
      cycleTimeDays,
    }
  })

  // Sort: if any have financial data, sort by savings; otherwise by depth
  const hasFinancialData = impactProjects.some((p) => p.annualSavings > 0)
  const topProjectsByImpact = impactProjects
    .sort((a, b) =>
      hasFinancialData ? b.annualSavings - a.annualSavings : b.depthPercent - a.depthPercent,
    )
    .slice(0, 5)

  // Build monthly trend (cumulative savings by month of project completion)
  const monthlyMap = new Map<string, { savings: number; count: number }>()

  // Initialize from the earliest completed project to current month
  const completedProjects = projects.filter((p) => p.completed_at)
  if (completedProjects.length > 0) {
    const earliest = completedProjects
      .map((p) => new Date(p.completed_at!))
      .sort((a, b) => a.getTime() - b.getTime())[0]!

    const now = new Date()
    let cur = new Date(earliest.getFullYear(), earliest.getMonth(), 1)
    while (cur <= now) {
      monthlyMap.set(toYearMonth(cur), { savings: 0, count: 0 })
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
    }

    // Fill in savings from results_metrics, keyed by project completion month
    for (const project of completedProjects) {
      const monthKey = toYearMonth(new Date(project.completed_at!))
      const results = resultsByProject.get(project.id)
      const bucket = monthlyMap.get(monthKey)
      if (bucket) {
        bucket.savings += results?.annualSavings ?? 0
        bucket.count += 1
      }
    }
  }

  // Build cumulative trend
  let runningTotal = 0
  const monthlyTrend = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { savings, count }]) => {
      runningTotal += savings
      return {
        month: formatMonth(month),
        cumulativeSavings: runningTotal,
        projectsCompleted: count,
      }
    })

  const realisationRate =
    totalProjectedSavings > 0 && totalAnnualSavings > 0
      ? Math.round((totalAnnualSavings / totalProjectedSavings) * 100 * 10) / 10
      : null

  return {
    totalAnnualSavings,
    totalWeeklyHoursSaved,
    avgRoiPercent,
    projectsWithRoiData,
    topProjectsByImpact,
    monthlyTrend,
    totalProjectedSavings,
    totalProjectedHoursSaved,
    measurablesCount,
    projectsWithMeasurables,
    realisationRate,
    periodLabel,
  }
}

/* ============================================================
   getTeamPerformance
   ============================================================ */

export type TeamPerformance = {
  teamId: string
  teamName: string
  memberCount: number
  projectsCompleted: number
  ticketsResolved: number
  avgMethodologyDepth: number
  avgCycleTimeDays: number | null
  totalSavings: number
  formsCompleted: number
}

export const getTeamPerformance = async (orgId: string): Promise<TeamPerformance[]> => {
  await requirePermission(orgId, 'data.view')

  const supabase = await createClient()

  // Fetch all teams for the org with their members
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('org_id', orgId)
    .order('name', { ascending: true })

  if (!teams || teams.length === 0) return []

  const teamIds = teams.map((t) => t.id)

  // Fetch all team members
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('team_id, user_id')
    .in('team_id', teamIds)

  if (!teamMembers || teamMembers.length === 0) {
    return teams.map((team) => ({
      teamId: team.id,
      teamName: team.name,
      memberCount: 0,
      projectsCompleted: 0,
      ticketsResolved: 0,
      avgMethodologyDepth: 0,
      avgCycleTimeDays: null,
      totalSavings: 0,
      formsCompleted: 0,
    }))
  }

  // Build map: team → member user IDs
  const membersByTeam = new Map<string, Set<string>>()
  for (const tm of teamMembers) {
    const existing = membersByTeam.get(tm.team_id) ?? new Set<string>()
    existing.add(tm.user_id)
    membersByTeam.set(tm.team_id, existing)
  }

  // All user IDs across all teams (for fetching projects/tickets)
  const allUserIds = Array.from(new Set(teamMembers.map((tm) => tm.user_id)))

  // Fetch projects created by any team member
  const { data: projects } = await supabase
    .from('projects')
    .select('id, created_by, status, created_at, completed_at')
    .eq('org_id', orgId)
    .in('created_by', allUserIds)
    .in('status', ['completed', 'active', 'draft'])
    .limit(1000)

  // Fetch tickets assigned to any team member
  const { data: tickets } = await supabase
    .from('tickets')
    .select('assignee_id, status, project_id')
    .eq('org_id', orgId)
    .in('assignee_id', allUserIds)
    .limit(5000)

  // Fetch forms for projects relevant to team members
  const projectIds = (projects ?? []).map((p) => p.id)

  const [formsRes, resultsFormsRes] =
    projectIds.length > 0
      ? await Promise.all([
          supabase
            .from('project_forms')
            .select('project_id, form_type')
            .in('project_id', projectIds)
            .limit(5000),
          supabase
            .from('project_forms')
            .select('project_id, form_type, data')
            .in('project_id', projectIds)
            .eq('form_type', 'results_metrics')
            .limit(1000),
        ])
      : [{ data: [] }, { data: [] }]

  // Index distinct form types per project
  const formTypesByProject = new Map<string, Set<string>>()
  for (const f of formsRes.data ?? []) {
    if (!f.project_id) continue
    const existing = formTypesByProject.get(f.project_id) ?? new Set<string>()
    existing.add(f.form_type)
    formTypesByProject.set(f.project_id, existing)
  }

  // Total form count per project
  const formCountByProject = new Map<string, number>()
  for (const f of formsRes.data ?? []) {
    if (!f.project_id) continue
    formCountByProject.set(f.project_id, (formCountByProject.get(f.project_id) ?? 0) + 1)
  }

  // Savings per project from results_metrics
  const savingsByProject = new Map<string, number>()
  for (const f of resultsFormsRes.data ?? []) {
    if (!f.project_id) continue
    const d = f.data as ResultsMetricsData
    savingsByProject.set(f.project_id, d.financialSavingsAnnual ?? 0)
  }

  // Build per-team performance
  return teams.map((team) => {
    const memberUserIds = membersByTeam.get(team.id) ?? new Set<string>()
    const memberCount = memberUserIds.size

    // Projects owned by team members
    const teamProjects = (projects ?? []).filter(
      (p) => p.created_by && memberUserIds.has(p.created_by),
    )
    const completedProjects = teamProjects.filter((p) => p.status === 'completed')
    const projectsCompleted = completedProjects.length

    // Tickets resolved by team members
    const teamTickets = (tickets ?? []).filter(
      (t) => t.assignee_id && memberUserIds.has(t.assignee_id),
    )
    const ticketsResolved = teamTickets.filter((t) => t.status === 'done').length

    // Avg methodology depth across team's projects
    const depthValues = teamProjects.map((p) => {
      const distinctTypes = formTypesByProject.get(p.id)?.size ?? 0
      return Math.round((distinctTypes / TOTAL_FORM_TYPES) * 100)
    })
    const avgMethodologyDepth =
      depthValues.length > 0
        ? Math.round(depthValues.reduce((a, b) => a + b, 0) / depthValues.length)
        : 0

    // Avg cycle time for completed team projects
    const cycleTimes = completedProjects
      .map((p) => {
        if (!p.completed_at) return null
        const start = new Date(p.created_at).getTime()
        const end = new Date(p.completed_at).getTime()
        return Math.round(((end - start) / (1000 * 60 * 60 * 24)) * 10) / 10
      })
      .filter((d): d is number => d !== null)
    const avgCycleTimeDays =
      cycleTimes.length > 0
        ? Math.round((cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) * 10) / 10
        : null

    // Total savings from results_metrics across team's projects
    const totalSavings = teamProjects.reduce((sum, p) => sum + (savingsByProject.get(p.id) ?? 0), 0)

    // Total forms completed across team's projects
    const formsCompleted = teamProjects.reduce(
      (sum, p) => sum + (formCountByProject.get(p.id) ?? 0),
      0,
    )

    return {
      teamId: team.id,
      teamName: team.name,
      memberCount,
      projectsCompleted,
      ticketsResolved,
      avgMethodologyDepth,
      avgCycleTimeDays,
      totalSavings,
      formsCompleted,
    }
  })
}

/* ============================================================
   getExecutiveSummaryData
   ============================================================ */

export type ExecutiveSummaryProject = {
  id: string
  title: string
  annualSavings: number
  roiPercent: number
  depthPercent: number
  narrative: string | null
}

export type TopMeasurable = {
  projectTitle: string
  metric: string
  unit: string
  projectedAnnualSavings: number
  projectedAnnualHours: number
}

export type ExecutiveSummaryData = {
  orgName: string
  periodLabel: string
  projectsCompleted: number
  ticketsResolved: number
  /** Realised savings — from results_metrics (Step 6) */
  totalAnnualSavings: number
  totalWeeklyHoursSaved: number
  avgRoiPercent: number | null
  avgMethodologyDepth: number
  formsPerProject: number
  topProjects: ExecutiveSummaryProject[]
  multiplier: number | null
  avgRoiHighDepth: number | null
  avgRoiLowDepth: number | null
  monthlyCompletions: Array<{ month: string; count: number }>
  /** Projected savings — from problem_statement measurables (Step 1) */
  totalProjectedSavings: number
  totalProjectedHoursSaved: number
  measurablesCount: number
  topMeasurables: TopMeasurable[]
  /** Realisation rate: realised / projected * 100 */
  realisationRate: number | null
}

export const getExecutiveSummaryData = async (
  orgId: string,
  period: Period = 'this-quarter',
): Promise<ExecutiveSummaryData> => {
  await requirePermission(orgId, 'data.view')

  const supabase = await createClient()

  const periodBounds = getPeriodBounds(period)

  // Get org name
  const { data: org } = await supabase.from('organizations').select('name').eq('id', orgId).single()

  const orgName = org?.name ?? 'Your Organization'
  const periodLabel = periodBounds?.label ?? 'All Time'

  // Fetch all org projects (all time for methodology stats; period filtering done in JS below)
  const { data: allProjects } = await supabase
    .from('projects')
    .select('id, title, status, created_at, completed_at')
    .eq('org_id', orgId)
    .in('status', ['completed', 'active', 'draft'])
    .order('completed_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(500)

  if (!allProjects || allProjects.length === 0) {
    return {
      orgName,
      periodLabel,
      projectsCompleted: 0,
      ticketsResolved: 0,
      totalAnnualSavings: 0,
      totalWeeklyHoursSaved: 0,
      avgRoiPercent: null,
      avgMethodologyDepth: 0,
      formsPerProject: 0,
      topProjects: [],
      multiplier: null,
      avgRoiHighDepth: null,
      avgRoiLowDepth: null,
      monthlyCompletions: [],
      totalProjectedSavings: 0,
      totalProjectedHoursSaved: 0,
      measurablesCount: 0,
      topMeasurables: [],
      realisationRate: null,
    }
  }

  const allProjectIds = allProjects.map((p) => p.id)

  // Period-filtered projects (completed within the selected period)
  const periodProjects = allProjects.filter((p) => {
    if (p.status !== 'completed' || !p.completed_at) return false
    if (!periodBounds) return true // all-time
    const completed = new Date(p.completed_at)
    return completed >= periodBounds.start && completed <= periodBounds.end
  })

  // Fetch tickets resolved in the period
  let ticketsQuery = supabase
    .from('tickets')
    .select('id')
    .eq('org_id', orgId)
    .eq('status', 'done')
    .limit(5000)

  if (periodBounds) {
    ticketsQuery = ticketsQuery
      .gte('resolved_at', periodBounds.start.toISOString())
      .lte('resolved_at', periodBounds.end.toISOString())
  }

  const { data: periodTickets } = await ticketsQuery

  const ticketsResolved = periodTickets?.length ?? 0

  // Fetch all forms for all projects (for methodology, ROI, and measurables stats)
  const [allFormsRes, resultsFormsRes, problemStmtFormsRes] = await Promise.all([
    supabase
      .from('project_forms')
      .select('project_id, form_type')
      .in('project_id', allProjectIds)
      .limit(5000),
    supabase
      .from('project_forms')
      .select('project_id, form_type, data')
      .in('project_id', allProjectIds)
      .eq('form_type', 'results_metrics')
      .limit(1000),
    supabase
      .from('project_forms')
      .select('project_id, form_type, data')
      .in('project_id', allProjectIds)
      .eq('form_type', 'problem_statement')
      .limit(1000),
  ])

  // Index distinct form types per project (for depth)
  const formTypesByProject = new Map<string, Set<string>>()
  const formCountByProject = new Map<string, number>()
  for (const f of allFormsRes.data ?? []) {
    if (!f.project_id) continue
    const existing = formTypesByProject.get(f.project_id) ?? new Set<string>()
    existing.add(f.form_type)
    formTypesByProject.set(f.project_id, existing)
    formCountByProject.set(f.project_id, (formCountByProject.get(f.project_id) ?? 0) + 1)
  }

  // Index results_metrics by project
  const resultsByProject = new Map<
    string,
    { annualSavings: number; weeklyHoursSaved: number; roiPercent: number }
  >()
  for (const f of resultsFormsRes.data ?? []) {
    if (!f.project_id) continue
    const d = f.data as ResultsMetricsData
    resultsByProject.set(f.project_id, {
      annualSavings: d.financialSavingsAnnual ?? 0,
      weeklyHoursSaved: d.timeSavedWeeklyHours ?? 0,
      roiPercent: d.roiPercent ?? 0,
    })
  }

  // Aggregate savings/hours/roi (all projects with data)
  let totalAnnualSavings = 0
  let totalWeeklyHoursSaved = 0
  const roiValues: number[] = []
  for (const [, entry] of resultsByProject) {
    totalAnnualSavings += entry.annualSavings
    totalWeeklyHoursSaved += entry.weeklyHoursSaved
    if (entry.roiPercent > 0) roiValues.push(entry.roiPercent)
  }
  const avgRoiPercent =
    roiValues.length > 0
      ? Math.round((roiValues.reduce((a, b) => a + b, 0) / roiValues.length) * 10) / 10
      : null

  // Avg methodology depth across all projects
  const depthValues = allProjects.map((p) => {
    const distinctTypes = formTypesByProject.get(p.id)?.size ?? 0
    return Math.round((distinctTypes / TOTAL_FORM_TYPES) * 100)
  })
  const avgMethodologyDepth =
    depthValues.length > 0
      ? Math.round(depthValues.reduce((a, b) => a + b, 0) / depthValues.length)
      : 0

  // Avg forms per project
  const totalForms = Array.from(formCountByProject.values()).reduce((a, b) => a + b, 0)
  const formsPerProject =
    allProjects.length > 0 ? Math.round((totalForms / allProjects.length) * 10) / 10 : 0

  // ROI multiplier (high depth >60% vs low depth)
  const highDepthProjects = allProjects.filter((p) => {
    const distinctTypes = formTypesByProject.get(p.id)?.size ?? 0
    return Math.round((distinctTypes / TOTAL_FORM_TYPES) * 100) > 60
  })
  const lowDepthProjects = allProjects.filter((p) => {
    const distinctTypes = formTypesByProject.get(p.id)?.size ?? 0
    return Math.round((distinctTypes / TOTAL_FORM_TYPES) * 100) <= 60
  })

  const avgRoiForGroup = (group: typeof allProjects): number | null => {
    const withRoi = group.filter((p) => {
      const r = resultsByProject.get(p.id)
      return r !== undefined && r.roiPercent > 0
    })
    if (withRoi.length === 0) return null
    const sum = withRoi.reduce((s, p) => s + (resultsByProject.get(p.id)?.roiPercent ?? 0), 0)
    return Math.round((sum / withRoi.length) * 10) / 10
  }

  const avgRoiHighDepth = avgRoiForGroup(highDepthProjects)
  const avgRoiLowDepth = avgRoiForGroup(lowDepthProjects)
  const multiplier =
    avgRoiHighDepth !== null && avgRoiLowDepth !== null && avgRoiLowDepth > 0
      ? Math.round((avgRoiHighDepth / avgRoiLowDepth) * 10) / 10
      : null

  // Top 5 projects by impact (savings first, then depth)
  const hasFinancialData = allProjects.some(
    (p) => (resultsByProject.get(p.id)?.annualSavings ?? 0) > 0,
  )
  const topProjects: ExecutiveSummaryProject[] = allProjects
    .map((p) => {
      const results = resultsByProject.get(p.id)
      const distinctTypes = formTypesByProject.get(p.id)?.size ?? 0
      const depthPercent = Math.round((distinctTypes / TOTAL_FORM_TYPES) * 100)
      return {
        id: p.id,
        title: p.title,
        annualSavings: results?.annualSavings ?? 0,
        roiPercent: results?.roiPercent ?? 0,
        depthPercent,
        narrative: null,
      }
    })
    .sort((a, b) =>
      hasFinancialData ? b.annualSavings - a.annualSavings : b.depthPercent - a.depthPercent,
    )
    .slice(0, 5)

  // Monthly completions (last 6 months)
  const monthlyMap = new Map<string, number>()
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = toYearMonth(d)
    monthlyMap.set(key, 0)
  }
  for (const p of allProjects.filter((p) => p.status === 'completed' && p.completed_at)) {
    const key = toYearMonth(new Date(p.completed_at!))
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1)
    }
  }
  const monthlyCompletions = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month: formatMonth(month), count }))

  // Build projected savings from problem_statement measurables
  // Map projectId → title for measurables attribution
  const projectTitleById = new Map(allProjects.map((p) => [p.id, p.title]))

  let execTotalProjectedSavings = 0
  let execTotalProjectedHoursSaved = 0
  let execMeasurablesCount = 0

  type MeasurableWithImpact = {
    projectTitle: string
    metric: string
    unit: string
    projectedAnnualSavings: number
    projectedAnnualHours: number
  }
  const allMeasurablesWithImpact: MeasurableWithImpact[] = []

  for (const f of problemStmtFormsRes.data ?? []) {
    if (!f.project_id) continue
    const d = f.data as ProblemStatementData
    const measurables = d.measurables ?? []
    const hourlyRate = d.hourlyRate ?? 75
    const projTitle = projectTitleById.get(f.project_id) ?? 'Unknown Project'

    for (const m of measurables) {
      const improvement = Math.abs(m.targetValue - m.asIsValue)
      if (improvement <= 0) continue

      execMeasurablesCount++
      const unitLower = (m.unit ?? '').toLowerCase()
      let projectedAnnualHours = 0
      let projectedAnnualSavings = 0

      if (unitLower.includes('hour') || unitLower.includes('hr')) {
        let annualHours = improvement
        if (unitLower.includes('/week') || unitLower.includes('week')) {
          annualHours = improvement * 52
        } else if (unitLower.includes('/day') || unitLower.includes('day')) {
          annualHours = improvement * 260
        } else if (unitLower.includes('/month') || unitLower.includes('month')) {
          annualHours = improvement * 12
        }
        projectedAnnualHours = annualHours
        projectedAnnualSavings = annualHours * hourlyRate
      } else if (
        unitLower.startsWith('$') ||
        unitLower.includes('dollar') ||
        unitLower.includes('cost') ||
        unitLower.includes('usd')
      ) {
        projectedAnnualSavings = improvement
      }

      execTotalProjectedSavings += projectedAnnualSavings
      execTotalProjectedHoursSaved += projectedAnnualHours

      if (projectedAnnualSavings > 0 || projectedAnnualHours > 0) {
        allMeasurablesWithImpact.push({
          projectTitle: projTitle,
          metric: m.metric,
          unit: m.unit,
          projectedAnnualSavings: Math.round(projectedAnnualSavings),
          projectedAnnualHours: Math.round(projectedAnnualHours * 10) / 10,
        })
      }
    }
  }

  execTotalProjectedSavings = Math.round(execTotalProjectedSavings)
  execTotalProjectedHoursSaved = Math.round(execTotalProjectedHoursSaved * 10) / 10

  // Top 3 measurables by projected impact (savings first, then hours)
  const topMeasurables: TopMeasurable[] = allMeasurablesWithImpact
    .sort(
      (a, b) =>
        b.projectedAnnualSavings - a.projectedAnnualSavings ||
        b.projectedAnnualHours - a.projectedAnnualHours,
    )
    .slice(0, 3)

  const execRealisationRate =
    execTotalProjectedSavings > 0 && totalAnnualSavings > 0
      ? Math.round((totalAnnualSavings / execTotalProjectedSavings) * 100 * 10) / 10
      : null

  return {
    orgName,
    periodLabel,
    projectsCompleted: periodProjects.length,
    ticketsResolved,
    totalAnnualSavings,
    totalWeeklyHoursSaved,
    avgRoiPercent,
    avgMethodologyDepth,
    formsPerProject,
    topProjects,
    multiplier,
    avgRoiHighDepth,
    avgRoiLowDepth,
    monthlyCompletions,
    totalProjectedSavings: execTotalProjectedSavings,
    totalProjectedHoursSaved: execTotalProjectedHoursSaved,
    measurablesCount: execMeasurablesCount,
    topMeasurables,
    realisationRate: execRealisationRate,
  }
}
