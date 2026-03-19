'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAuth, checkPermission } from '@/lib/action-utils'
import { requirePermission } from '@/lib/permissions'
import { stepNumberToEnum, stepEnumToNumber } from '@pips/shared'
import { trackServerEvent } from '@/lib/analytics'
import { FORM_SCHEMAS } from '@/lib/form-schemas'

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
    'cost_benefit',
    'criteria_matrix',
    'evaluation',
    'fishbone',
    'five_why',
    'force_field',
    'impact_assessment',
    'impact_metrics',
    'implementation_checklist',
    'implementation_plan',
    'interviewing',
    'lessons_learned',
    'list_reduction',
    'milestone_tracker',
    'paired_comparisons',
    'pareto',
    'problem_statement',
    'raci',
    'results_metrics',
    'surveying',
    'weighted_voting',
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

  // Enforce form-specific schema validation — all known form types must have a schema
  const formSchema = FORM_SCHEMAS[formType]
  if (!formSchema) {
    return { success: false, error: 'Unknown form type' }
  }
  // Allow empty saves (initial save / clear) to bypass schema validation
  if (Object.keys(data).length > 0) {
    const formResult = formSchema.safeParse(data)
    if (!formResult.success) {
      return { success: false, error: 'Invalid form data' }
    }
  }

  const auth = await requireAuth()
  if (!auth.success) return { success: false, error: auth.error }
  const { supabase, user, orgId } = auth.ctx

  // Verify project exists and belongs to the user's current org (defense-in-depth)
  const { data: project } = await supabase
    .from('projects')
    .select('org_id, current_step')
    .eq('id', projectId)
    .single()

  if (!project || (orgId && project.org_id !== orgId)) {
    return { success: false, error: 'Project not found' }
  }

  // FIX 2: Step navigation access control — block writes to future steps
  // current_step is a pips_step enum string (e.g. 'identify'), convert to number for comparison
  if (project.current_step != null) {
    const currentStepNumber = stepEnumToNumber(project.current_step)
    if (stepNumber > currentStepNumber) {
      return { success: false, error: 'Cannot save form data for a future step' }
    }
  }

  // Check permission — saving form data requires project.create (member+, excludes viewers)
  try {
    await requirePermission(project.org_id, 'project.create')
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
  const auth = await requireAuth()
  if (!auth.success) return null
  const { supabase } = auth.ctx

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

/**
 * 3.1: Load related form data from prerequisite steps.
 * Used for auto-populating fields (e.g., problem statement into fishbone).
 */
export const loadRelatedFormData = async (
  projectId: string,
  formType: string,
): Promise<Record<string, unknown> | null> => {
  // Define which forms pre-fill from which source
  const PREFILL_MAP: Record<string, { step: number; sourceForm: string; fields: string[] }> = {
    // Step 2 forms get problem statement from Step 1
    fishbone: { step: 1, sourceForm: 'problem_statement', fields: ['problemStatement'] },
    five_why: { step: 1, sourceForm: 'problem_statement', fields: ['problemStatement'] },
    force_field: { step: 1, sourceForm: 'problem_statement', fields: ['problemStatement'] },
    // Step 5 forms get selected solution from Step 4
    milestone_tracker: {
      step: 4,
      sourceForm: 'implementation_plan',
      fields: ['selectedSolution', 'tasks'],
    },
    // Step 6 forms get targets from Step 1
    before_after: {
      step: 1,
      sourceForm: 'problem_statement',
      fields: ['problemStatement', 'asIs', 'desired', 'gap'],
    },
  }

  const mapping = PREFILL_MAP[formType]
  if (!mapping) return null

  const sourceData = await loadFormData(projectId, mapping.step, mapping.sourceForm)
  if (!sourceData) return null

  // Extract only the mapped fields
  const result: Record<string, unknown> = {}
  for (const field of mapping.fields) {
    if (sourceData[field] !== undefined) {
      result[field] = sourceData[field]
    }
  }

  return Object.keys(result).length > 0 ? result : null
}

/**
 * F6: List projects that have a specific form filled — for the "Copy from project" picker.
 */
export const listProjectsWithForm = async (
  stepNumber: number,
  formType: string,
  excludeProjectId: string,
): Promise<Array<{ id: string; title: string }>> => {
  const auth = await requireAuth()
  if (!auth.success) return []
  const { supabase, orgId } = auth.ctx

  const stepEnum = stepNumberToEnum(stepNumber)
  const { data } = await supabase
    .from('project_forms')
    .select('project_id, projects!inner(id, title, org_id)')
    .eq('step', stepEnum)
    .eq('form_type', formType)
    .neq('project_id', excludeProjectId)

  if (!data) return []

  return data
    .filter((row) => {
      const project = row.projects as unknown as { id: string; title: string; org_id: string }
      return project?.org_id === orgId
    })
    .map((row) => {
      const project = row.projects as unknown as { id: string; title: string }
      return { id: project.id, title: project.title }
    })
}

/**
 * F6: Copy form data from one project to another.
 */
export const copyFormFromProject = async (
  sourceProjectId: string,
  targetProjectId: string,
  stepNumber: number,
  formType: string,
): Promise<FormActionResult> => {
  const auth = await requireAuth()
  if (!auth.success) return { success: false, error: auth.error }
  const { supabase, user, orgId } = auth.ctx

  const stepEnum = stepNumberToEnum(stepNumber)

  // Verify both source and target projects belong to the current org
  const { data: projects } = await supabase
    .from('projects')
    .select('id, org_id')
    .in('id', [sourceProjectId, targetProjectId])

  const allInOrg = projects?.length === 2 && projects.every((p) => p.org_id === orgId)
  if (!allInOrg) {
    return { success: false, error: 'Projects not found or not in your organization' }
  }

  // Check permission — copying form data requires project.create (member+)
  const permError = await checkPermission(orgId, 'project.create')
  if (permError) return { success: false, error: 'Insufficient permissions to copy form data' }

  // Load source form data
  const { data: sourceForm } = await supabase
    .from('project_forms')
    .select('data')
    .eq('project_id', sourceProjectId)
    .eq('step', stepEnum)
    .eq('form_type', formType)
    .single()

  if (!sourceForm?.data) {
    return { success: false, error: 'Source form not found' }
  }

  // Save to target project (upsert)
  const { error } = await supabase.from('project_forms').upsert(
    {
      project_id: targetProjectId,
      step: stepEnum,
      form_type: formType,
      title: formType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      data: sourceForm.data,
      created_by: user.id,
    },
    { onConflict: 'project_id,step,form_type' },
  )

  if (error) {
    return { success: false, error: 'Failed to copy form data' }
  }

  revalidatePath(`/projects/${targetProjectId}/steps/${stepNumber}`)
  return { success: true }
}
