'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import type { ResultsMetricsData, ImpactMetricsData } from '@/lib/form-schemas'

/* ============================================================
   Types
   ============================================================ */

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
  totalAnnualSavings: number
  totalWeeklyHoursSaved: number
  avgRoiPercent: number | null
  projectsWithRoiData: number
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

export const getROIDashboardData = async (orgId: string): Promise<ROIDashboardData> => {
  await requirePermission(orgId, 'data.view')

  const supabase = await createClient()

  // Fetch all projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, status, completed_at, created_at')
    .eq('org_id', orgId)
    .in('status', ['completed', 'active', 'draft'])
    .order('completed_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(200)

  if (!projects || projects.length === 0) {
    return {
      totalAnnualSavings: 0,
      totalWeeklyHoursSaved: 0,
      avgRoiPercent: null,
      projectsWithRoiData: 0,
      topProjectsByImpact: [],
      monthlyTrend: [],
    }
  }

  const projectIds = projects.map((p) => p.id)

  // Fetch results_metrics and impact_metrics forms + distinct form counts for depth
  const [resultsFormsRes, impactFormsRes, allFormsRes] = await Promise.all([
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

  return {
    totalAnnualSavings,
    totalWeeklyHoursSaved,
    avgRoiPercent,
    projectsWithRoiData,
    topProjectsByImpact,
    monthlyTrend,
  }
}
