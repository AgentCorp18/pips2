'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { stepNumberToEnum } from '@pips/shared'
import { trackServerEvent } from '@/lib/analytics'

export type FormActionResult = {
  success: boolean
  error?: string
}

/** Upsert form data (JSONB) into project_forms */
export const saveFormData = async (
  projectId: string,
  stepNumber: number,
  formType: string,
  data: Record<string, unknown>,
): Promise<FormActionResult> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
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
