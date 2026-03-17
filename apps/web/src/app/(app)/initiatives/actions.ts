'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import {
  createInitiativeSchema,
  updateInitiativeSchema,
  addProjectToInitiativeSchema,
} from '@/lib/validations'
import { trackServerEvent } from '@/lib/analytics'
import type { Initiative, InitiativeWithRelations, InitiativeProgress } from '@/types/initiatives'

/* ============================================================
   Types
   ============================================================ */

export type InitiativeActionState = {
  error?: string
  fieldErrors?: Record<string, string>
  success?: boolean
  redirectTo?: string
}

/* ============================================================
   Create Initiative
   ============================================================ */

export const createInitiative = async (
  _prev: InitiativeActionState,
  formData: FormData,
): Promise<InitiativeActionState> => {
  const raw = {
    title: formData.get('title'),
    description: formData.get('description') ?? undefined,
    objective: formData.get('objective') ?? undefined,
    target_metric: formData.get('target_metric') ?? undefined,
    baseline_value: formData.get('baseline_value') ?? undefined,
    target_value: formData.get('target_value') ?? undefined,
    target_start: formData.get('target_start') ?? undefined,
    target_end: formData.get('target_end') ?? undefined,
    color: formData.get('color') ?? undefined,
    tags: formData.get('tags') ?? undefined,
  }

  const result = createInitiativeSchema.safeParse(raw)
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

  const { supabase, user, orgId } = await getAuthContext()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  if (!orgId) {
    return { error: 'You must belong to an organization' }
  }

  try {
    await requirePermission(orgId, 'initiative.create')
  } catch {
    return { error: 'You do not have permission to create initiatives' }
  }

  const tags = result.data.tags
    ? result.data.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  const { data: initiative, error: insertError } = await supabase
    .from('initiatives')
    .insert({
      org_id: orgId,
      title: result.data.title,
      description: result.data.description || null,
      objective: result.data.objective || null,
      target_metric: result.data.target_metric || null,
      baseline_value: result.data.baseline_value || null,
      target_value: result.data.target_value || null,
      target_start: result.data.target_start || null,
      target_end: result.data.target_end || null,
      color: result.data.color,
      tags,
      owner_id: user.id,
    })
    .select('id')
    .single()

  if (insertError || !initiative) {
    return { error: 'Failed to create initiative. Please try again.' }
  }

  trackServerEvent('initiative.created', { initiative_id: initiative.id })
  revalidatePath('/initiatives')

  return { success: true, redirectTo: `/initiatives/${initiative.id}` }
}

/* ============================================================
   Get Initiatives (List)
   ============================================================ */

export const getInitiatives = async (): Promise<{
  initiatives: (Initiative & {
    project_count: number
    step_progress: number
    owner: { id: string; display_name: string }
  })[]
  error?: string
}> => {
  const { supabase, user, orgId } = await getAuthContext()

  if (!user) return { initiatives: [], error: 'Not authenticated' }

  if (!orgId) return { initiatives: [], error: 'No organization' }

  const { data, error } = await supabase
    .from('initiatives')
    .select(
      `
      *,
      owner:profiles!initiatives_owner_id_fkey ( id, display_name ),
      initiative_projects (
        id,
        project:projects!initiative_projects_project_id_fkey (
          project_steps ( status )
        )
      )
    `,
    )
    .eq('org_id', orgId)
    .is('archived_at', null)
    .order('created_at', { ascending: false })

  if (error) return { initiatives: [], error: error.message }

  const initiatives = (data ?? []).map((i) => {
    const links = i.initiative_projects ?? []
    const project_count = links.length

    // Calculate average step completion across all linked projects.
    // Each project has 6 steps; progress = (completed_steps / 6) * 100 averaged across projects.
    let step_progress = 0
    if (project_count > 0) {
      let totalProgress = 0
      for (const link of links) {
        const steps =
          (link.project as unknown as { project_steps: Array<{ status: string }> } | null)
            ?.project_steps ?? []
        const completedSteps = steps.filter(
          (s) => s.status === 'completed' || s.status === 'skipped',
        ).length
        totalProgress += (completedSteps / 6) * 100
      }
      step_progress = Math.round(totalProgress / project_count)
    }

    return {
      ...i,
      project_count,
      step_progress,
      owner: i.owner ?? { id: i.owner_id, display_name: 'Unknown' },
    }
  })

  return { initiatives }
}

