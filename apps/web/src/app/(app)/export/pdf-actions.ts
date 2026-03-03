'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { PIPS_STEPS } from '@pips/shared'
import type { ProjectPDFData, StepPDFData, TicketSummaryPDFData, MemberPDFData } from '@/lib/pdf'

/* ============================================================
   Types
   ============================================================ */

type PDFDataResult = {
  data?: ProjectPDFData
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
