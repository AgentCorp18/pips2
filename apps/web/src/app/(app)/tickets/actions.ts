'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { createTicketSchema, updateTicketSchema, ticketFiltersSchema } from '@/lib/validations'
import type { TicketStatus, TicketPriority } from '@/types/tickets'

/* ============================================================
   Action State Types
   ============================================================ */

export type TicketActionState = {
  error?: string
  fieldErrors?: Record<string, string>
}

/* ============================================================
   createTicket
   ============================================================ */

export const createTicket = async (
  _prev: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> => {
  const raw = {
    title: formData.get('title'),
    description: formData.get('description'),
    type: formData.get('type'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    assignee_id: formData.get('assignee_id'),
    project_id: formData.get('project_id'),
    due_date: formData.get('due_date'),
    tags: formData.get('tags'),
  }

  const result = createTicketSchema.safeParse(raw)
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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to create a ticket' }
  }

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) {
    return { error: 'You must belong to an organization' }
  }

  await requirePermission(membership.org_id, 'ticket.create')

  const tagsArray = result.data.tags
    ? result.data.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  const { error: insertError } = await supabase.from('tickets').insert({
    org_id: membership.org_id,
    title: result.data.title,
    description: result.data.description || null,
    type: result.data.type,
    status: result.data.status,
    priority: result.data.priority,
    assignee_id: result.data.assignee_id || null,
    project_id: result.data.project_id || null,
    reporter_id: user.id,
    due_date: result.data.due_date || null,
    tags: tagsArray,
  })

  if (insertError) {
    console.error('Failed to create ticket:', insertError.message)
    return { error: 'Failed to create ticket. Please try again.' }
  }

  revalidatePath('/tickets')
  return {}
}

/* ============================================================
   updateTicket
   ============================================================ */

export const updateTicket = async (
  ticketId: string,
  data: Record<string, unknown>,
): Promise<TicketActionState> => {
  const result = updateTicketSchema.safeParse(data)
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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  // Verify ticket exists and user has access
  const { data: ticket } = await supabase
    .from('tickets')
    .select('org_id')
    .eq('id', ticketId)
    .single()

  if (!ticket) {
    return { error: 'Ticket not found' }
  }

  await requirePermission(ticket.org_id, 'ticket.create')

  // Build update payload, strip empty strings to null
  const update: Record<string, unknown> = {}
  const d = result.data
  if (d.title !== undefined) update.title = d.title
  if (d.description !== undefined) update.description = d.description || null
  if (d.type !== undefined) update.type = d.type
  if (d.status !== undefined) update.status = d.status
  if (d.priority !== undefined) update.priority = d.priority
  if (d.assignee_id !== undefined) update.assignee_id = d.assignee_id || null
  if (d.project_id !== undefined) update.project_id = d.project_id || null
  if (d.due_date !== undefined) update.due_date = d.due_date || null
  if (d.tags !== undefined) update.tags = d.tags

  // Track started_at / resolved_at
  if (d.status === 'in_progress' || d.status === 'in_review') {
    update.started_at = new Date().toISOString()
  }
  if (d.status === 'done' || d.status === 'cancelled') {
    update.resolved_at = new Date().toISOString()
  }

  const { error: updateError } = await supabase.from('tickets').update(update).eq('id', ticketId)

  if (updateError) {
    console.error('Failed to update ticket:', updateError.message)
    return { error: 'Failed to update ticket. Please try again.' }
  }

  revalidatePath('/tickets')
  revalidatePath(`/tickets/${ticketId}`)
  return {}
}

/* ============================================================
   updateTicketStatus (quick status change for board drag)
   ============================================================ */

export const updateTicketStatus = async (
  ticketId: string,
  status: TicketStatus,
): Promise<TicketActionState> => {
  return updateTicket(ticketId, { status })
}

/* ============================================================
   deleteTicket
   ============================================================ */

export const deleteTicket = async (ticketId: string): Promise<TicketActionState> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  const { data: ticket } = await supabase
    .from('tickets')
    .select('org_id')
    .eq('id', ticketId)
    .single()

  if (!ticket) {
    return { error: 'Ticket not found' }
  }

  await requirePermission(ticket.org_id, 'ticket.create')

  const { error: deleteError } = await supabase.from('tickets').delete().eq('id', ticketId)

  if (deleteError) {
    console.error('Failed to delete ticket:', deleteError.message)
    return { error: 'Failed to delete ticket. Please try again.' }
  }

  revalidatePath('/tickets')
  return {}
}

/* ============================================================
   getTickets
   ============================================================ */

