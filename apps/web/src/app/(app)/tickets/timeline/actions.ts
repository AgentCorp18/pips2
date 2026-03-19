'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'

/* ============================================================
   Types
   ============================================================ */

export type TimelineTicket = {
  id: string
  title: string
  status: string
  priority: string
  type: string
  due_date: string | null
  started_at: string | null
  created_at: string
  resolved_at: string | null
  assignee_name: string | null
  assignee_id: string | null
  project_title: string | null
  project_id: string | null
  sequence_number: number
  parent_id: string | null
}

/* ============================================================
   getTicketsForTimeline — fetches tickets with date information
   for rendering on a horizontal timeline / Gantt chart.
   ============================================================ */

export const getTicketsForTimeline = async (
  orgId: string,
  filters?: {
    assignee_id?: string
    project_id?: string
    priority?: string[]
    status?: string[]
  },
): Promise<TimelineTicket[]> => {
  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return []
  }

  const supabase = await createClient()

  let query = supabase
    .from('tickets')
    .select(
      `
      id,
      title,
      status,
      priority,
      type,
      due_date,
      started_at,
      created_at,
      resolved_at,
      assignee_id,
      project_id,
      sequence_number,
      parent_id,
      assignee:profiles!tickets_assignee_id_fkey ( display_name, full_name ),
      project:projects!tickets_project_id_fkey ( title )
    `,
    )
    .eq('org_id', orgId)
    .not('status', 'in', '("cancelled")')
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .limit(500)

  if (filters?.assignee_id) {
    query = query.eq('assignee_id', filters.assignee_id)
  }
  if (filters?.project_id) {
    query = query.eq('project_id', filters.project_id)
  }
  if (filters?.priority && filters.priority.length > 0) {
    query = query.in('priority', filters.priority)
  }
  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch timeline tickets:', error.message)
    return []
  }

  return (data ?? []).map((t) => {
    const assignee = t.assignee as unknown as {
      display_name: string | null
      full_name: string | null
    } | null
    const project = t.project as unknown as { title: string } | null

    return {
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      type: t.type,
      due_date: t.due_date,
      started_at: t.started_at,
      created_at: t.created_at,
      resolved_at: t.resolved_at,
      assignee_name: assignee?.display_name ?? assignee?.full_name ?? null,
      assignee_id: t.assignee_id,
      project_title: project?.title ?? null,
      project_id: t.project_id,
      sequence_number: t.sequence_number,
      parent_id: t.parent_id,
    }
  })
}
