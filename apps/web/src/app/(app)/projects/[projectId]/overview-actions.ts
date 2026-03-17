'use server'

import { createClient } from '@/lib/supabase/server'
import {
  stepEnumToNumber,
  STEP_CONTENT,
  type PipsStepEnum,
  type PipsStepNumber,
} from '@pips/shared'
import type {
  ProblemStatementData,
  FishboneData,
  FiveWhyData,
  BrainstormingData,
  CriteriaMatrixData,
  ImplementationPlanData,
  MilestoneTrackerData,
  BeforeAfterData,
  LessonsLearnedData,
  EvaluationData,
} from '@/lib/form-schemas'

/* ============================================================
   Types
   ============================================================ */

export type ProjectStats = {
  ticketsCreated: number
  ticketsCompleted: number
  daysActive: number
}

export type ProjectMember = {
  userId: string
  displayName: string
  avatarUrl: string | null
  role: string
}

export type ProjectActivity = {
  id: string
  action: string
  entityType: string
  description: string
  createdAt: string
  userName: string | null
}

export type StepHighlight = {
  label: string
  value: string
}

export type StepSummary = {
  stepNumber: number
  highlights: StepHighlight[]
}

/* ============================================================
   getProjectStats
   ============================================================ */

export const getProjectStats = async (projectId: string): Promise<ProjectStats> => {
  const supabase = await createClient()

  const [createdRes, completedRes, projectRes] = await Promise.all([
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId),
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'done'),
    supabase.from('projects').select('created_at').eq('id', projectId).single(),
  ])

  if (createdRes.error || completedRes.error || projectRes.error) {
    console.error('Failed to fetch project stats:', {
      created: createdRes.error?.message,
      completed: completedRes.error?.message,
      project: projectRes.error?.message,
    })
    return { ticketsCreated: 0, ticketsCompleted: 0, daysActive: 1 }
  }

  const createdAt = projectRes.data?.created_at ? new Date(projectRes.data.created_at) : new Date()
  const daysActive = Math.max(
    1,
    Math.ceil((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)),
  )

  return {
    ticketsCreated: createdRes.count ?? 0,
    ticketsCompleted: completedRes.count ?? 0,
    daysActive,
  }
}

/* ============================================================
   getProjectMembers
   ============================================================ */

export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  const supabase = await createClient()

  const { data: members } = await supabase
    .from('project_members')
    .select(
      `
      user_id,
      role,
      profiles!project_members_user_id_fkey ( full_name, display_name, avatar_url )
    `,
    )
    .eq('project_id', projectId)

  if (!members || members.length === 0) return []

  return members.map((m) => {
    const profile = m.profiles as unknown as {
      full_name: string
      display_name: string | null
      avatar_url: string | null
    } | null

    return {
      userId: m.user_id,
      displayName: profile?.display_name || profile?.full_name || 'Unknown',
      avatarUrl: profile?.avatar_url ?? null,
      role: m.role,
    }
  })
}

/* ============================================================
   getProjectActivity
   ============================================================ */

export const getProjectActivity = async (
  projectId: string,
  limit = 10,
): Promise<ProjectActivity[]> => {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('audit_log')
    .select('id, action, entity_type, entity_id, new_data, user_id, created_at')
    .eq('entity_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!logs || logs.length === 0) return []

  const userIds = [...new Set(logs.map((l) => l.user_id).filter(Boolean))] as string[]
  const userMap = new Map<string, string>()

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, display_name')
      .in('id', userIds)

    if (profiles) {
      for (const p of profiles) {
        userMap.set(p.id, p.display_name || p.full_name || null)
      }
    }
  }

  return logs.map((log) => {
    const userName = log.user_id ? (userMap.get(log.user_id) ?? 'Unknown') : 'System'
    const newData = log.new_data as Record<string, unknown> | null
    const title = (newData?.title as string) ?? log.entity_type

    let description = ''
    switch (log.action) {
      case 'insert':
        description = `Created ${log.entity_type} "${title}"`
        break
      case 'update':
        description = `Updated ${log.entity_type} "${title}"`
        break
      case 'delete':
        description = `Deleted ${log.entity_type} "${title}"`
        break
      default:
        description = `${log.action} on ${log.entity_type}`
    }

    return {
      id: log.id,
      action: log.action,
      entityType: log.entity_type,
      description,
      createdAt: log.created_at,
      userName,
    }
  })
}

/* ============================================================
   getProjectProgress
   ============================================================ */

export type StepFormCount = {
  stepNumber: number
  formsStarted: number
  formsTotal: number
}

export type ProjectProgress = {
  stepsCompleted: number
  totalSteps: number
  formsStarted: number
  totalForms: number
  percentage: number
  stepFormCounts: StepFormCount[]
}

