/**
 * Public (unauthenticated) version of getExecutiveSummaryData.
 *
 * Uses the Supabase admin client (service role) because:
 * 1. The caller is not authenticated — they have a signed share token instead.
 * 2. Token validation already confirmed the orgId is legitimate.
 * 3. We intentionally bypass RLS here — same pattern as onboarding.
 *
 * SECURITY: Only call this function after validateShareToken() succeeds.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { ExecutiveSummaryData } from '@/app/(app)/reports/roi-dashboard/actions'
import { getPeriodBounds, PERIOD_LABELS } from '@/app/(app)/reports/roi-dashboard/actions'
import type { Period } from '@/app/(app)/reports/roi-dashboard/actions'
import type { ResultsMetricsData, ProblemStatementData } from '@/lib/form-schemas'

const TOTAL_FORM_TYPES = 25

const toYearMonth = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

const formatMonth = (ym: string): string => {
  const [year, month] = ym.split('-')
  if (!year || !month) return ym
  const d = new Date(Number(year), Number(month) - 1, 1)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export const getExecutiveSummaryPublic = async (
  orgId: string,
  period: Period,
): Promise<ExecutiveSummaryData> => {
  const supabase = createAdminClient()

  const periodBounds = getPeriodBounds(period)

  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', orgId)
    .single()

  const orgName = org?.name ?? 'Your Organization'
  const periodLabel = periodBounds?.label ?? PERIOD_LABELS[period] ?? 'All Time'

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

  const periodProjects = allProjects.filter((p) => {
    if (p.status !== 'completed' || !p.completed_at) return false
    if (!periodBounds) return true
    const completed = new Date(p.completed_at)
    return completed >= periodBounds.start && completed <= periodBounds.end
  })

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

  const formTypesByProject = new Map<string, Set<string>>()
  const formCountByProject = new Map<string, number>()
  for (const f of allFormsRes.data ?? []) {
    if (!f.project_id) continue
    const existing = formTypesByProject.get(f.project_id) ?? new Set<string>()
    existing.add(f.form_type)
    formTypesByProject.set(f.project_id, existing)
    formCountByProject.set(f.project_id, (formCountByProject.get(f.project_id) ?? 0) + 1)
  }

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

  const depthValues = allProjects.map((p) => {
    const distinctTypes = formTypesByProject.get(p.id)?.size ?? 0
    return Math.round((distinctTypes / TOTAL_FORM_TYPES) * 100)
  })
  const avgMethodologyDepth =
    depthValues.length > 0
      ? Math.round(depthValues.reduce((a, b) => a + b, 0) / depthValues.length)
      : 0

  const totalForms = Array.from(formCountByProject.values()).reduce((a, b) => a + b, 0)
  const formsPerProject =
    allProjects.length > 0 ? Math.round((totalForms / allProjects.length) * 10) / 10 : 0

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

  const hasFinancialData = allProjects.some(
    (p) => (resultsByProject.get(p.id)?.annualSavings ?? 0) > 0,
  )
  const topProjects = allProjects
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

  const monthlyMap = new Map<string, number>()
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthlyMap.set(toYearMonth(d), 0)
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

  const topMeasurables = allMeasurablesWithImpact
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
