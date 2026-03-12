'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { stepNumberToEnum } from '@pips/shared'
import { trackServerEvent } from '@/lib/analytics'

export type FormActionResult = {
  success: boolean
  error?: string
}

const saveFormDataSchema = z.object({
  projectId: z.string().uuid(),
  stepNumber: z.number().int().min(1).max(6),
  formType: z.enum([
    'balance_sheet',
    'before_after',
    'brainstorming',
    'brainwriting',
    'checksheet',
    'criteria_matrix',
    'evaluation',
    'fishbone',
    'five_why',
    'force_field',
    'impact_assessment',
    'implementation_checklist',
    'implementation_plan',
    'lessons_learned',
    'milestone_tracker',
    'paired_comparisons',
    'problem_statement',
    'raci',
    'root_cause',
  ]),
  data: z.record(z.string(), z.unknown()),
})

/** Upsert form data (JSONB) into project_forms */
export const saveFormData = async (
  projectId: string,
  stepNumber: number,
  formType: string,
  data: Record<string, unknown>,
): Promise<FormActionResult> => {
  const parsed = saveFormDataSchema.safeParse({ projectId, stepNumber, formType, data })
  if (!parsed.success) {
    return { success: false, error: 'Invalid input' }
  }
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify project exists and user belongs to the project's org
  const { data: project } = await supabase
    .from('projects')
    .select('org_id')
    .eq('id', projectId)
    .single()

  if (!project) {
    return { success: false, error: 'Project not found' }
  }

  // Check permission — saving form data requires data.view (member+)
  try {
    await requirePermission(project.org_id, 'data.view')
  } catch {
    return { success: false, error: 'Insufficient permissions to save form data' }
  }

  const stepEnum = stepNumberToEnum(stepNumber)
  const { error } = await supabase.from('project_forms').upsert(
    {
      project_id: projectId,
      step: stepEnum,
      form_type: formType,
      title: formType,
      data,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'project_id,step,form_type' },
  )

  if (error) {
    console.error('Failed to save form data:', error.message)
    return { success: false, error: 'Failed to save form data. Please try again.' }
  }

  trackServerEvent('form.saved', {
    project_id: projectId,
    step_number: stepNumber,
    form_type: formType,
    fields_populated: Object.keys(data).length,
  })

  revalidatePath(`/projects/${projectId}/steps/${stepNumber}`)
  return { success: true }
}

/** Load form data from project_forms */
export const loadFormData = async (
  projectId: string,
  stepNumber: number,
  formType: string,
): Promise<Record<string, unknown> | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const stepEnum = stepNumberToEnum(stepNumber)
  const { data } = await supabase
    .from('project_forms')
    .select('data')
    .eq('project_id', projectId)
    .eq('step', stepEnum)
    .eq('form_type', formType)
    .single()

  return (data?.data as Record<string, unknown>) ?? null
}
