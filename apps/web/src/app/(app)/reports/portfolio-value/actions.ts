'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import type {
  ProblemStatementData,
  FishboneData,
  FiveWhyData,
  BrainstormingData,
  ImplementationPlanData,
  CriteriaMatrixData,
  BeforeAfterData,
  EvaluationData,
  LessonsLearnedData,
} from '@/lib/form-schemas'

/* ============================================================
   Types
   ============================================================ */

export type PortfolioProject = {
  id: string
  title: string
  status: string
  completedAt: string | null
  createdAt: string
  cycleTimeDays: number | null
  ticketCount: number
  ticketsCompleted: number
  formsCompleted: number
  methodologyDepthPercent: number
  narrative: string | null
  toolsUsed: string[]
  rootCausesCount: number
  ideasGenerated: number
  lessonsCount: number
}

export type PortfolioSummary = {
  totalProjects: number
  totalTicketsResolved: number
  totalFormsCompleted: number
  avgMethodologyDepth: number
  avgCycleTimeDays: number | null
  totalRootCauses: number
  totalIdeasGenerated: number
  totalLessonsDocumented: number
  projects: PortfolioProject[]
}

/* ============================================================
   Internal helpers
   ============================================================ */

const TOTAL_FORM_TYPES = 25

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  problem_statement: 'Problem Statement',
  impact_assessment: 'Impact Assessment',
  list_reduction: 'List Reduction',
  weighted_voting: 'Weighted Voting',
  fishbone: 'Fishbone Diagram',
  five_why: '5-Why Analysis',
  force_field: 'Force Field Analysis',
  checksheet: 'Check Sheet',
  pareto: 'Pareto Chart',
  brainstorming: 'Brainstorming',
  brainwriting: 'Brainwriting',
  interviewing: 'Stakeholder Interviews',
  surveying: 'Survey',
  criteria_matrix: 'Criteria Matrix',
  paired_comparisons: 'Paired Comparisons',
  raci: 'RACI Chart',
  implementation_plan: 'Implementation Plan',
  balance_sheet: 'Balance Sheet',
  cost_benefit: 'Cost-Benefit Analysis',
  milestone_tracker: 'Milestone Tracker',
  implementation_checklist: 'Implementation Checklist',
  before_after: 'Before & After Comparison',
  evaluation: 'Evaluation',
  lessons_learned: 'Lessons Learned',
  brainwriting_605: 'Brainwriting 6-3-5',
}

type RawForm = {
  form_type: string
  data: Record<string, unknown>
}

/** Build a short narrative string from a project's forms. */
const buildNarrative = (forms: RawForm[]): string => {
  const parts: string[] = []

  const ps = forms.find((f) => f.form_type === 'problem_statement')
  if (ps) {
    const d = ps.data as ProblemStatementData
    const stmt = d.problemStatement?.trim()
    if (stmt) {
      const truncated = stmt.length > 120 ? stmt.slice(0, 120).trimEnd() + '...' : stmt
      parts.push(`Identified: ${truncated}.`)
    }
  }

  const analysisTools = forms
    .filter(
      (f) =>
        f.form_type === 'fishbone' || f.form_type === 'five_why' || f.form_type === 'force_field',
    )
    .map((f) => TOOL_DISPLAY_NAMES[f.form_type] ?? f.form_type)

  const rootCausesCount = extractRootCausesCount(forms)
  if (rootCausesCount > 0 && analysisTools.length > 0) {
    parts.push(
      `Analyzed ${rootCausesCount} root cause${rootCausesCount !== 1 ? 's' : ''} using ${analysisTools.join(' and ')}.`,
    )
  } else if (analysisTools.length > 0) {
    parts.push(`Conducted root cause analysis using ${analysisTools.join(' and ')}.`)
  }

  const ideasGenerated = extractIdeasGenerated(forms)
  if (ideasGenerated > 0) {
    parts.push(`Generated ${ideasGenerated} solution idea${ideasGenerated !== 1 ? 's' : ''}.`)
  }

  const solutionSelected = extractSolutionSelected(forms)
  if (solutionSelected) {
    parts.push(`Selected solution: "${solutionSelected}".`)
  }

  const evalForm = forms.find((f) => f.form_type === 'evaluation')
  let outcome: string | null = null
  if (evalForm) {
    const d = evalForm.data as EvaluationData
    if (d.goalDetails?.trim()) outcome = d.goalDetails.trim()
  }
  if (!outcome) {
    const baForm = forms.find((f) => f.form_type === 'before_after')
    if (baForm) {
      const d = baForm.data as BeforeAfterData
      if (d.summary?.trim()) outcome = d.summary.trim()
    }
  }
  if (outcome) {
    const truncated = outcome.length > 150 ? outcome.slice(0, 150).trimEnd() + '...' : outcome
    parts.push(truncated)
  }

  const lessonsCount = extractLessonsCount(forms)
  if (lessonsCount > 0) {
    parts.push(`${lessonsCount} lesson${lessonsCount !== 1 ? 's' : ''} documented.`)
  }

  return parts.length > 0 ? parts.join(' ') : `${forms.length} methodology forms completed.`
}

