'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  const { error } = await supabase.from('project_forms').upsert(
    {
      project_id: projectId,
      step_number: stepNumber,
      form_type: formType,
      data,
      last_edited_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'project_id,step_number,form_type' },
  )

  if (error) {
    return { success: false, error: error.message }
  }

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

  const { data } = await supabase
    .from('project_forms')
    .select('data')
    .eq('project_id', projectId)
    .eq('step_number', stepNumber)
    .eq('form_type', formType)
    .single()

  return (data?.data as Record<string, unknown>) ?? null
}
