'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { trackServerEvent } from '@/lib/analytics'

type CreateTicketInput = {
  projectId: string
  stepNumber: number
  title: string
  description: string
  priority: string
}

type CreateTicketResult = {
  success?: boolean
  error?: string
}

export const createTicketFromFormContext = async (
  input: CreateTicketInput,
): Promise<CreateTicketResult> => {
  const { projectId, stepNumber, title, description, priority } = input

  if (!title.trim()) {
    return { error: 'Title is required' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  // projectId comes from the client, so resolve the org from the project itself
  // and then prove the caller belongs to that org. Taking the caller's first
  // membership instead would let a project in another org be written to.
  const { data: project } = await supabase
    .from('projects')
    .select('org_id')
    .eq('id', projectId)
    .maybeSingle()

  if (!project) {
    return { error: 'Project not found' }
  }

  try {
    await requirePermission(project.org_id, 'ticket.create', { supabase, userId: user.id })
  } catch {
    return { error: 'Project not found' }
  }

  const { error: insertError } = await supabase.from('tickets').insert({
    org_id: project.org_id,
    title: title.trim(),
    description: description.trim() || null,
    type: 'task',
    status: 'backlog',
    priority,
    project_id: projectId,
    reporter_id: user.id,
    tags: [`step-${stepNumber}`],
  })

  if (insertError) {
    console.error('Failed to create ticket from form:', insertError.message)
    return { error: 'Failed to create ticket. Please try again.' }
  }

  trackServerEvent('ticket.created_from_form', {
    project_id: projectId,
    step_number: stepNumber,
  })

  revalidatePath('/tickets')
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}
