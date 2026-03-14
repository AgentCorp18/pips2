'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { getProjectTemplate } from '@pips/shared'

type SampleProjectResult = {
  projectId?: string
  error?: string
}

/** Create a pre-populated sample PIPS project for new users to explore */
export const createSampleProject = async (
  templateId: string = 'parking-lot-safety',
): Promise<SampleProjectResult> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  const template = getProjectTemplate(templateId)
  if (!template) {
    return { error: 'Template not found' }
  }

  // Get user's active org (respects org switcher cookie)
  const currentOrg = await getCurrentOrg(supabase, user.id)

  if (!currentOrg) {
    return { error: 'You must belong to an organization' }
  }

  // Create the sample project using the template data
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      org_id: currentOrg.orgId,
      title: template.name,
      description: template.description,
      owner_id: user.id,
      current_step: template.currentStep,
      status: 'active',
    })
    .select('id')
    .single()

  if (projectError || !project) {
    return { error: 'Failed to create sample project. Please try again.' }
  }

  const projectId = project.id
  const now = new Date().toISOString()

  // Create 6 project steps from the template step data
  const steps = template.steps.map((s) => ({
    project_id: projectId,
    step: s.step,
    status: s.status,
    started_at: s.status !== 'not_started' ? now : null,
    completed_at: s.status === 'completed' ? now : null,
    completed_by: s.status === 'completed' ? user.id : null,
  }))

  const { error: stepsError } = await supabase.from('project_steps').insert(steps)

  if (stepsError) {
    await supabase.from('projects').delete().eq('id', projectId)
    return { error: 'Failed to create project steps. Please try again.' }
  }

  // Add creator as project member
  await supabase.from('project_members').insert({
    project_id: projectId,
    user_id: user.id,
    role: 'lead',
  })

  // Insert pre-filled forms from the template
  if (template.forms.length > 0) {
    const forms = template.forms.map((f) => ({
      project_id: projectId,
      step: f.step,
      form_type: f.form_type,
      title: f.title,
      created_by: user.id,
      data: f.data,
    }))

    const { error: formsError } = await supabase.from('project_forms').insert(forms)

    if (formsError) {
      return { error: 'Failed to create sample forms. Please try again.' }
    }
  }

  // Insert sample tickets from the template
  if (template.tickets.length > 0) {
    // Get org settings for sequence numbering
    const { data: orgSettings } = await supabase
      .from('org_settings')
      .select('ticket_counter')
      .eq('org_id', currentOrg.orgId)
      .single()

    const startSeq = (orgSettings?.ticket_counter ?? 0) + 1

    const tickets = template.tickets.map((t, i) => ({
      org_id: currentOrg.orgId,
      project_id: projectId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      type: t.type,
      reporter_id: user.id,
      assignee_id: user.id,
      sequence_number: startSeq + i,
      started_at: ['in_progress', 'in_review', 'done'].includes(t.status) ? now : null,
      completed_at: t.status === 'done' ? now : null,
    }))

    await supabase.from('tickets').insert(tickets)

    // Update org ticket counter
    await supabase
      .from('org_settings')
      .update({ ticket_counter: startSeq + template.tickets.length - 1 })
      .eq('org_id', currentOrg.orgId)
  }

  return { projectId }
}
