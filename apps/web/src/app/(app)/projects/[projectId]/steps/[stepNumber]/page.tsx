import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PipsStepNumber } from '@pips/shared'
import { StepPageClient } from './step-page-client'

const isValidStepNumber = (n: number): n is PipsStepNumber =>
  n >= 1 && n <= 6 && Number.isInteger(n)

const StepDetailPage = async ({
  params,
}: {
  params: Promise<{ projectId: string; stepNumber: string }>
}) => {
  const { projectId, stepNumber: stepNumStr } = await params
  const stepNumber = parseInt(stepNumStr, 10)

  if (!isValidStepNumber(stepNumber)) {
    notFound()
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch project
  const { data: project } = await supabase
    .from('projects')
    .select('id, org_id, current_step, status')
    .eq('id', projectId)
    .single()

  if (!project) {
    notFound()
  }

  // Fetch step data
  const { data: step } = await supabase
    .from('project_steps')
    .select('id, step_number, status, started_at, completed_at')
    .eq('project_id', projectId)
    .eq('step_number', stepNumber)
    .single()

  if (!step) {
    notFound()
  }

  // Fetch form data for this step
  const { data: forms } = await supabase
    .from('project_forms')
    .select('id, form_type, data')
    .eq('project_id', projectId)
    .eq('step_number', stepNumber)

  const formStatuses = (forms ?? []).map((f) => ({
    form_type: f.form_type,
    started: Object.keys(f.data as Record<string, unknown>).length > 0,
  }))

  // Get user's org role for permission checks
  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const orgRole = (membership?.role as string) ?? null

  return (
    <StepPageClient
      projectId={projectId}
      stepNumber={stepNumber}
      stepStatus={step.status as 'not_started' | 'in_progress' | 'completed' | 'skipped'}
      currentStep={project.current_step ?? 1}
      formStatuses={formStatuses}
      orgRole={orgRole}
    />
  )
}

export default StepDetailPage
