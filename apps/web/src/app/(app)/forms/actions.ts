'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { formFiltersSchema } from '@/lib/validations'

/* ============================================================
   getOrgForms
   ============================================================ */

export const getOrgForms = async (orgId: string, rawFilters?: Record<string, unknown>) => {
  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return { forms: [], total: 0 }
  }

  const parsed = formFiltersSchema.safeParse(rawFilters ?? {})
  if (!parsed.success) {
    return { forms: [], total: 0 }
  }
  const filters = parsed.data
  const supabase = await createClient()

  // project_forms doesn't have org_id — we must join through projects
  let query = supabase
    .from('project_forms')
    .select(
      `
      id,
      project_id,
      step,
      form_type,
      title,
      data,
      created_by,
      created_at,
      updated_at,
      project:projects!inner ( id, title, status, org_id ),
      creator:profiles!project_forms_created_by_fkey ( id, full_name, display_name, avatar_url )
    `,
      { count: 'exact' },
    )
    .eq('project.org_id', orgId)

  // Filter out archived projects by default
  if (!filters.include_archived) {
    query = query.neq('project.status', 'archived')
  }

  // Apply filters
  if (filters.form_type && filters.form_type.length > 0) {
    query = query.in('form_type', filters.form_type)
  }
  if (filters.step && filters.step.length > 0) {
    query = query.in('step', filters.step)
  }
  if (filters.project_id) {
    query = query.eq('project_id', filters.project_id)
  }
  if (filters.created_by) {
    query = query.eq('created_by', filters.created_by)
  }
  if (filters.search) {
    const escaped = filters.search.replace(/[%_\\]/g, '\\$&')
    query = query.ilike('title', `%${escaped}%`)
  }

  // Sorting
  query = query.order(filters.sort_by, { ascending: filters.sort_order === 'asc' })

  // Pagination
  const from = (filters.page - 1) * filters.per_page
  const to = from + filters.per_page - 1
  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Failed to fetch forms:', error.message)
    return { forms: [], total: 0 }
  }

  return { forms: data ?? [], total: count ?? 0 }
}

/* ============================================================
   getFormStats
   ============================================================ */

export const getFormStats = async (orgId: string) => {
  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return { total: 0, byFormType: [], byStep: [], recentCount: 0 }
  }

  const supabase = await createClient()

  // Get all non-archived forms for this org
  const { data: forms, error } = await supabase
    .from('project_forms')
    .select(
      `
      id,
      form_type,
      step,
      updated_at,
      project:projects!inner ( org_id, status )
    `,
    )
    .eq('project.org_id', orgId)
    .neq('project.status', 'archived')

  if (error || !forms) {
    console.error('Failed to fetch form stats:', error?.message)
    return { total: 0, byFormType: [], byStep: [], recentCount: 0 }
  }

  // Count by form type
  const typeMap = new Map<string, number>()
  for (const f of forms) {
    typeMap.set(f.form_type, (typeMap.get(f.form_type) ?? 0) + 1)
  }
  const byFormType = Array.from(typeMap.entries())
    .map(([formType, count]) => ({ formType, count }))
    .sort((a, b) => b.count - a.count)

  // Count by step
  const stepMap = new Map<string, number>()
  for (const f of forms) {
    stepMap.set(f.step, (stepMap.get(f.step) ?? 0) + 1)
  }
  const byStep = Array.from(stepMap.entries()).map(([step, count]) => ({ step, count }))

  // Recently modified (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentCount = forms.filter((f) => new Date(f.updated_at) > sevenDaysAgo).length

  return {
    total: forms.length,
    byFormType,
    byStep,
    recentCount,
  }
}