/* ============================================================
   Get Initiative Detail
   ============================================================ */

export const getInitiativeDetail = async (
  initiativeId: string,
): Promise<{ initiative: InitiativeWithRelations | null; error?: string }> => {
  const { supabase, user, orgId } = await getAuthContext()

  if (!user) return { initiative: null, error: 'Not authenticated' }

  if (!orgId) return { initiative: null, error: 'No organization' }

  const { data, error } = await supabase
    .from('initiatives')
    .select(
      `
      *,
      owner:profiles!initiatives_owner_id_fkey ( id, display_name, avatar_url ),
      initiative_projects (
        id, initiative_id, project_id, added_by, added_at, notes,
        project:projects!initiative_projects_project_id_fkey (
          id, title, status, current_step, owner_id, priority
        )
      )
    `,
    )
    .eq('id', initiativeId)
    .eq('org_id', orgId)
    .single()

  if (error || !data) return { initiative: null, error: error?.message ?? 'Not found' }

  const initiative: InitiativeWithRelations = {
    ...data,
    owner: data.owner ?? { id: data.owner_id, display_name: 'Unknown', avatar_url: null },
    projects: data.initiative_projects ?? [],
    project_count: data.initiative_projects?.length ?? 0,
  }

  return { initiative }
}

/* ============================================================
   Get Initiative Progress
   ============================================================ */

export const getInitiativeProgress = async (initiativeId: string): Promise<InitiativeProgress> => {
  const supabase = await createClient()

  // Get all projects linked to this initiative
  const { data: links } = await supabase
    .from('initiative_projects')
    .select(
      'project_id, project:projects!initiative_projects_project_id_fkey ( id, status, priority )',
    )
    .eq('initiative_id', initiativeId)

  if (!links || links.length === 0) {
    return {
      total_projects: 0,
      completed_projects: 0,
      in_progress_projects: 0,
      total_tickets: 0,
      completed_tickets: 0,
      weighted_progress: 0,
    }
  }

  const projectIds = links.map((l) => l.project_id)

  // Get ticket counts per project
  const { data: tickets } = await supabase
    .from('tickets')
    .select('project_id, status')
    .in('project_id', projectIds)

  const ticketsByProject = new Map<string, { total: number; done: number }>()
  for (const t of tickets ?? []) {
    if (!t.project_id) continue
    const entry = ticketsByProject.get(t.project_id) ?? { total: 0, done: 0 }
    entry.total++
    if (t.status === 'done') entry.done++
    ticketsByProject.set(t.project_id, entry)
  }

  // Priority weights for weighted progress
  const PRIORITY_WEIGHT: Record<string, number> = {
    critical: 5,
    high: 4,
    medium: 3,
    low: 2,
    none: 1,
  }

  let totalWeight = 0
  let weightedComplete = 0
  let completedProjects = 0
  let inProgressProjects = 0

  for (const link of links) {
    const project = link.project as unknown as {
      id: string
      status: string
      priority: string
    } | null
    if (!project) continue

    const weight = PRIORITY_WEIGHT[project.priority] ?? 3
    const ticketData = ticketsByProject.get(project.id) ?? { total: 0, done: 0 }
    const projectProgress =
      ticketData.total > 0
        ? ticketData.done / ticketData.total
        : project.status === 'completed'
          ? 1
          : 0

    totalWeight += weight
    weightedComplete += weight * projectProgress

    if (project.status === 'completed') completedProjects++
    else if (project.status === 'active') inProgressProjects++
  }

  return {
    total_projects: links.length,
    completed_projects: completedProjects,
    in_progress_projects: inProgressProjects,
    total_tickets: Array.from(ticketsByProject.values()).reduce((sum, v) => sum + v.total, 0),
    completed_tickets: Array.from(ticketsByProject.values()).reduce((sum, v) => sum + v.done, 0),
    weighted_progress: totalWeight > 0 ? Math.round((weightedComplete / totalWeight) * 100) : 0,
  }
}

