'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import type { ProblemStatementData } from '@/lib/form-schemas'

/* ============================================================
   Types
   ============================================================ */

export type TimeMeasurable = {
  metric: string
  unit: string
  asIsValue: number
  targetValue: number
  hoursSaved: number
}

export type ProjectTimeSavings = {
  projectId: string
  projectTitle: string
  hoursPerYear: number
  laborValue: number
  measurables: TimeMeasurable[]
}

export type TeamTimeSavings = {
  teamName: string
  totalHours: number
  totalValue: number
}

export type TimeSavingsData = {
  totalAnnualHoursSaved: number
  totalAnnualLaborValue: number
  hourlyRate: number // org average from forms
  byProject: ProjectTimeSavings[]
  byTeam: TeamTimeSavings[]
}

/* ============================================================
   Helpers
   ============================================================ */

/**
 * Convert a time-based measurable to annualised hours.
 * Returns null if the unit is not time-based.
 */
const toAnnualHours = (unit: string, improvement: number): number | null => {
  const u = unit.toLowerCase()

  if (
    !u.includes('hour') &&
    !u.includes('hr') &&
    !u.includes('minute') &&
    !u.includes('min') &&
    !u.includes('day')
  ) {
    return null
  }

  // Normalise to hours
  let baseHours = improvement
  if (u.includes('minute') || u.includes('min')) {
    baseHours = improvement / 60
  } else if (u.includes('day') && !u.includes('/day')) {
    // "days" without a frequency — treat as days total, annualise at 260 working days
    baseHours = improvement * 8
  }

  // Apply frequency multiplier
  if (u.includes('/week') || (u.includes('week') && !u.includes('weekly'))) {
    return baseHours * 52
  }
  if (u.includes('weekly')) return baseHours * 52
  if (u.includes('/day') || u.includes('daily')) return baseHours * 260
  if (u.includes('/month') || u.includes('monthly')) return baseHours * 12
  if (u.includes('/year') || u.includes('annual') || u.includes('yearly')) return baseHours

  // Default: assume annual
  return baseHours
}

/* ============================================================
   getTimeSavings
   ============================================================ */

export const getTimeSavings = async (orgId: string): Promise<TimeSavingsData> => {
  await requirePermission(orgId, 'data.view')

  const supabase = await createClient()

  // Fetch all org projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, status, created_by')
    .eq('org_id', orgId)
    .in('status', ['completed', 'active', 'draft'])
    .order('created_at', { ascending: false })
    .limit(500)

  if (!projects || projects.length === 0) {
    return {
      totalAnnualHoursSaved: 0,
      totalAnnualLaborValue: 0,
      hourlyRate: 75,
      byProject: [],
      byTeam: [],
    }
  }

  const projectIds = projects.map((p) => p.id)

  // Fetch problem_statement forms (measurables + hourlyRate)
  const { data: psforms } = await supabase
    .from('project_forms')
    .select('project_id, data')
    .in('project_id', projectIds)
    .eq('form_type', 'problem_statement')
    .limit(1000)

  // Also fetch teams and team members so we can group by team
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('org_id', orgId)
    .order('name', { ascending: true })

  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('team_id, user_id')
    .in(
      'team_id',
      (teams ?? []).map((t) => t.id),
    )

  // Build userId → teamId map (first team wins for simplicity)
  const userTeam = new Map<string, string>()
  if (teamMembers) {
    for (const tm of teamMembers) {
      if (!userTeam.has(tm.user_id)) {
        userTeam.set(tm.user_id, tm.team_id)
      }
    }
  }

  // Build teamId → teamName map
  const teamNameById = new Map<string, string>()
  if (teams) {
    for (const t of teams) {
      teamNameById.set(t.id, t.name)
    }
  }

  // Process each project's time measurables
  const byProject: ProjectTimeSavings[] = []
  const teamHoursMap = new Map<string, number>()

  let totalHours = 0
  const hourlyRateSamples: number[] = []

  for (const f of psforms ?? []) {
    if (!f.project_id) continue
    const project = projects.find((p) => p.id === f.project_id)
    if (!project) continue

    const data = f.data as ProblemStatementData
    const hourlyRate = data.hourlyRate ?? 75
    hourlyRateSamples.push(hourlyRate)

    const measurables: TimeMeasurable[] = []

    for (const m of data.measurables ?? []) {
      const improvement = Math.abs((m.targetValue ?? 0) - (m.asIsValue ?? 0))
      if (improvement <= 0) continue

      const annualHours = toAnnualHours(m.unit ?? '', improvement)
      if (annualHours === null || annualHours <= 0) continue

      measurables.push({
        metric: m.metric,
        unit: m.unit,
        asIsValue: m.asIsValue,
        targetValue: m.targetValue,
        hoursSaved: Math.round(annualHours * 10) / 10,
      })
    }

    if (measurables.length === 0) continue

    const hoursPerYear = measurables.reduce((sum, m) => sum + m.hoursSaved, 0)
    const laborValue = hoursPerYear * hourlyRate

    totalHours += hoursPerYear

    byProject.push({
      projectId: project.id,
      projectTitle: project.title,
      hoursPerYear: Math.round(hoursPerYear * 10) / 10,
      laborValue: Math.round(laborValue),
      measurables,
    })

    // Aggregate into the project creator's team
    if (project.created_by) {
      const teamId = userTeam.get(project.created_by)
      if (teamId) {
        teamHoursMap.set(teamId, (teamHoursMap.get(teamId) ?? 0) + hoursPerYear)
      }
    }
  }

  // Sort projects by hours saved descending
  byProject.sort((a, b) => b.hoursPerYear - a.hoursPerYear)

  // Calculate org average hourly rate
  const avgHourlyRate =
    hourlyRateSamples.length > 0
      ? Math.round(hourlyRateSamples.reduce((a, b) => a + b, 0) / hourlyRateSamples.length)
      : 75

  // Build team breakdown
  const byTeam: TeamTimeSavings[] = Array.from(teamHoursMap.entries())
    .map(([teamId, hours]) => ({
      teamName: teamNameById.get(teamId) ?? 'Unknown Team',
      totalHours: Math.round(hours * 10) / 10,
      totalValue: Math.round(hours * avgHourlyRate),
    }))
    .sort((a, b) => b.totalHours - a.totalHours)

  return {
    totalAnnualHoursSaved: Math.round(totalHours * 10) / 10,
    totalAnnualLaborValue: Math.round(totalHours * avgHourlyRate),
    hourlyRate: avgHourlyRate,
    byProject,
    byTeam,
  }
}
