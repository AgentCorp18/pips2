'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { PIPS_STEPS, stepEnumToNumber } from '@pips/shared'
import type { ProjectPDFData, StepPDFData, TicketSummaryPDFData, MemberPDFData } from '@/lib/pdf'
import type { OnePagerData, OnePagerStepData } from '@/lib/pdf-one-pager'

/* ============================================================
   Types
   ============================================================ */

type PDFDataResult = {
  data?: ProjectPDFData
  error?: string
}

type OnePagerDataResult = {
  data?: OnePagerData
  error?: string
}

/* ============================================================
   getProjectPDFData
   ============================================================ */

/**
 * Fetch all data needed to generate a project PDF summary.
 *
 * Requires `data.view` permission (viewer+).
 */
export const getProjectPDFData = async (projectId: string): Promise<PDFDataResult> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Fetch project with related data
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(
      `
      id, title, description, status, current_step,
      target_completion_date, created_at, org_id,
      profiles!projects_owner_id_fkey ( display_name ),
      project_steps ( step_number, status ),
      project_members (
        role,
        profiles!project_members_user_id_fkey ( display_name )
      )
    `,
    )
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    return { error: 'Project not found' }
  }

  // Check permission — viewer+ can export
  try {
    await requirePermission(project.org_id, 'data.view')
  } catch {
    return { error: 'Insufficient permissions to export project data' }
  }

  // Fetch ticket counts by status
  const [totalRes, openRes, inProgressRes, reviewRes, doneRes, blockedRes] = await Promise.all([
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId),
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'open'),
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'in_progress'),
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'review'),
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'done'),
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'blocked'),
  ])

  // Fetch Step 1 problem statement form data
  const { data: formData } = await supabase
    .from('project_forms')
    .select('data')
    .eq('project_id', projectId)
    .eq('step_number', 1)
    .eq('form_type', 'problem_statement')
    .single()

  // Extract problem statement text from form JSONB
  const formPayload = formData?.data as Record<string, unknown> | null
  let problemStatement: string | null = null
  if (formPayload) {
    // Try common field names that might hold the statement text
    const candidate =
      formPayload.problemStatement ??
      formPayload.problem_statement ??
      formPayload.statement ??
      formPayload.description ??
      formPayload.asIs ??
      formPayload.gap
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      problemStatement = candidate.trim()
    }
  }

  // Build owner name
  const profilesRaw = project.profiles as unknown
  const ownerProfile = Array.isArray(profilesRaw)
    ? ((profilesRaw[0] as { display_name: string } | undefined) ?? null)
    : (profilesRaw as { display_name: string } | null)

  // Build step progress
  const rawSteps = (project.project_steps ?? []) as Array<{
    step_number: number
    status: string
  }>

  const steps: StepPDFData[] = PIPS_STEPS.map((pipsStep) => {
    const match = rawSteps.find((s) => s.step_number === pipsStep.number)
    return {
      number: pipsStep.number,
      name: pipsStep.name,
      status: (match?.status ?? 'not_started') as StepPDFData['status'],
    }
  })

  // Build ticket summary
  const tickets: TicketSummaryPDFData = {
    total: totalRes.count ?? 0,
    open: openRes.count ?? 0,
    inProgress: inProgressRes.count ?? 0,
    review: reviewRes.count ?? 0,
    done: doneRes.count ?? 0,
    blocked: blockedRes.count ?? 0,
  }

  // Build members list
  const rawMembers = (project.project_members ?? []) as unknown as Array<{
    role: string
    profiles: unknown
  }>

  const members: MemberPDFData[] = rawMembers.map((m) => {
    const profilesRaw = m.profiles as unknown
    const profile = Array.isArray(profilesRaw)
      ? ((profilesRaw[0] as { display_name: string } | undefined) ?? null)
      : (profilesRaw as { display_name: string } | null)
    return {
      displayName: profile?.display_name ?? 'Unknown',
      role: m.role,
    }
  })

  const currentStepDef = PIPS_STEPS.find((s) => s.number === (project.current_step ?? 1))

  const data: ProjectPDFData = {
    name: project.title as string,
    description: project.description ?? null,
    status: project.status ?? 'active',
    currentStep: project.current_step ?? 1,
    currentStepName: currentStepDef?.name ?? 'Unknown',
    createdAt: project.created_at,
    targetDate: project.target_completion_date ?? null,
    ownerName: ownerProfile?.display_name ?? 'Unassigned',
    problemStatement,
    steps,
    tickets,
    members,
  }

  return { data }
}

/* ============================================================
   getOnePagerData
   ============================================================ */

/** Form types relevant to each step for the one-pager summary */
const STEP_FORM_TYPES: Record<number, string[]> = {
  1: ['problem_statement', 'impact_assessment'],
  2: ['fishbone', 'five_why', 'force_field'],
  3: ['brainstorming', 'brainwriting'],
  4: ['criteria_matrix', 'implementation_plan'],
  5: ['milestone_tracker', 'implementation_checklist'],
  6: ['before_after', 'evaluation', 'lessons_learned'],
}

