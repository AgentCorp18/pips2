'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'

/* ============================================================
   Types
   ============================================================ */

export type CalendarTicket = {
  id: string
  title: string
  status: string
  priority: string
  due_date: string
  assignee_name: string | null
  project_title: string | null
  sequence_number: number
}

/* ============================================================
   getTicketsForCalendar — fetches tickets with due dates in
   a given month (plus a buffer week on each side)
   ============================================================ */

export const getTicketsForCalendar = async (
  orgId: string,
  year: number,
  month: number,
  filters?: {
    assignee_id?: string
    project_id?: string
    priority?: string[]
  },
): Promise<CalendarTicket[]> => {
  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return []
  }

  const supabase = await createClient()

  // Query from 7 days before month start to 7 days after month end
  // to catch tickets visible on adjacent calendar cells
  const startDate = new Date(year, month - 1, -6) // 7 days before 1st
  const endDate = new Date(year, month, 7) // 7 days after last day

  const startStr = startDate.toISOString().split('T')[0]!
  const endStr = endDate.toISOString().split('T')[0]!

  let query = supabase
    .from('tickets')
    .select(
      `
      id,
      title,
      status,
      priority,
      due_date,
      sequence_number,
      assignee:profiles!tickets_assignee_id_fkey ( display_name, full_name ),
      project:projects!tickets_project_id_fkey ( title )
    `,
    )
    .eq('org_id', orgId)
    .not('due_date', 'is', null)
    .gte('due_date', startStr)
    .lte('due_date', endStr)
    .order('due_date', { ascending: true })
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

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch calendar tickets:', error.message)
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
      due_date: t.due_date!,
      assignee_name: assignee?.display_name ?? assignee?.full_name ?? null,
      project_title: project?.title ?? null,
      sequence_number: t.sequence_number,
    }
  })
}
