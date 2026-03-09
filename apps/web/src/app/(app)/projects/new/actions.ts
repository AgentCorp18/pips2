'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to create a project' }
  }

  // Get user's org membership
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership) {
    return { error: 'You must belong to an organization to create a project' }
  }

  // Create project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      org_id: membership.org_id,
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

  trackServerEvent('project.created', { project_id: project.id })

  return { success: true, projectId: project.id }
}
