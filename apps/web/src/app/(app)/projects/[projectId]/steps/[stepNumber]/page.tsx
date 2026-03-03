import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PipsStepNumber } from '@pips/shared'
import { StepPageClient } from './step-page-client'
import { LinkedTickets } from '@/components/pips/linked-tickets'

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

  // Fetch linked tickets for Step 5 (Implement)
  type LinkedTicket = {
    id: string
    title: string
    status: string
    priority: string
    assignee: { display_name: string } | null
  }
  let linkedTickets: LinkedTicket[] = []

  if (stepNumber === 5) {
    const { data: tickets } = await supabase
      .from('tickets')
      .select(
        'id, title, status, priority, assignee:profiles!tickets_assignee_id_fkey(display_name)',
      )
      .eq('project_id', projectId)
      .eq('pips_step', 'implement')
      .order('created_at', { ascending: true })

    linkedTickets = (tickets ?? []) as unknown as LinkedTicket[]
  }

  return (
    <div className="space-y-6">
      <StepPageClient
        projectId={projectId}
        stepNumber={stepNumber}
        stepStatus={step.status as 'not_started' | 'in_progress' | 'completed' | 'skipped'}
        currentStep={project.current_step ?? 1}
        formStatuses={formStatuses}
        orgRole={orgRole}
      />
      {stepNumber === 5 && <LinkedTickets projectId={projectId} tickets={linkedTickets} />}
    </div>
  )
}

export default StepDetailPage
