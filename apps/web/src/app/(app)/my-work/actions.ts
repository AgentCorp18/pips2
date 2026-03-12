'use server'

import { createClient } from '@/lib/supabase/server'

export type MyWorkTicket = {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  project: { id: string; title: string } | null
  sequence_number: number
}

export type GroupedTickets = {
  overdue: MyWorkTicket[]
  dueToday: MyWorkTicket[]
  thisWeek: MyWorkTicket[]
  later: MyWorkTicket[]
}

export const getMyTickets = async (orgId: string): Promise<GroupedTickets> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { overdue: [], dueToday: [], thisWeek: [], later: [] }
  }

  const userId = user.id

  const { data: tickets } = await supabase
    .from('tickets')
    .select(
      `
      id,
      title,
      status,
      priority,
      due_date,
      sequence_number,
      project:projects!tickets_project_id_fkey ( id, title )
    `,
    )
    .eq('org_id', orgId)
    .eq('assignee_id', userId)
    .in('status', ['backlog', 'todo', 'in_progress', 'in_review', 'blocked'])
    .order('due_date', { ascending: true, nullsFirst: false })

  if (!tickets || tickets.length === 0) {
    return { overdue: [], dueToday: [], thisWeek: [], later: [] }
  }

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0] ?? ''

  // End of week (Sunday)
  const endOfWeek = new Date(now)
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()))
  const endOfWeekStr = endOfWeek.toISOString().split('T')[0] ?? ''

  const grouped: GroupedTickets = {
    overdue: [],
    dueToday: [],
    thisWeek: [],
    later: [],
  }

  for (const ticket of tickets) {
    const rawProject = ticket.project
    const project = Array.isArray(rawProject)
      ? ((rawProject[0] as { id: string; title: string } | undefined) ?? null)
      : (rawProject as { id: string; title: string } | null)

    const mapped: MyWorkTicket = {
      id: ticket.id,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      due_date: ticket.due_date,
      project,
      sequence_number: ticket.sequence_number,
    }

    if (!ticket.due_date) {
      grouped.later.push(mapped)
    } else if (ticket.due_date < todayStr) {
      grouped.overdue.push(mapped)
    } else if (ticket.due_date === todayStr) {
      grouped.dueToday.push(mapped)
    } else if (ticket.due_date <= endOfWeekStr) {
      grouped.thisWeek.push(mapped)
    } else {
      grouped.later.push(mapped)
    }
  }

  return grouped
}
