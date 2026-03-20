'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth, checkPermission } from '@/lib/action-utils'
import type { ActionResult } from '@/lib/action-utils'
import { createAdminClient } from '@/lib/supabase/admin'

/** Archive a project — sets status to 'archived' */
export const archiveProject = async (projectId: string): Promise<ActionResult> => {
  const auth = await requireAuth()
  if (!auth.success) return { error: auth.error }
  const { supabase, orgId } = auth.ctx

  const permError = await checkPermission(orgId, 'project.update')
  if (permError) return { error: permError }

  // Verify the project belongs to the user's org
  const { data: project } = await supabase
    .from('projects')
    .select('id, org_id')
    .eq('id', projectId)
    .eq('org_id', orgId)
    .single()

  if (!project) {
    return { error: 'Project not found' }
  }

  const { error: updateError } = await supabase
    .from('projects')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('org_id', orgId)

  if (updateError) {
    return { error: 'Failed to archive project' }
  }

  revalidatePath('/projects')
  return {}
}

type CloneProjectOptions = {
  copyForms: boolean
  title?: string
}

/** Clone a project — creates a new project with optionally copied form data */
export const cloneProject = async (
  projectId: string,
  options: CloneProjectOptions,
): Promise<ActionResult<{ projectId: string }>> => {
  const auth = await requireAuth()
  if (!auth.success) return { error: auth.error }
  const { supabase, user, orgId } = auth.ctx

  const permError = await checkPermission(orgId, 'project.create')
  if (permError) return { error: permError }

  // Fetch source project — must belong to user's org
  const { data: source } = await supabase
    .from('projects')
    .select('id, org_id, title, description, target_end')
    .eq('id', projectId)
    .eq('org_id', orgId)
    .single()

  if (!source) {
    return { error: 'Project not found' }
  }

  const cloneTitle = options.title?.trim() || `${source.title as string} — Copy`

  // Create new project
  const { data: newProject, error: createError } = await supabase
    .from('projects')
    .insert({
      org_id: orgId,
      title: cloneTitle,
      description: source.description,
      owner_id: user.id,
      target_end: source.target_end,
      current_step: 'identify',
      status: 'active',
    })
    .select('id')
    .single()

  if (createError || !newProject) {
    return { error: 'Failed to create cloned project' }
  }

  // Create 6 project steps (trigger should auto-create, but upsert to be safe)
  const pipsSteps = [
    'identify',
    'analyze',
    'generate',
    'select_plan',
    'implement',
    'evaluate',
  ] as const

  const steps = pipsSteps.map((step, i) => ({
    project_id: newProject.id,
    step,
    status: i === 0 ? ('in_progress' as const) : ('not_started' as const),
    started_at: i === 0 ? new Date().toISOString() : null,
  }))

  const { error: stepsError } = await supabase
    .from('project_steps')
    .upsert(steps, { onConflict: 'project_id,step' })

  if (stepsError) {
    await supabase.from('projects').delete().eq('id', newProject.id)
    return { error: 'Failed to initialize steps for cloned project' }
  }

  // Add creator as project lead (admin client to bypass RLS)
  const admin = createAdminClient()
  const { error: memberError } = await admin.from('project_members').insert({
    project_id: newProject.id,
    user_id: user.id,
    role: 'lead',
  })

  if (memberError) {
    await supabase.from('projects').delete().eq('id', newProject.id)
    return { error: 'Failed to add you as project lead' }
  }

  // Optionally copy form data
  if (options.copyForms) {
    const { data: sourceForms } = await supabase
      .from('project_forms')
      .select('form_type, step, data')
      .eq('project_id', projectId)

    if (sourceForms && sourceForms.length > 0) {
      const clonedForms = sourceForms.map((f) => ({
        project_id: newProject.id,
        org_id: orgId,
        form_type: f.form_type as string,
        step: f.step as string,
        data: f.data as Record<string, unknown>,
        created_by: user.id,
      }))

      const { error: formsError } = await supabase.from('project_forms').insert(clonedForms)

      if (formsError) {
        // Non-critical — project was cloned, forms just weren't copied
        console.error('Failed to copy forms during project clone:', formsError)
      }
    }
  }

  revalidatePath('/projects')
  return { data: { projectId: newProject.id } }
}