/* ============================================================
   Update Initiative
   ============================================================ */

export const updateInitiative = async (
  initiativeId: string,
  data: Record<string, unknown>,
): Promise<{ error?: string }> => {
  const result = updateInitiativeSchema.safeParse(data)
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid data' }
  }

  const { supabase, user, orgId } = await getAuthContext()

  if (!user) return { error: 'Not authenticated' }

  if (!orgId) return { error: 'No organization' }

  try {
    await requirePermission(orgId, 'initiative.update')
  } catch {
    return { error: 'Insufficient permissions' }
  }

  const { error } = await supabase
    .from('initiatives')
    .update(result.data)
    .eq('id', initiativeId)
    .eq('org_id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/initiatives')
  revalidatePath(`/initiatives/${initiativeId}`)
  return {}
}

/* ============================================================
   Archive Initiative
   ============================================================ */

export const archiveInitiative = async (initiativeId: string): Promise<{ error?: string }> => {
  const { supabase, user, orgId } = await getAuthContext()

  if (!user) return { error: 'Not authenticated' }

  if (!orgId) return { error: 'No organization' }

  try {
    await requirePermission(orgId, 'initiative.delete')
  } catch {
    return { error: 'Insufficient permissions' }
  }

  const { error } = await supabase
    .from('initiatives')
    .update({ archived_at: new Date().toISOString(), status: 'archived' })
    .eq('id', initiativeId)
    .eq('org_id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/initiatives')
  return {}
}

/* ============================================================
   Add / Remove Project to/from Initiative
   ============================================================ */

export const addProjectToInitiative = async (
  initiativeId: string,
  projectId: string,
  notes?: string,
): Promise<{ error?: string }> => {
  const result = addProjectToInitiativeSchema.safeParse({
    initiative_id: initiativeId,
    project_id: projectId,
    notes,
  })
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid data' }
  }

  const { supabase, user, orgId } = await getAuthContext()

  if (!user) return { error: 'Not authenticated' }

  if (!orgId) return { error: 'No organization' }

  try {
    await requirePermission(orgId, 'initiative.update')
  } catch {
    return { error: 'Insufficient permissions' }
  }

  // Cross-org validation: ensure both initiative and project belong to this org
  const { data: initiative } = await supabase
    .from('initiatives')
    .select('org_id')
    .eq('id', initiativeId)
    .single()

  if (!initiative || initiative.org_id !== orgId) {
    return { error: 'Initiative not found' }
  }

  const { data: project } = await supabase
    .from('projects')
    .select('org_id')
    .eq('id', projectId)
    .single()

  if (!project || project.org_id !== orgId) {
    return { error: 'Project not found' }
  }

  const { error } = await supabase.from('initiative_projects').insert({
    initiative_id: initiativeId,
    project_id: projectId,
    added_by: user.id,
    notes: notes || null,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'This project is already linked to an initiative' }
    }
    return { error: error.message }
  }

  revalidatePath(`/initiatives/${initiativeId}`)
  return {}
}

export const removeProjectFromInitiative = async (
  initiativeId: string,
  projectId: string,
): Promise<{ error?: string }> => {
  const { supabase, user, orgId } = await getAuthContext()

  if (!user) return { error: 'Not authenticated' }

  if (!orgId) return { error: 'No organization' }

  try {
    await requirePermission(orgId, 'initiative.update')
  } catch {
    return { error: 'Insufficient permissions' }
  }

  const { error } = await supabase
    .from('initiative_projects')
    .delete()
    .eq('initiative_id', initiativeId)
    .eq('project_id', projectId)

  if (error) return { error: error.message }

  revalidatePath(`/initiatives/${initiativeId}`)
  return {}
}