export const getTickets = async (orgId: string, rawFilters?: Record<string, unknown>) => {
  const filters = ticketFiltersSchema.parse(rawFilters ?? {})

  const supabase = await createClient()

  let query = supabase
    .from('tickets')
    .select(
      `
      *,
      assignee:profiles!tickets_assignee_id_fkey ( id, display_name, avatar_url ),
      reporter:profiles!tickets_reporter_id_fkey ( id, display_name, avatar_url ),
      project:projects!tickets_project_id_fkey ( id, name )
    `,
      { count: 'exact' },
    )
    .eq('org_id', orgId)

  // Apply filters
  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status)
  }
  if (filters.priority && filters.priority.length > 0) {
    query = query.in('priority', filters.priority)
  }
  if (filters.type && filters.type.length > 0) {
    query = query.in('type', filters.type)
  }
  if (filters.assignee_id) {
    query = query.eq('assignee_id', filters.assignee_id)
  }
  if (filters.project_id) {
    query = query.eq('project_id', filters.project_id)
  }
  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }

  // Sorting
  const ascending = filters.sort_order === 'asc'
  query = query.order(filters.sort_by, { ascending })

  // Pagination
  const from = (filters.page - 1) * filters.per_page
  const to = from + filters.per_page - 1
  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Failed to fetch tickets:', error.message)
    return { tickets: [], total: 0 }
  }

  return { tickets: data ?? [], total: count ?? 0 }
}

/* ============================================================
   getTicket
   ============================================================ */

export const getTicket = async (ticketId: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tickets')
    .select(
      `
      *,
      assignee:profiles!tickets_assignee_id_fkey ( id, display_name, avatar_url ),
      reporter:profiles!tickets_reporter_id_fkey ( id, display_name, avatar_url ),
      project:projects!tickets_project_id_fkey ( id, name )
    `,
    )
    .eq('id', ticketId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/* ============================================================
   getTicketsForBoard (no pagination — all tickets for board view)
   ============================================================ */

export const getTicketsForBoard = async (
  orgId: string,
  filters?: { priority?: string; assignee_id?: string; project_id?: string },
) => {
  const supabase = await createClient()

  let query = supabase
    .from('tickets')
    .select(
      `
      *,
      assignee:profiles!tickets_assignee_id_fkey ( id, display_name, avatar_url ),
      reporter:profiles!tickets_reporter_id_fkey ( id, display_name, avatar_url ),
      project:projects!tickets_project_id_fkey ( id, name )
    `,
    )
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }
  if (filters?.assignee_id) {
    query = query.eq('assignee_id', filters.assignee_id)
  }
  if (filters?.project_id) {
    query = query.eq('project_id', filters.project_id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch board tickets:', error.message)
    return []
  }

  return data ?? []
}

/* ============================================================
   bulkUpdateTickets
   ============================================================ */

export const bulkUpdateTickets = async (
  ticketIds: string[],
  data: { status?: TicketStatus; priority?: TicketPriority },
): Promise<TicketActionState> => {
  if (ticketIds.length === 0) {
    return { error: 'No tickets selected' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) {
    return { error: 'You must belong to an organization' }
  }

  await requirePermission(membership.org_id, 'ticket.create')

  const update: Record<string, unknown> = {}
  if (data.status) update.status = data.status
  if (data.priority) update.priority = data.priority

  if (data.status === 'in_progress' || data.status === 'in_review') {
    update.started_at = new Date().toISOString()
  }
  if (data.status === 'done' || data.status === 'cancelled') {
    update.resolved_at = new Date().toISOString()
  }

  const { error: updateError } = await supabase
    .from('tickets')
    .update(update)
    .in('id', ticketIds)
    .eq('org_id', membership.org_id)

  if (updateError) {
    console.error('Failed to bulk update tickets:', updateError.message)
    return { error: 'Failed to update tickets. Please try again.' }
  }

  revalidatePath('/tickets')
  return {}
}

/* ============================================================
   bulkDeleteTickets
   ============================================================ */

export const bulkDeleteTickets = async (ticketIds: string[]): Promise<TicketActionState> => {
  if (ticketIds.length === 0) {
    return { error: 'No tickets selected' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) {
    return { error: 'You must belong to an organization' }
  }

  await requirePermission(membership.org_id, 'ticket.create')

  const { error: deleteError } = await supabase
    .from('tickets')
    .delete()
    .in('id', ticketIds)
    .eq('org_id', membership.org_id)

  if (deleteError) {
    console.error('Failed to bulk delete tickets:', deleteError.message)
    return { error: 'Failed to delete tickets. Please try again.' }
  }

  revalidatePath('/tickets')
  return {}
}