const extractRootCausesCount = (forms: RawForm[]): number => {
  let count = 0
  const fishboneForm = forms.find((f) => f.form_type === 'fishbone')
  if (fishboneForm) {
    const d = fishboneForm.data as FishboneData
    const cats = Array.isArray(d.categories) ? d.categories : []
    count += cats.reduce(
      (sum, cat) =>
        sum + (Array.isArray(cat.causes) ? cat.causes.filter((c) => c.text?.trim()).length : 0),
      0,
    )
  }
  const fiveWhyForm = forms.find((f) => f.form_type === 'five_why')
  if (fiveWhyForm && !fishboneForm) {
    const d = fiveWhyForm.data as FiveWhyData
    const answeredWhys = Array.isArray(d.whys) ? d.whys.filter((w) => w.answer?.trim()).length : 0
    count += answeredWhys
  }
  return count
}

const extractIdeasGenerated = (forms: RawForm[]): number => {
  const brainstormForm = forms.find((f) => f.form_type === 'brainstorming')
  if (!brainstormForm) return 0
  const d = brainstormForm.data as BrainstormingData
  return Array.isArray(d.ideas) ? d.ideas.length : 0
}

const extractSolutionSelected = (forms: RawForm[]): string | null => {
  const criteriaForm = forms.find((f) => f.form_type === 'criteria_matrix')
  if (criteriaForm) {
    const d = criteriaForm.data as CriteriaMatrixData
    const solutions = Array.isArray(d.solutions) ? d.solutions : []
    const criteria = Array.isArray(d.criteria) ? d.criteria : []
    if (solutions.length > 0 && criteria.length > 0) {
      const totals = solutions.map((sol) =>
        criteria.reduce((sum, c) => sum + (sol.scores?.[c.name] ?? 0) * (c.weight ?? 0), 0),
      )
      const maxIdx = totals.indexOf(Math.max(...totals))
      return solutions[maxIdx]?.name ?? null
    }
  }
  const ipForm = forms.find((f) => f.form_type === 'implementation_plan')
  if (ipForm) {
    const d = ipForm.data as ImplementationPlanData
    return d.selectedSolution?.trim() || null
  }
  return null
}

const extractLessonsCount = (forms: RawForm[]): number => {
  const llForm = forms.find((f) => f.form_type === 'lessons_learned')
  if (!llForm) return 0
  const d = llForm.data as LessonsLearnedData
  const wellCount = Array.isArray(d.wentWell) ? d.wentWell.filter((s) => s?.trim()).length : 0
  const improveCount = Array.isArray(d.improvements)
    ? d.improvements.filter((s) => s?.trim()).length
    : 0
  const total = wellCount + improveCount
  if (total === 0 && d.keyTakeaways?.trim()) return 1
  return total
}

/* ============================================================
   Main export
   ============================================================ */