/** Extract summary lines from form data for a given form type */
const extractFormSummary = (formType: string, payload: Record<string, unknown>): string[] => {
  const lines: string[] = []
  const str = (key: string): string => {
    const v = payload[key]
    return typeof v === 'string' ? v.trim() : ''
  }

  switch (formType) {
    case 'problem_statement': {
      if (str('problemStatement')) lines.push(`Problem: ${str('problemStatement')}`)
      if (str('gap')) lines.push(`Gap: ${str('gap')}`)
      if (str('problemArea')) lines.push(`Area: ${str('problemArea')}`)
      break
    }
    case 'impact_assessment': {
      const rpn = payload.riskPriorityNumber
      if (typeof rpn === 'number' && rpn > 1) lines.push(`Risk Priority Number: ${rpn}`)
      if (str('financialImpact')) lines.push(`Financial Impact: ${str('financialImpact')}`)
      break
    }
    case 'fishbone': {
      const cats = payload.categories as
        | Array<{ name: string; causes: Array<{ text: string }> }>
        | undefined
      if (cats) {
        const topCauses = cats
          .flatMap((c) => c.causes.filter((cause) => cause.text.trim()))
          .slice(0, 3)
        if (topCauses.length > 0) {
          lines.push(`Key Causes: ${topCauses.map((c) => c.text).join('; ')}`)
        }
      }
      break
    }
    case 'five_why': {
      if (str('rootCause')) lines.push(`Root Cause: ${str('rootCause')}`)
      break
    }
    case 'force_field': {
      if (str('strategy')) lines.push(`Strategy: ${str('strategy')}`)
      break
    }
    case 'brainstorming': {
      const ideas = payload.ideas as Array<{ id: string; text: string }> | undefined
      const selected = payload.selectedIdeas as string[] | undefined
      if (ideas && ideas.length > 0) {
        lines.push(`Ideas Generated: ${ideas.length}`)
        if (selected && selected.length > 0) {
          const selectedTexts = ideas
            .filter((i) => selected.includes(i.id))
            .map((i) => i.text)
            .slice(0, 3)
          if (selectedTexts.length > 0) {
            lines.push(`Selected: ${selectedTexts.join('; ')}`)
          }
        }
      }
      break
    }
    case 'brainwriting': {
      const allIdeas = payload.allIdeas as string[] | undefined
      if (allIdeas && allIdeas.length > 0) {
        lines.push(`Ideas Generated: ${allIdeas.length}`)
      }
      break
    }
    case 'criteria_matrix': {
      const solutions = payload.solutions as
        | Array<{
            name: string
            scores: Record<string, number>
          }>
        | undefined
      const criteria = payload.criteria as
        | Array<{
            name: string
            weight: number
          }>
        | undefined
      if (solutions && criteria && solutions.length > 0) {
        const totals = solutions.map((s) => ({
          name: s.name,
          total: criteria.reduce((sum, c) => sum + (s.scores[c.name] ?? 0) * c.weight, 0),
        }))
        const winner = totals.reduce((a, b) => (b.total > a.total ? b : a), totals[0]!)
        if (winner && winner.total > 0) {
          lines.push(`Top Solution: ${winner.name} (score: ${winner.total})`)
        }
        lines.push(`Solutions Evaluated: ${solutions.length}`)
      }
      break
    }
    case 'implementation_plan': {
      if (str('selectedSolution')) lines.push(`Solution: ${str('selectedSolution')}`)
      const tasks = payload.tasks as Array<{ status: string }> | undefined
      if (tasks && tasks.length > 0) {
        const completed = tasks.filter((t) => t.status === 'completed').length
        lines.push(`Tasks: ${completed}/${tasks.length} completed`)
      }
      if (str('timeline')) lines.push(`Timeline: ${str('timeline')}`)
      break
    }
    case 'milestone_tracker': {
      const milestones = payload.milestones as Array<{ title: string; status: string }> | undefined
      const progress = payload.overallProgress
      if (milestones && milestones.length > 0) {
        const completed = milestones.filter((m) => m.status === 'completed').length
        lines.push(`Milestones: ${completed}/${milestones.length} completed`)
      }
      if (typeof progress === 'number' && progress > 0) {
        lines.push(`Overall Progress: ${progress}%`)
      }
      break
    }
    case 'implementation_checklist': {
      const items = payload.items as Array<{ completed: boolean }> | undefined
      if (items && items.length > 0) {
        const done = items.filter((i) => i.completed).length
        lines.push(`Checklist: ${done}/${items.length} items completed`)
      }
      break
    }
    case 'before_after': {
      const metrics = payload.metrics as
        | Array<{
            name: string
            improvement: string
          }>
        | undefined
      if (metrics) {
        const withData = metrics.filter((m) => m.name.trim() && m.improvement.trim())
        for (const m of withData.slice(0, 3)) {
          lines.push(`${m.name}: ${m.improvement}`)
        }
      }
      if (str('summary')) lines.push(`Summary: ${str('summary')}`)
      break
    }
    case 'evaluation': {
      const goalsAchieved = payload.goalsAchieved
      if (typeof goalsAchieved === 'boolean') {
        lines.push(`Goals Achieved: ${goalsAchieved ? 'Yes' : 'No'}`)
      }
      if (str('goalDetails')) lines.push(`Details: ${str('goalDetails')}`)
      if (str('nextSteps')) lines.push(`Next Steps: ${str('nextSteps')}`)
      break
    }
    case 'lessons_learned': {
      if (str('keyTakeaways')) lines.push(`Key Takeaways: ${str('keyTakeaways')}`)
      const wentWell = payload.wentWell as string[] | undefined
      if (wentWell) {
        const filled = wentWell.filter(Boolean)
        if (filled.length > 0) lines.push(`Went Well: ${filled.slice(0, 2).join('; ')}`)
      }
      break
    }
  }

  return lines
}