export const getProjectProgress = async (projectId: string): Promise<ProjectProgress> => {
  const supabase = await createClient()

  const [stepsRes, formsRes] = await Promise.all([
    supabase.from('project_steps').select('step, status').eq('project_id', projectId),
    supabase.from('project_forms').select('step, form_type').eq('project_id', projectId),
  ])

  const steps = stepsRes.data ?? []
  const forms = formsRes.data ?? []

  const stepsCompleted = steps.filter(
    (s) => s.status === 'completed' || s.status === 'skipped',
  ).length
  const totalSteps = 6
  const formsStarted = forms.length
  // Total possible forms across all 6 steps
  const totalForms = Object.values(STEP_CONTENT).reduce((sum, s) => sum + s.forms.length, 0)

  // Per-step form counts for stepper progress indicators
  const stepFormCounts: StepFormCount[] = ([1, 2, 3, 4, 5, 6] as PipsStepNumber[]).map(
    (stepNum) => {
      const stepContent = STEP_CONTENT[stepNum]
      const formsForStep = forms.filter(
        (f) => stepEnumToNumber(f.step as PipsStepEnum) === stepNum,
      ).length
      return {
        stepNumber: stepNum,
        formsStarted: formsForStep,
        formsTotal: stepContent.forms.length,
      }
    },
  )

  // Weight: 70% from steps, 30% from forms
  const stepPct = (stepsCompleted / totalSteps) * 70
  const formPct = totalForms > 0 ? (Math.min(formsStarted, totalForms) / totalForms) * 30 : 0
  const percentage = Math.round(stepPct + formPct)

  return { stepsCompleted, totalSteps, formsStarted, totalForms, percentage, stepFormCounts }
}

/* ============================================================
   getStepSummaries
   ============================================================ */