export const getPortfolioValue = async (orgId: string): Promise<PortfolioSummary> => {
  await requirePermission(orgId, 'data.view')

  const supabase = await createClient()

  // Fetch all projects (completed first, then active/draft)
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
      totalProjects: 0,
      totalTicketsResolved: 0,
      totalFormsCompleted: 0,
      avgMethodologyDepth: 0,
      avgCycleTimeDays: null,
      totalRootCauses: 0,
      totalIdeasGenerated: 0,
      totalLessonsDocumented: 0,
      projects: [],
    }
  }

  const projectIds = projects.map((p) => p.id)

  // Parallel fetch: tickets + forms
  const [ticketsRes, formsRes] = await Promise.all([
    supabase
      .from('tickets')
      .select('project_id, status')
      .in('project_id', projectIds)
      .limit(5000),
    supabase
      .from('project_forms')
      .select('project_id, form_type, data')
      .in('project_id', projectIds)
      .limit(5000),
  ])

  // Index tickets by project
  const ticketsByProject = new Map<string, { total: number; completed: number }>()
  for (const t of ticketsRes.data ?? []) {
    if (!t.project_id) continue
    const entry = ticketsByProject.get(t.project_id) ?? { total: 0, completed: 0 }
    entry.total += 1
    if (t.status === 'done') entry.completed += 1
    ticketsByProject.set(t.project_id, entry)
  }

  // Index forms by project
  const formsByProject = new Map<string, RawForm[]>()
  for (const f of formsRes.data ?? []) {
    if (!f.project_id) continue
    const existing = formsByProject.get(f.project_id) ?? []
    existing.push({ form_type: f.form_type, data: f.data as Record<string, unknown> })
    formsByProject.set(f.project_id, existing)
  }

  // Build per-project data
  const portfolioProjects: PortfolioProject[] = projects.map((project) => {
    const createdAt = new Date(project.created_at)
    const completedAt = project.completed_at ? new Date(project.completed_at) : null
    const cycleTimeDays =
      completedAt !== null
        ? Math.round(
            ((completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) * 10,
          ) / 10
        : null

    const forms = formsByProject.get(project.id) ?? []
    const tickets = ticketsByProject.get(project.id) ?? { total: 0, completed: 0 }

    const distinctFormTypes = new Set(forms.map((f) => f.form_type)).size
    const methodologyDepthPercent = Math.round((distinctFormTypes / TOTAL_FORM_TYPES) * 100)

    const toolsUsed = forms
      .map((f) => TOOL_DISPLAY_NAMES[f.form_type] ?? f.form_type)
      .filter(Boolean)

    const rootCausesCount = extractRootCausesCount(forms)
    const ideasGenerated = extractIdeasGenerated(forms)
    const lessonsCount = extractLessonsCount(forms)
    const narrative = forms.length > 0 ? buildNarrative(forms) : null

    return {
      id: project.id,
      title: project.title,
      status: project.status,
      completedAt: project.completed_at ?? null,
      createdAt: project.created_at,
      cycleTimeDays,
      ticketCount: tickets.total,
      ticketsCompleted: tickets.completed,
      formsCompleted: forms.length,
      methodologyDepthPercent,
      narrative,
      toolsUsed,
      rootCausesCount,
      ideasGenerated,
      lessonsCount,
    }
  })

  // Aggregate summary stats
  const totalProjects = portfolioProjects.length
  const totalTicketsResolved = portfolioProjects.reduce((sum, p) => sum + p.ticketsCompleted, 0)
  const totalFormsCompleted = portfolioProjects.reduce((sum, p) => sum + p.formsCompleted, 0)
  const totalRootCauses = portfolioProjects.reduce((sum, p) => sum + p.rootCausesCount, 0)
  const totalIdeasGenerated = portfolioProjects.reduce((sum, p) => sum + p.ideasGenerated, 0)
  const totalLessonsDocumented = portfolioProjects.reduce((sum, p) => sum + p.lessonsCount, 0)

  const depthValues = portfolioProjects.map((p) => p.methodologyDepthPercent)
  const avgMethodologyDepth =
    depthValues.length > 0
      ? Math.round(depthValues.reduce((a, b) => a + b, 0) / depthValues.length)
      : 0

  const cycleTimes = portfolioProjects.map((p) => p.cycleTimeDays).filter((d): d is number => d !== null)
  const avgCycleTimeDays =
    cycleTimes.length > 0
      ? Math.round((cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) * 10) / 10
      : null

  return {
    totalProjects,
    totalTicketsResolved,
    totalFormsCompleted,
    avgMethodologyDepth,
    avgCycleTimeDays,
    totalRootCauses,
    totalIdeasGenerated,
    totalLessonsDocumented,
    projects: portfolioProjects,
  }
}
