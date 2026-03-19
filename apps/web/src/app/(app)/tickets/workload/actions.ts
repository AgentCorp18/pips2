'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'

/* ============================================================
   Types
   ============================================================ */

export type WorkloadMember = {
  user_id: string
  display_name: string
  avatar_url: string | null
  tickets: WorkloadTicket[]
}

export type WorkloadTicket = {
  id: string
  title: string
  status: string
  priority: string
  type: string
  due_date: string | null
  sequence_number: number
  project_title: string | null
}

/* ============================================================
   getWorkloadData — fetches open tickets grouped by assignee
   for a team workload heatmap / capacity view.
   ============================================================ */

export const getWorkloadData = async (
  orgId: string,
  filters?: {
    project_id?: string
    include_done?: boolean
  },
): Promise<{ members: WorkloadMember[]; unassignedCount: number }> => {
  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return { members: [], unassignedCount: 0 }
  }

  const supabase = await createClient()

  // Fetch all org members with profiles
  const { data: membersRaw } = await supabase
    .from('org_members')
    .select('user_id, profiles!org_members_user_id_fkey ( full_name, display_name, avatar_url )')
    .eq('org_id', orgId)

  // Fetch open tickets
  const activeStatuses = filters?.include_done
    ? ['backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done']
    : ['backlog', 'todo', 'in_progress', 'in_review', 'blocked']

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
      sequence_number,
      assignee_id,
      project:projects!tickets_project_id_fkey ( title )
    `,
    )
    .eq('org_id', orgId)
    .in('status', activeStatuses)
    .order('priority', { ascending: true })
    .limit(1000)

  if (filters?.project_id) {
    query = query.eq('project_id', filters.project_id)
  }

  const { data: ticketsRaw, error } = await query

  if (error) {
    console.error('Failed to fetch workload tickets:', error.message)
    return { members: [], unassignedCount: 0 }
  }

  const tickets = ticketsRaw ?? []

  // Group tickets by assignee
  const ticketsByAssignee = new Map<string | null, typeof tickets>()
  for (const ticket of tickets) {
    const key = ticket.assignee_id
    if (!ticketsByAssignee.has(key)) {
      ticketsByAssignee.set(key, [])
    }
    ticketsByAssignee.get(key)!.push(ticket)
  }

  const unassignedCount = ticketsByAssignee.get(null)?.length ?? 0

  // Build member workload list
  const members: WorkloadMember[] = (membersRaw ?? []).map((m) => {
    const profile = m.profiles as unknown as {
      full_name: string
      display_name: string | null
      avatar_url: string | null
    } | null

    const memberTickets = ticketsByAssignee.get(m.user_id) ?? []

    return {
      user_id: m.user_id,
      display_name: profile?.display_name || profile?.full_name || 'Unknown',
      avatar_url: profile?.avatar_url ?? null,
      tickets: memberTickets.map((t) => {
        const project = t.project as unknown as { title: string } | null
        return {
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          type: t.type,
          due_date: t.due_date,
          sequence_number: t.sequence_number,
          project_title: project?.title ?? null,
        }
      }),
    }
  })

  // Sort: most loaded first
  members.sort((a, b) => b.tickets.length - a.tickets.length)

  return { members, unassignedCount }
}
