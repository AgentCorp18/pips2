'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createProjectSchema } from '@/lib/validations'

export type CreateProjectActionState = {
  error?: string
  fieldErrors?: Record<string, string>
}

export const createProject = async (
  _prev: CreateProjectActionState,
  formData: FormData,
): Promise<CreateProjectActionState> => {
  const raw = {
    name: formData.get('name'),
    description: formData.get('description'),
    target_completion_date: formData.get('target_completion_date'),
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
    .limit(1)
    .single()

  if (!membership) {
    return { error: 'You must belong to an organization to create a project' }
  }

  // Create project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      org_id: membership.org_id,
      name: result.data.name,
      description: result.data.description || null,
      owner_id: user.id,
      target_completion_date: result.data.target_completion_date || null,
      current_step: 1,
      status: 'active',
    })
    .select('id')
    .single()

  if (projectError || !project) {
    return { error: 'Failed to create project. Please try again.' }
  }

  // Create 6 project steps
  const steps = Array.from({ length: 6 }, (_, i) => ({
    project_id: project.id,
    step_number: i + 1,
    status: i === 0 ? 'in_progress' : 'not_started',
    started_at: i === 0 ? new Date().toISOString() : null,
  }))

  const { error: stepsError } = await supabase.from('project_steps').insert(steps)

  if (stepsError) {
    // Clean up
    await supabase.from('projects').delete().eq('id', project.id)
    return { error: 'Failed to initialize project steps. Please try again.' }
  }

  // Add creator as project member
  const { error: memberError } = await supabase.from('project_members').insert({
    project_id: project.id,
    user_id: user.id,
    role: 'owner',
  })

  if (memberError) {
    console.error('Failed to add project member:', memberError.message)
  }

  redirect(`/projects/${project.id}`)
}
