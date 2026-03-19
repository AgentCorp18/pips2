'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth, checkPermission } from '@/lib/action-utils'
import { createProjectSchema } from '@/lib/validations'
import { trackServerEvent } from '@/lib/analytics'

export type CreateProjectActionState = {
  error?: string
  fieldErrors?: Record<string, string>
  success?: boolean
  projectId?: string
}

export const createProject = async (
  _prev: CreateProjectActionState,
  formData: FormData,
): Promise<CreateProjectActionState> => {
  const raw = {
    name: formData.get('name'),
    description: formData.get('description') ?? undefined,
    target_completion_date: formData.get('target_completion_date') ?? undefined,
  }

  const result = createProjectSchema.safeParse(raw)
  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string') {
        fieldErrors[field] = issue.message
      }
    }
    return { fieldErrors }
  }

  const auth = await requireAuth()
  if (!auth.success) return { error: auth.error }
  const { supabase, user, orgId } = auth.ctx

  const permError = await checkPermission(orgId, 'project.create')
  if (permError) return { error: permError }

  // Create project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      org_id: orgId,
      title: result.data.name,
      description: result.data.description || null,
      owner_id: user.id,
      target_end: result.data.target_completion_date || null,
      current_step: 'identify',
      status: 'active',
    })
    .select('id')
    .single()

  if (projectError || !project) {
    return { error: 'Failed to create project. Please try again.' }
  }

  // Create 6 project steps
  const pipsSteps = [
    'identify',
    'analyze',
    'generate',
    'select_plan',
    'implement',
    'evaluate',
  ] as const
  const steps = pipsSteps.map((step, i) => ({
    project_id: project.id,
    step,
    status: i === 0 ? 'in_progress' : 'not_started',
    started_at: i === 0 ? new Date().toISOString() : null,
  }))

  // Upsert: trigger auto-creates steps on project INSERT, but we override
  // Step 1 to 'in_progress' with started_at. ON CONFLICT handles the overlap.
  const { error: stepsError } = await supabase
    .from('project_steps')
    .upsert(steps, { onConflict: 'project_id,step' })

  if (stepsError) {
    // Clean up
    await supabase.from('projects').delete().eq('id', project.id)
    return { error: 'Failed to initialize project steps. Please try again.' }
  }

  // Add creator as project lead (use admin client to bypass RLS chicken-and-egg)
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
        name: result.data.name,
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
    // Non-critical — project was created successfully
    console.error('Failed to create project chat channel:', err)
  }

  trackServerEvent('project.created', { project_id: project.id })

  return { success: true, projectId: project.id }
}
