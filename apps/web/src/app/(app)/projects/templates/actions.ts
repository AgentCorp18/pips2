'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthContext } from '@/lib/auth-context'
import { requirePermission } from '@/lib/permissions'
import { trackServerEvent } from '@/lib/analytics'
import { SYSTEM_TEMPLATES } from '@/lib/form-templates'
import { stepNumberToEnum } from '@pips/shared'

const STEP_NUMBERS: Record<string, number> = {
  identify: 1,
  analyze: 2,
  generate: 3,
  select_plan: 4,
  implement: 5,
  evaluate: 6,
}

export type ApplyTemplateResult = { projectId: string } | { error: string }

/**
 * Apply a system form template to create a new project with pre-filled forms.
 * Creates the project, project steps, adds the user as lead, and seeds the forms.
 */
export const applyTemplate = async (
  templateId: string,
  projectTitle: string,
): Promise<ApplyTemplateResult> => {
  const trimmedTitle = projectTitle.trim()

  if (!trimmedTitle) {
    return { error: 'Project title is required' }
  }

  if (trimmedTitle.length < 3) {
    return { error: 'Project title must be at least 3 characters' }
  }

  if (trimmedTitle.length > 200) {
    return { error: 'Project title must be 200 characters or fewer' }
  }

  const template = SYSTEM_TEMPLATES.find((t) => t.id === templateId)
  if (!template) {
    return { error: 'Template not found' }
  }

  const { supabase, user, orgId } = await getAuthContext()

  if (!user) {
    return { error: 'You must be signed in to create a project' }
  }

  if (!orgId) {
    return { error: 'You must belong to an organization to create a project' }
  }

  try {
    await requirePermission(orgId, 'project.create')
  } catch {
    return { error: 'Insufficient permissions' }
  }

  // Create project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      org_id: orgId,
      title: trimmedTitle,
      description: template.description,
      owner_id: user.id,
      current_step: 'identify',
      status: 'active',
    })
    .select('id')
    .single()

  if (projectError || !project) {
    return { error: 'Failed to create project. Please try again.' }
  }

  // Create 6 project steps
  const pipsSteps = ['identify', 'analyze', 'generate', 'select_plan', 'implement', 'evaluate'] as const
  const steps = pipsSteps.map((step, i) => ({
    project_id: project.id,
    step,
    status: i === 0 ? 'in_progress' : 'not_started',
    started_at: i === 0 ? new Date().toISOString() : null,
  }))

  const { error: stepsError } = await supabase
    .from('project_steps')
    .upsert(steps, { onConflict: 'project_id,step' })

  if (stepsError) {
    await supabase.from('projects').delete().eq('id', project.id)
    return { error: 'Failed to initialize project steps. Please try again.' }
  }

  // Add creator as project lead (admin client to bypass RLS)
  const admin = createAdminClient()
  const { error: memberError } = await admin.from('project_members').insert({
    project_id: project.id,
    user_id: user.id,
    role: 'lead',
  })

  if (memberError) {
    await supabase.from('projects').delete().eq('id', project.id)
    return { error: 'Failed to add you as project lead. Please try again.' }
  }

  // Auto-create a chat channel for the project (best-effort)
  try {
    const { data: channel } = await admin
      .from('chat_channels')
      .insert({
        org_id: orgId,
        type: 'project',
        name: trimmedTitle,
        entity_id: project.id,
        created_by: user.id,
      })
      .select('id')
      .single()

    if (channel) {
      await admin.from('chat_channel_members').insert({
        channel_id: channel.id,
        user_id: user.id,
      })
    }
  } catch (err) {
    // Non-critical
    console.error('Failed to create project chat channel:', err)
  }

  // Seed template forms
  if (template.forms.length > 0) {
    const formRows = template.forms.map((form) => {
      const stepNumber = STEP_NUMBERS[form.step] ?? 1
      const stepEnum = stepNumberToEnum(stepNumber)
      return {
        project_id: project.id,
        step: stepEnum,
        form_type: form.formType,
        title: form.title,
        data: form.data,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      }
    })

    const { error: formsError } = await supabase
      .from('project_forms')
      .upsert(formRows, { onConflict: 'project_id,step,form_type' })

    if (formsError) {
      // Non-critical — project created successfully, forms just weren't seeded
      console.error('Failed to seed template forms:', formsError.message)
    }
  }

  trackServerEvent('project.created', {
    project_id: project.id,
    source: 'form_template',
    template_id: templateId,
  })

  return { projectId: project.id }
}
