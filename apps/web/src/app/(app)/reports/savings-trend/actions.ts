'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import type { ProblemStatementData, ResultsMetricsData } from '@/lib/form-schemas'

/* ============================================================
   Types
   ============================================================ */

export type MonthlySavings = {
  month: string // "2026-03"
  monthLabel: string // "Mar 2026"
  projectedSavings: number
  actualSavings: number
  projectsCompleted: number
  measurablesAdded: number
}

export type SavingsTrendData = {
  monthly: MonthlySavings[]
  totalProjected: number
  totalActual: number
  totalHoursSaved: number
  achievementRate: number | null
  savingsByCategory: Array<{
    category: string // "Time", "Cost", "Quality"
    projected: number
    actual: number
  }>
}

/* ============================================================
   Helpers
   ============================================================ */

/** Format a Date as "YYYY-MM" */
const toYearMonth = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** Format "YYYY-MM" as "MMM YYYY" for display */
const formatMonthLabel = (ym: string): string => {
  const [year, month] = ym.split('-')
  if (!year || !month) return ym
  const d = new Date(Number(year), Number(month) - 1, 1)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/** Compute annualised projected savings from a single measurable row */
const measurableToProjectedSavings = (
  unit: string,
  improvement: number,
  hourlyRate: number,
): { savings: number; hours: number; category: 'Time' | 'Cost' | 'Quality' } => {
  const unitLower = unit.toLowerCase()

  if (
    unitLower.includes('hour') ||
    unitLower.includes('hr') ||
    unitLower.includes('minute') ||
    unitLower.includes('min') ||
    unitLower.includes('day')
  ) {
    // Normalise to hours first
    let baseHours = improvement
    if (unitLower.includes('minute') || unitLower.includes('min')) {
      baseHours = improvement / 60
    } else if (unitLower.includes('day')) {
      baseHours = improvement * 8
    }

    // Then annualise by frequency
    let annualHours = baseHours
    if (unitLower.includes('/week') || unitLower.includes('week')) {
      annualHours = baseHours * 52
    } else if (unitLower.includes('/day') || unitLower.includes('day')) {
      annualHours = baseHours * 260
    } else if (unitLower.includes('/month') || unitLower.includes('month')) {
      annualHours = baseHours * 12
    }
    // default: assume annual if no period specified

    return { savings: annualHours * hourlyRate, hours: annualHours, category: 'Time' }
  }

  if (
    unitLower.startsWith('$') ||
    unitLower.includes('dollar') ||
    unitLower.includes('cost') ||
    unitLower.includes('usd')
  ) {
    return { savings: improvement, hours: 0, category: 'Cost' }
  }

  // Percentage, count, defects, etc. — tracked but not converted to $
  return { savings: 0, hours: 0, category: 'Quality' }
}

/* ============================================================
   getSavingsTrend
   ============================================================ */

export const getSavingsTrend = async (
  orgId: string,
  periodMonths?: number,
): Promise<SavingsTrendData> => {
  await requirePermission(orgId, 'data.view')

  const supabase = await createClient()

  // Build date filter
  let cutoff: Date | null = null
  if (periodMonths && periodMonths > 0) {
    cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - periodMonths)
  }

  // Fetch all org projects (completed + active)
  let projectsQuery = supabase
    .from('projects')
    .select('id, title, status, completed_at, created_at')
    .eq('org_id', orgId)
    .in('status', ['completed', 'active', 'draft'])
    .order('created_at', { ascending: true })
    .limit(500)

  if (cutoff) {
    // Filter by completed_at OR created_at within period
    projectsQuery = projectsQuery.gte('created_at', cutoff.toISOString())
  }

  const { data: projects } = await projectsQuery

  if (!projects || projects.length === 0) {
    return {
      monthly: [],
      totalProjected: 0,
      totalActual: 0,
      totalHoursSaved: 0,
      achievementRate: null,
      savingsByCategory: [
        { category: 'Time', projected: 0, actual: 0 },
        { category: 'Cost', projected: 0, actual: 0 },
        { category: 'Quality', projected: 0, actual: 0 },
      ],
    }
  }

  const projectIds = projects.map((p) => p.id)

  // Fetch problem_statement forms (for measurables / projected savings)
  // and results_metrics forms (for actual savings)
  const [problemStmtRes, resultsRes] = await Promise.all([
    supabase
      .from('project_forms')
      .select('project_id, form_type, data')
      .in('project_id', projectIds)
      .eq('form_type', 'problem_statement')
      .limit(1000),

    supabase
      .from('project_forms')
      .select('project_id, form_type, data')
      .in('project_id', projectIds)
      .eq('form_type', 'results_metrics')
      .limit(1000),
  ])

  // Index by project_id
  const problemStmtByProject = new Map<string, ProblemStatementData>()
  for (const f of problemStmtRes.data ?? []) {
    if (!f.project_id) continue
    problemStmtByProject.set(f.project_id, f.data as ProblemStatementData)
  }

  const resultsByProject = new Map<string, ResultsMetricsData>()
  for (const f of resultsRes.data ?? []) {
    if (!f.project_id) continue
    resultsByProject.set(f.project_id, f.data as ResultsMetricsData)
  }

  // Determine the month range: earliest project to now
  const now = new Date()
  const startDate = cutoff ?? new Date(projects[0]!.created_at)
  const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)

  // Build ordered month buckets
  const monthKeys: string[] = []
  let cur = new Date(startMonth)
  while (cur <= now) {
    monthKeys.push(toYearMonth(cur))
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
  }

  // Accumulate per-month data
  type MonthBucket = {
    projectedSavings: number
    actualSavings: number
    projectsCompleted: number
    measurablesAdded: number
  }
  const monthMap = new Map<string, MonthBucket>()
  for (const key of monthKeys) {
    monthMap.set(key, {
      projectedSavings: 0,
      actualSavings: 0,
      projectsCompleted: 0,
      measurablesAdded: 0,
    })
  }

  // Category totals
  let timeCatProjected = 0
  let costCatProjected = 0
  let qualityCatProjected = 0
  let timeCatActual = 0
  let costCatActual = 0
  let totalHoursSaved = 0

  let totalProjected = 0
  let totalActual = 0

  for (const project of projects) {
    // Use completed_at for the bucket if completed, otherwise created_at
    const refDate = project.completed_at
      ? new Date(project.completed_at)
      : new Date(project.created_at)
    const monthKey = toYearMonth(refDate)
    const bucket = monthMap.get(monthKey)

    // Projected savings from problem_statement measurables
    const psData = problemStmtByProject.get(project.id)
    if (psData && Array.isArray(psData.measurables)) {
      const hourlyRate = psData.hourlyRate ?? 75
      for (const m of psData.measurables) {
        const improvement = Math.abs((m.targetValue ?? 0) - (m.asIsValue ?? 0))
        if (improvement <= 0) continue

        const { savings, hours, category } = measurableToProjectedSavings(
          m.unit ?? '',
          improvement,
          hourlyRate,
        )

        totalProjected += savings
        totalHoursSaved += hours

        if (category === 'Time') timeCatProjected += savings
        else if (category === 'Cost') costCatProjected += savings
        else qualityCatProjected += savings

        if (bucket) {
          bucket.projectedSavings += savings
          bucket.measurablesAdded += 1
        }
      }
    }

    // Actual savings from results_metrics
    const resultsData = resultsByProject.get(project.id)
    if (resultsData) {
      const annualSavings = resultsData.financialSavingsAnnual ?? 0
      const weeklyHours = resultsData.timeSavedWeeklyHours ?? 0

      totalActual += annualSavings
      timeCatActual += weeklyHours * 52 * (psData?.hourlyRate ?? 75)
      costCatActual += annualSavings

      if (bucket) {
        bucket.actualSavings += annualSavings
        if (project.status === 'completed') {
          bucket.projectsCompleted += 1
        }
      }
    } else if (project.status === 'completed' && bucket) {
      bucket.projectsCompleted += 1
    }
  }

  // Build monthly array
  const monthly: MonthlySavings[] = monthKeys.map((key) => {
    const b = monthMap.get(key) ?? {
      projectedSavings: 0,
      actualSavings: 0,
      projectsCompleted: 0,
      measurablesAdded: 0,
    }
    return {
      month: key,
      monthLabel: formatMonthLabel(key),
      projectedSavings: Math.round(b.projectedSavings),
      actualSavings: Math.round(b.actualSavings),
      projectsCompleted: b.projectsCompleted,
      measurablesAdded: b.measurablesAdded,
    }
  })

  const achievementRate =
    totalProjected > 0 ? Math.round((totalActual / totalProjected) * 100) : null

  return {
    monthly,
    totalProjected: Math.round(totalProjected),
    totalActual: Math.round(totalActual),
    totalHoursSaved: Math.round(totalHoursSaved * 10) / 10,
    achievementRate,
    savingsByCategory: [
      {
        category: 'Time',
        projected: Math.round(timeCatProjected),
        actual: Math.round(timeCatActual),
      },
      {
        category: 'Cost',
        projected: Math.round(costCatProjected),
        actual: Math.round(costCatActual),
      },
      {
        category: 'Quality',
        projected: Math.round(qualityCatProjected),
        actual: 0,
      },
    ],
  }
}