/**
 * Fetch all data needed to generate a PIPS one-pager PDF.
 *
 * Requires `data.view` permission (viewer+).
 */
export const getOnePagerData = async (projectId: string): Promise<OnePagerDataResult> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Fetch project with related data
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(
      `
      id, title, description, status, current_step,
      target_end, created_at, org_id,
      profiles!projects_owner_id_fkey ( display_name ),
      organizations ( name ),
      project_steps ( step, status ),
      project_members (
        role,
        profiles!project_members_user_id_fkey ( display_name )
      )
    `,
    )
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    return { error: 'Project not found' }
  }

  // Check permission
  try {
    await requirePermission(project.org_id, 'data.view')
  } catch {
    return { error: 'Insufficient permissions to export project data' }
  }

  // Fetch all form data for this project
  const { data: allForms } = await supabase
    .from('project_forms')
    .select('step, form_type, data')
    .eq('project_id', projectId)

  // Build step status map
  const rawSteps = (project.project_steps ?? []) as Array<{
    step: string
    status: string
  }>

  const stepStatusMap = new Map<number, string>()
  for (const rs of rawSteps) {
    const num = stepEnumToNumber(rs.step)
    stepStatusMap.set(num, rs.status)
  }

  // Build form data by step number
  const formsByStep = new Map<number, Array<{ form_type: string; data: Record<string, unknown> }>>()
  if (allForms) {
    for (const form of allForms) {
      const stepNum = stepEnumToNumber(form.step as string)
      const existing = formsByStep.get(stepNum) ?? []
      existing.push({
        form_type: form.form_type as string,
        data: (form.data as Record<string, unknown>) ?? {},
      })
      formsByStep.set(stepNum, existing)
    }
  }

  // Build step summaries
  const steps: OnePagerStepData[] = PIPS_STEPS.map((pipsStep) => {
    const status = (stepStatusMap.get(pipsStep.number) ??
      'not_started') as OnePagerStepData['status']
    const forms = formsByStep.get(pipsStep.number) ?? []
    const relevantFormTypes = STEP_FORM_TYPES[pipsStep.number] ?? []

    const summary: string[] = []
    for (const formType of relevantFormTypes) {
      const form = forms.find((f) => f.form_type === formType)
      if (form) {
        summary.push(...extractFormSummary(formType, form.data))
      }
    }

    return {
      number: pipsStep.number,
      name: pipsStep.name,
      color: pipsStep.color,
      status,
      summary,
    }
  })

  // Build owner name
  const profilesRaw = project.profiles as unknown
  const ownerProfile = Array.isArray(profilesRaw)
    ? ((profilesRaw[0] as { display_name: string } | undefined) ?? null)
    : (profilesRaw as { display_name: string } | null)

  // Build org name
  const orgRaw = project.organizations as unknown
  const org = Array.isArray(orgRaw)
    ? ((orgRaw[0] as { name: string } | undefined) ?? null)
    : (orgRaw as { name: string } | null)

  // Build members list
  const rawMembers = (project.project_members ?? []) as unknown as Array<{
    role: string
    profiles: unknown
  }>

  const members = rawMembers.map((m) => {
    const pRaw = m.profiles as unknown
    const profile = Array.isArray(pRaw)
      ? ((pRaw[0] as { display_name: string } | undefined) ?? null)
      : (pRaw as { display_name: string } | null)
    return {
      displayName: profile?.display_name ?? 'Unknown',
      role: m.role,
    }
  })

  const onePagerData: OnePagerData = {
    projectName: project.title as string,
    orgName: org?.name ?? '',
    description: project.description ?? null,
    ownerName: ownerProfile?.display_name ?? 'Unassigned',
    createdAt: project.created_at,
    targetDate: (project.target_end as string) ?? null,
    status: project.status ?? 'active',
    steps,
    members,
  }

  return { data: onePagerData }
}
