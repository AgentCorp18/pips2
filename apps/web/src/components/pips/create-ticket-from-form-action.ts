'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
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

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership) {
    return { error: 'You must belong to an organization' }
  }

  const { error: insertError } = await supabase.from('tickets').insert({
    org_id: membership.org_id,
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
