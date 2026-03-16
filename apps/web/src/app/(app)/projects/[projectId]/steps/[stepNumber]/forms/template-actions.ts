'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getAuthContext } from '@/lib/auth-context'
import { requirePermission } from '@/lib/permissions'
import { stepNumberToEnum } from '@pips/shared'
import { FORM_SCHEMAS } from '@/lib/form-schemas'

/* ============================================================
   Types
   ============================================================ */

export type TemplateActionResult = {
  success: boolean
  error?: string
}

export type FormTemplate = {
  id: string
  orgId: string | null
  name: string
  description: string | null
  category: string
  step: string
  formType: string
  data: Record<string, unknown>
  isSystem: boolean
  createdBy: string | null
  usageCount: number
  createdAt: string
  updatedAt: string
}

/* ============================================================
   Validation schemas
   ============================================================ */

const VALID_FORM_TYPES = [
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
  'root_cause',
  'solution_evaluation',
  'surveying',
  'weighted_voting',
] as const

const formTypeEnum = z.enum(VALID_FORM_TYPES)

const listTemplatesSchema = z.object({
  stepNumber: z.number().int().min(1).max(6),
  formType: formTypeEnum,
})

const applyTemplateSchema = z.object({
  projectId: z.string().uuid(),
  stepNumber: z.number().int().min(1).max(6),
  formType: formTypeEnum,
  templateId: z.string().uuid(),
})

