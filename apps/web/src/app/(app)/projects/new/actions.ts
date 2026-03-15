'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthContext } from '@/lib/auth-context'
import { createProjectSchema } from '@/lib/validations'
import { trackServerEvent } from '@/lib/analytics'
import { requirePermission } from '@/lib/permissions'

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

  const { error: stepsError } = await supabase.from('project_steps').insert(steps)

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
  } catch {
    // Non-critical — project was created successfully
  }

  trackServerEvent('project.created', { project_id: project.id })

  return { success: true, projectId: project.id }
}