/** Truncate a string to maxLen, appending ellipsis if needed */
const truncate = (text: string, maxLen = 120): string => {
  if (!text || text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '...'
}

/** Extract highlights from Step 1 (Identify) form data */
const extractStep1 = (forms: FormRow[]): StepHighlight[] => {
  const highlights: StepHighlight[] = []
  const ps = forms.find((f) => f.form_type === 'problem_statement')
  if (ps) {
    const d = ps.data as unknown as ProblemStatementData
    if (d.problemStatement)
      highlights.push({ label: 'Problem Statement', value: truncate(d.problemStatement) })
    if (d.problemArea) highlights.push({ label: 'Problem Area', value: d.problemArea })
  }
  return highlights
}

/** Extract highlights from Step 2 (Analyze) form data */
const extractStep2 = (forms: FormRow[]): StepHighlight[] => {
  const highlights: StepHighlight[] = []
  const fb = forms.find((f) => f.form_type === 'fishbone')
  if (fb) {
    const d = fb.data as unknown as FishboneData
    const cats = Array.isArray(d.categories) ? d.categories : []
    const totalCauses = cats.reduce(
      (sum, cat) => sum + (Array.isArray(cat.causes) ? cat.causes.length : 0),
      0,
    )
    if (totalCauses > 0)
      highlights.push({
        label: 'Root Causes Identified',
        value: `${totalCauses} causes across ${cats.length} categories`,
      })
  }
  const fw = forms.find((f) => f.form_type === 'five_why')
  if (fw) {
    const d = fw.data as unknown as FiveWhyData
    if (d.rootCause) highlights.push({ label: 'Root Cause', value: truncate(d.rootCause) })
  }
  return highlights
}

/** Extract highlights from Step 3 (Generate) form data */
const extractStep3 = (forms: FormRow[]): StepHighlight[] => {
  const highlights: StepHighlight[] = []
  const bs = forms.find((f) => f.form_type === 'brainstorming')
  if (bs) {
    const d = bs.data as unknown as BrainstormingData
    const ideas = Array.isArray(d.ideas) ? d.ideas : []
    const selectedIds = Array.isArray(d.selectedIdeas) ? d.selectedIdeas : []
    const total = ideas.length
    const selected = selectedIds.length
    if (total > 0) highlights.push({ label: 'Ideas Generated', value: `${total} ideas` })
    if (selected > 0) {
      const topIdeas = ideas
        .filter((i) => selectedIds.includes(i.id))
        .slice(0, 3)
        .map((i) => i.text)
        .join(', ')
      highlights.push({ label: 'Top Ideas', value: truncate(topIdeas ?? '', 150) })
    }
  }
  return highlights
}

/** Extract highlights from Step 4 (Select & Plan) form data */
const extractStep4 = (forms: FormRow[]): StepHighlight[] => {
  const highlights: StepHighlight[] = []
  const cm = forms.find((f) => f.form_type === 'criteria_matrix')
  if (cm) {
    const d = cm.data as unknown as CriteriaMatrixData
    const solutions = Array.isArray(d.solutions) ? d.solutions : []
    const criteria = Array.isArray(d.criteria) ? d.criteria : []
    if (solutions.length > 0 && criteria.length > 0) {
      const totals = solutions.map((sol) =>
        criteria.reduce((sum, c) => sum + (sol.scores?.[c.name] ?? 0) * (c.weight ?? 0), 0),
      )
      const maxTotal = Math.max(...totals, 0)
      const winnerIdx = totals.indexOf(maxTotal)
      const winner = solutions[winnerIdx]
      if (winner?.name) highlights.push({ label: 'Top-Ranked Solution', value: winner.name })
    }
  }
  const ip = forms.find((f) => f.form_type === 'implementation_plan')
  if (ip) {
    const d = ip.data as unknown as ImplementationPlanData
    if (d.selectedSolution)
      highlights.push({ label: 'Selected Solution', value: truncate(d.selectedSolution) })
    const tasks = Array.isArray(d.tasks) ? d.tasks : []
    if (tasks.length > 0)
      highlights.push({ label: 'Tasks Planned', value: `${tasks.length} tasks` })
  }
  return highlights
}

/** Extract highlights from Step 5 (Implement) form data */
const extractStep5 = (forms: FormRow[]): StepHighlight[] => {
  const highlights: StepHighlight[] = []
  const mt = forms.find((f) => f.form_type === 'milestone_tracker')
  if (mt) {
    const d = mt.data as unknown as MilestoneTrackerData
    const milestones = Array.isArray(d.milestones) ? d.milestones : []
    if (milestones.length > 0) {
      const completed = milestones.filter((m) => m.status === 'completed').length
      highlights.push({
        label: 'Milestones',
        value: `${completed} of ${milestones.length} completed`,
      })
    }
    if (typeof d.overallProgress === 'number') {
      highlights.push({ label: 'Progress', value: `${d.overallProgress}%` })
    }
  }
  return highlights
}

/** Extract highlights from Step 6 (Evaluate) form data */
const extractStep6 = (forms: FormRow[]): StepHighlight[] => {
  const highlights: StepHighlight[] = []
  const ba = forms.find((f) => f.form_type === 'before_after')
  if (ba) {
    const d = ba.data as unknown as BeforeAfterData
    const metricCount = Array.isArray(d.metrics) ? d.metrics.filter((m) => m.name).length : 0
    if (metricCount > 0)
      highlights.push({ label: 'Metrics Tracked', value: `${metricCount} metrics` })
    if (d.summary) highlights.push({ label: 'Results Summary', value: truncate(d.summary) })
  }
  const ll = forms.find((f) => f.form_type === 'lessons_learned')
  if (ll) {
    const d = ll.data as unknown as LessonsLearnedData
    if (d.keyTakeaways) highlights.push({ label: 'Key Takeaways', value: truncate(d.keyTakeaways) })
  }
  const ev = forms.find((f) => f.form_type === 'evaluation')
  if (ev) {
    const d = ev.data as unknown as EvaluationData
    highlights.push({ label: 'Goals Achieved', value: d.goalsAchieved ? 'Yes' : 'No' })
    if (d.effectivenessRating)
      highlights.push({ label: 'Effectiveness', value: `${d.effectivenessRating}/5` })
  }
  return highlights
}

type FormRow = {
  step: string
  form_type: string
  data: Record<string, unknown>
}

const STEP_EXTRACTORS: Record<number, (forms: FormRow[]) => StepHighlight[]> = {
  1: extractStep1,
  2: extractStep2,
  3: extractStep3,
  4: extractStep4,
  5: extractStep5,
  6: extractStep6,
}

export const getStepSummaries = async (projectId: string): Promise<Record<number, StepSummary>> => {
  const supabase = await createClient()

  const { data: forms } = await supabase
    .from('project_forms')
    .select('step, form_type, data')
    .eq('project_id', projectId)

  if (!forms || forms.length === 0) return {}

  const grouped = new Map<number, FormRow[]>()
  for (const form of forms) {
    const stepNum = stepEnumToNumber(form.step as PipsStepEnum)
    const existing = grouped.get(stepNum) ?? []
    existing.push(form as FormRow)
    grouped.set(stepNum, existing)
  }

  const result: Record<number, StepSummary> = {}
  for (const [stepNum, stepForms] of grouped) {
    const extractor = STEP_EXTRACTORS[stepNum]
    if (!extractor) continue
    const highlights = extractor(stepForms)
    if (highlights.length > 0) {
      result[stepNum] = { stepNumber: stepNum, highlights }
    }
  }

  return result
}