const saveAsTemplateSchema = z.object({
  projectId: z.string().uuid(),
  stepNumber: z.number().int().min(1).max(6),
  formType: formTypeEnum,
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

/* ============================================================
   Server Actions
   ============================================================ */

/**
 * List available templates for a given step and form type.
 *
 * Returns system templates (org_id IS NULL) visible to all users
 * plus the current user's org-specific templates, ordered by
 * usage_count descending so the most popular appear first.
 */
export const listTemplates = async (
  stepNumber: number,
  formType: string,
): Promise<FormTemplate[]> => {
  const parsed = listTemplatesSchema.safeParse({ stepNumber, formType })
  if (!parsed.success) return []

  const { supabase, user, orgId } = await getAuthContext()
  if (!user) return []

  const stepEnum = stepNumberToEnum(parsed.data.stepNumber)

  const { data, error } = await supabase
    .from('form_templates')
    .select('*')
    .eq('step', stepEnum)
    .eq('form_type', parsed.data.formType)
    .order('usage_count', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to list templates:', error.message)
    return []
  }

  if (!data) return []

  // RLS already filters to system templates + org templates, but we
  // apply an additional client-side guard in case orgId is null
  // (user with no org should only see system templates).
  return data
    .filter((row) => row.org_id === null || row.org_id === orgId)
    .map((row) => ({
      id: row.id as string,
      orgId: row.org_id as string | null,
      name: row.name as string,
      description: row.description as string | null,
      category: row.category as string,
      step: row.step as string,
      formType: row.form_type as string,
      data: (row.data ?? {}) as Record<string, unknown>,
      isSystem: row.is_system as boolean,
      createdBy: row.created_by as string | null,
      usageCount: row.usage_count as number,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }))
}

/**
 * Apply a template to a project form.
 *
 * Copies the template's data into the project_forms table (upsert),
 * then increments the template's usage_count.
 *
 * The caller must have at least member-level org access to the project.
 */
export const applyTemplate = async (
  projectId: string,
  stepNumber: number,
  formType: string,
  templateId: string,
): Promise<TemplateActionResult> => {
  const parsed = applyTemplateSchema.safeParse({ projectId, stepNumber, formType, templateId })
  if (!parsed.success) {
    return { success: false, error: 'Invalid input' }
  }

  const { supabase, user } = await getAuthContext()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify project exists and belongs to an org the user is in
  const { data: project } = await supabase
    .from('projects')
    .select('org_id')
    .eq('id', parsed.data.projectId)
    .single()

  if (!project) {
    return { success: false, error: 'Project not found' }
  }

  // Require member+ permission
  try {
    await requirePermission(project.org_id as string, 'data.view')
  } catch {
    return { success: false, error: 'Insufficient permissions' }
  }

  // Load the template — RLS ensures user can only read accessible templates
  const { data: template } = await supabase
    .from('form_templates')
    .select('id, data, form_type, step')
    .eq('id', parsed.data.templateId)
    .single()

  if (!template) {
    return { success: false, error: 'Template not found' }
  }

  // Validate that the template's step and form_type match what was requested
  const expectedStep = stepNumberToEnum(parsed.data.stepNumber)
  if (template.step !== expectedStep || template.form_type !== parsed.data.formType) {
    return { success: false, error: 'Template does not match the requested form type' }
  }

  const templateData = (template.data ?? {}) as Record<string, unknown>

  // Validate template data against the form schema before writing
  const formSchema = FORM_SCHEMAS[parsed.data.formType]
  if (formSchema && Object.keys(templateData).length > 0) {
    const schemaResult = formSchema.safeParse(templateData)
    if (!schemaResult.success) {
      return { success: false, error: 'Template data does not match expected form schema' }
    }
  }

  const stepEnum = stepNumberToEnum(parsed.data.stepNumber)

  // Upsert the template data into project_forms
  const { error: upsertError } = await supabase.from('project_forms').upsert(
    {
      project_id: parsed.data.projectId,
      step: stepEnum,
      form_type: parsed.data.formType,
      title: parsed.data.formType,
      data: templateData,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'project_id,step,form_type' },
  )

  if (upsertError) {
    console.error('Failed to apply template:', upsertError.message)
    return { success: false, error: 'Failed to apply template. Please try again.' }
  }

  // Increment usage_count (fire-and-forget — non-critical)
  await supabase
    .rpc('increment_template_usage', { template_id: parsed.data.templateId })
    .then(({ error }) => {
      if (error) {
        // Log but do not surface to user — usage tracking is non-critical
        console.warn('Failed to increment template usage_count:', error.message)
      }
    })

  revalidatePath(`/projects/${parsed.data.projectId}/steps/${parsed.data.stepNumber}`)
  return { success: true }
}

/**
 * Save the current project form data as a new org-scoped template.
 *
 * The template is private to the user's active org. Only the form data
 * currently saved in project_forms is captured — unsaved edits are not
 * included (the user should save the form first).
 */
export const saveAsTemplate = async (
  projectId: string,
  stepNumber: number,
  formType: string,
  name: string,
  category: string,
  description?: string,
): Promise<TemplateActionResult & { templateId?: string }> => {
  const parsed = saveAsTemplateSchema.safeParse({
    projectId,
    stepNumber,
    formType,
    name,
    category,
    description,
  })
  if (!parsed.success) {
    return { success: false, error: 'Invalid input' }
  }

  const { supabase, user, orgId } = await getAuthContext()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }
  if (!orgId) {
    return { success: false, error: 'No active organization' }
  }

  // Verify project access
  const { data: project } = await supabase
    .from('projects')
    .select('org_id')
    .eq('id', parsed.data.projectId)
    .single()

  if (!project) {
    return { success: false, error: 'Project not found' }
  }

  // Only allow saving templates from projects in the user's active org
  if ((project.org_id as string) !== orgId) {
    return { success: false, error: 'Project does not belong to your active organization' }
  }

  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return { success: false, error: 'Insufficient permissions' }
  }

  // Load the saved form data from the project
  const stepEnum = stepNumberToEnum(parsed.data.stepNumber)
  const { data: formRow } = await supabase
    .from('project_forms')
    .select('data')
    .eq('project_id', parsed.data.projectId)
    .eq('step', stepEnum)
    .eq('form_type', parsed.data.formType)
    .single()

  if (!formRow?.data) {
    return { success: false, error: 'No saved form data found. Save the form first.' }
  }

  const formData = formRow.data as Record<string, unknown>

  // Check for duplicate name within this org
  const { data: existing } = await supabase
    .from('form_templates')
    .select('id')
    .eq('org_id', orgId)
    .eq('name', parsed.data.name)
    .eq('form_type', parsed.data.formType)
    .maybeSingle()

  if (existing) {
    return {
      success: false,
      error: 'A template with this name already exists for this form type in your organization.',
    }
  }

  // Insert the new template
  const { data: inserted, error: insertError } = await supabase
    .from('form_templates')
    .insert({
      org_id: orgId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      category: parsed.data.category,
      step: stepEnum,
      form_type: parsed.data.formType,
      data: formData,
      is_system: false,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    console.error('Failed to save template:', insertError?.message)
    return { success: false, error: 'Failed to save template. Please try again.' }
  }

  return { success: true, templateId: inserted.id as string }
}

/**
 * Delete an org-scoped template.
 *
 * System templates (is_system = true) cannot be deleted via this action.
 * Requires manager+ org role.
 */
export const deleteTemplate = async (templateId: string): Promise<TemplateActionResult> => {
  const parsed = z.string().uuid().safeParse(templateId)
  if (!parsed.success) {
    return { success: false, error: 'Invalid template ID' }
  }

  const { supabase, user, orgId } = await getAuthContext()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }
  if (!orgId) {
    return { success: false, error: 'No active organization' }
  }

  // Load the template to verify it belongs to the user's org and is not a system template
  const { data: template } = await supabase
    .from('form_templates')
    .select('id, org_id, is_system')
    .eq('id', parsed.data)
    .single()

  if (!template) {
    return { success: false, error: 'Template not found' }
  }

  if (template.is_system) {
    return { success: false, error: 'System templates cannot be deleted' }
  }

  if ((template.org_id as string) !== orgId) {
    return { success: false, error: 'Template does not belong to your active organization' }
  }

  try {
    await requirePermission(orgId, 'ticket.delete')
  } catch {
    return { success: false, error: 'Only managers and above can delete templates' }
  }

  const { error: deleteError } = await supabase
    .from('form_templates')
    .delete()
    .eq('id', parsed.data)

  if (deleteError) {
    console.error('Failed to delete template:', deleteError.message)
    return { success: false, error: 'Failed to delete template. Please try again.' }
  }

  return { success: true }
}
