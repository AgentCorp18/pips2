'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { stepNumberToEnum } from '@pips/shared'
import { trackServerEvent } from '@/lib/analytics'

export type StepActionResult = {
  success: boolean
  error?: string
}

/** Complete the current step and advance to the next */
export const advanceStep = async (
  projectId: string,
  stepNumber: number,
): Promise<StepActionResult> => {
  if (stepNumber < 1 || stepNumber > 6 || !Number.isInteger(stepNumber)) {
    return { success: false, error: 'Invalid step number' }
  }

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

  // Check permission — advancing a step requires step.complete
  try {
    await requirePermission(project.org_id, 'step.complete')
  } catch {
    return { success: false, error: 'Insufficient permissions to advance steps' }
  }

  const currentStepEnum = stepNumberToEnum(stepNumber)
  if (project.current_step !== currentStepEnum) {
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
    .eq('step', currentStepEnum)

  if (updateError) {
    return { success: false, error: 'Failed to complete step' }
  }

  // If not the last step, advance to next
  if (stepNumber < 6) {
    const nextStepEnum = stepNumberToEnum(stepNumber + 1)

    // Update project current_step
    const { error: projectError } = await supabase
      .from('projects')
      .update({ current_step: nextStepEnum, updated_at: now })
      .eq('id', projectId)

    if (projectError) {
      console.error('Failed to advance project current_step:', projectError.message)
      return { success: false, error: 'Failed to advance to next step' }
    }

    // Start next step
    const { error: nextStepError } = await supabase
      .from('project_steps')
      .update({ status: 'in_progress', started_at: now })
      .eq('project_id', projectId)
      .eq('step', nextStepEnum)

    if (nextStepError) {
      console.error('Failed to start next step:', nextStepError.message)
    }
  } else {
    // All 6 steps complete — mark project as completed
    const { error: completeError } = await supabase
      .from('projects')
      .update({ status: 'completed', updated_at: now })
      .eq('id', projectId)

    if (completeError) {
      console.error('Failed to mark project completed:', completeError.message)
    }
  }

  trackServerEvent('step.advanced', {
    project_id: projectId,
    step_number: stepNumber,
    step_name: currentStepEnum,
  })

  if (stepNumber >= 6) {
    trackServerEvent('project.completed', { project_id: projectId })
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

/** Override (skip) a step — requires Manager+ role */
export const overrideStep = async (
  projectId: string,
  stepNumber: number,
): Promise<StepActionResult> => {
  if (stepNumber < 1 || stepNumber > 6 || !Number.isInteger(stepNumber)) {
    return { success: false, error: 'Invalid step number' }
  }

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

  const currentStepEnum = stepNumberToEnum(stepNumber)
  if (project.current_step !== currentStepEnum) {
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
    .eq('step', currentStepEnum)

  if (updateError) {
    return { success: false, error: 'Failed to skip step' }
  }

  // Advance to next step or complete project
  if (stepNumber < 6) {
    const nextStepEnum = stepNumberToEnum(stepNumber + 1)

    const { error: projectError } = await supabase
      .from('projects')
      .update({ current_step: nextStepEnum, updated_at: now })
      .eq('id', projectId)

    if (projectError) {
      console.error('Failed to advance project after override:', projectError.message)
      return { success: false, error: 'Failed to advance to next step' }
    }

    const { error: nextStepError } = await supabase
      .from('project_steps')
      .update({ status: 'in_progress', started_at: now })
      .eq('project_id', projectId)
      .eq('step', nextStepEnum)

    if (nextStepError) {
      console.error('Failed to start next step after override:', nextStepError.message)
    }
  } else {
    const { error: completeError } = await supabase
      .from('projects')
      .update({ status: 'completed', updated_at: now })
      .eq('id', projectId)

    if (completeError) {
      console.error('Failed to mark project completed after override:', completeError.message)
    }
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

/** Update project status */
export const updateProjectStatus = async (
  projectId: string,
  status: 'active' | 'completed' | 'on_hold' | 'archived',
): Promise<StepActionResult> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify project exists and check permissions
  const { data: project } = await supabase
    .from('projects')
    .select('id, org_id')
    .eq('id', projectId)
    .single()

  if (!project) {
    return { success: false, error: 'Project not found' }
  }

  try {
    await requirePermission(project.org_id, 'project.update')
  } catch {
    return { success: false, error: 'Insufficient permissions to update project status' }
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
