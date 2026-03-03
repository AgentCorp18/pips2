'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'

export type StepActionResult = {
  success: boolean
  error?: string
}

/** Complete the current step and advance to the next */
export const advanceStep = async (
  projectId: string,
  stepNumber: number,
): Promise<StepActionResult> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify project exists and get org_id
  const { data: project } = await supabase
    .from('projects')
    .select('id, org_id, current_step')
    .eq('id', projectId)
    .single()

  if (!project) {
    return { success: false, error: 'Project not found' }
  }

  if (project.current_step !== stepNumber) {
    return { success: false, error: 'Can only advance the current step' }
  }

  // Complete current step
  const now = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('project_steps')
    .update({
      status: 'completed',
      completed_at: now,
      completed_by: user.id,
    })
    .eq('project_id', projectId)
    .eq('step_number', stepNumber)

  if (updateError) {
    return { success: false, error: 'Failed to complete step' }
  }

  // If not the last step, advance to next
  if (stepNumber < 6) {
    const nextStep = stepNumber + 1

    // Update project current_step
    await supabase
      .from('projects')
      .update({ current_step: nextStep, updated_at: now })
      .eq('id', projectId)

    // Start next step
    await supabase
      .from('project_steps')
      .update({ status: 'in_progress', started_at: now })
      .eq('project_id', projectId)
      .eq('step_number', nextStep)
  } else {
    // All 6 steps complete — mark project as completed
    await supabase
      .from('projects')
      .update({ status: 'completed', updated_at: now })
      .eq('id', projectId)
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

/** Override (skip) a step — requires Manager+ role */
export const overrideStep = async (
  projectId: string,
  stepNumber: number,
): Promise<StepActionResult> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify project and get org_id
  const { data: project } = await supabase
    .from('projects')
    .select('id, org_id, current_step')
    .eq('id', projectId)
    .single()

  if (!project) {
    return { success: false, error: 'Project not found' }
  }

  // Check permission
  try {
    await requirePermission(project.org_id, 'step.override')
  } catch {
    return { success: false, error: 'Insufficient permissions to override steps' }
  }

  if (project.current_step !== stepNumber) {
    return { success: false, error: 'Can only override the current step' }
  }

  const now = new Date().toISOString()

  // Mark step as skipped
  const { error: updateError } = await supabase
    .from('project_steps')
    .update({
      status: 'skipped',
      completed_at: now,
      completed_by: user.id,
    })
    .eq('project_id', projectId)
    .eq('step_number', stepNumber)

  if (updateError) {
    return { success: false, error: 'Failed to skip step' }
  }

  // Advance to next step or complete project
  if (stepNumber < 6) {
    const nextStep = stepNumber + 1

    await supabase
      .from('projects')
      .update({ current_step: nextStep, updated_at: now })
      .eq('id', projectId)

    await supabase
      .from('project_steps')
      .update({ status: 'in_progress', started_at: now })
      .eq('project_id', projectId)
      .eq('step_number', nextStep)
  } else {
    await supabase
      .from('projects')
      .update({ status: 'completed', updated_at: now })
      .eq('id', projectId)
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

/** Update project status */
export const updateProjectStatus = async (
  projectId: string,
  status: 'active' | 'completed' | 'on_hold' | 'cancelled',
): Promise<StepActionResult> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('projects')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', projectId)

  if (error) {
    return { success: false, error: 'Failed to update project status' }
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}
