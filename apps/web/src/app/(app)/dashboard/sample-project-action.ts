'use server'

import { createClient } from '@/lib/supabase/server'
import { PROJECT_TEMPLATES, getProjectTemplate } from '@pips/shared'
import type { ProjectTemplate } from '@pips/shared'

type SampleProjectResult = {
  projectId?: string
  error?: string
}

/** Create a pre-populated project from a template for new users to explore */
export const createSampleProject = async (templateId?: string): Promise<SampleProjectResult> => {
  const template: ProjectTemplate | undefined = templateId
    ? getProjectTemplate(templateId)
    : PROJECT_TEMPLATES[0]

  if (!template) {
    return { error: `Template "${templateId}" not found` }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  // Get user's org
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

  // Create the project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      org_id: membership.org_id,
      title: template.name,
      description: `Sample project: ${template.description}`,
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

  // Create project steps from template
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

  // Insert pre-filled forms from template
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

  return { projectId }
}
