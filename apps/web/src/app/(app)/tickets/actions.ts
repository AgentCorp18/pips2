'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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
    parent_id: formData.get('parent_id'),
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
    parent_id: result.data.parent_id || null,
    reporter_id: user.id,
    due_date: result.data.due_date || null,
    tags: tagsArray,
  })

  if (insertError) {
    console.error('Failed to create ticket:', insertError.message)
    return { error: 'Failed to create ticket. Please try again.' }
  }

  revalidatePath('/tickets')
  redirect('/tickets')
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
      project:projects!tickets_project_id_fkey ( id, title )
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
  if (filters.unassigned) {
    query = query.is('assignee_id', null)
  } else if (filters.assignee_id) {
    query = query.eq('assignee_id', filters.assignee_id)
  }
  if (filters.reporter_id) {
    query = query.eq('reporter_id', filters.reporter_id)
  }
  if (filters.project_id) {
    query = query.eq('project_id', filters.project_id)
  }
  if (filters.due_date_before) {
    query = query.lt('due_date', filters.due_date_before).not('due_date', 'is', null)
  }
  if (filters.search) {
    // Escape LIKE wildcards to prevent unintended broad matching
    const escaped = filters.search.replace(/[%_\\]/g, '\\$&')
    query = query.ilike('title', `%${escaped}%`)
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
      project:projects!tickets_project_id_fkey ( id, title )
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
  filters?: {
    priority?: string[]
    assignee_id?: string
    reporter_id?: string
    project_id?: string
    unassigned?: boolean
    due_date_before?: string
    type?: string[]
  },
) => {
  const supabase = await createClient()

  let query = supabase
    .from('tickets')
    .select(
      `
      *,
      assignee:profiles!tickets_assignee_id_fkey ( id, display_name, avatar_url ),
      reporter:profiles!tickets_reporter_id_fkey ( id, display_name, avatar_url ),
      project:projects!tickets_project_id_fkey ( id, title )
    `,
    )
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (filters?.priority && filters.priority.length > 0) {
    query = query.in('priority', filters.priority)
  }
  if (filters?.type && filters.type.length > 0) {
    query = query.in('type', filters.type)
  }
  if (filters?.unassigned) {
    query = query.is('assignee_id', null)
  } else if (filters?.assignee_id) {
    query = query.eq('assignee_id', filters.assignee_id)
  }
  if (filters?.reporter_id) {
    query = query.eq('reporter_id', filters.reporter_id)
  }
  if (filters?.project_id) {
    query = query.eq('project_id', filters.project_id)
  }
  if (filters?.due_date_before) {
    query = query.lt('due_date', filters.due_date_before).not('due_date', 'is', null)
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
   getChildTickets
   ============================================================ */

export const getChildTickets = async (ticketId: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tickets')
    .select(
      `
      id,
      title,
      status,
      priority,
      assignee:profiles!tickets_assignee_id_fkey ( id, display_name, avatar_url )
    `,
    )
    .eq('parent_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch child tickets:', error.message)
    return []
  }

  return data ?? []
}

/* ============================================================
   getParentTicket (lightweight — just id, title, sequence)
   ============================================================ */

export const getParentTicket = async (parentId: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tickets')
    .select('id, title, sequence_number, org_id')
    .eq('id', parentId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/* ============================================================
   setParentTicket
   ============================================================ */

export const setParentTicket = async (
  ticketId: string,
  parentTicketId: string,
): Promise<TicketActionState> => {
  if (ticketId === parentTicketId) {
    return { error: 'A ticket cannot be its own parent' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  // Verify both tickets exist and belong to same org
  const { data: ticket } = await supabase
    .from('tickets')
    .select('org_id, parent_id')
    .eq('id', ticketId)
    .single()

  if (!ticket) {
    return { error: 'Ticket not found' }
  }

  const { data: parentTicket } = await supabase
    .from('tickets')
    .select('org_id, parent_id')
    .eq('id', parentTicketId)
    .single()

  if (!parentTicket) {
    return { error: 'Parent ticket not found' }
  }

  if (ticket.org_id !== parentTicket.org_id) {
    return { error: 'Tickets must belong to the same organization' }
  }

  await requirePermission(ticket.org_id, 'ticket.create')

  // Helper to fetch a ticket's parent_id (breaks TS circular inference)
  const fetchParentId = async (id: string): Promise<string | null> => {
    const { data } = await supabase.from('tickets').select('parent_id').eq('id', id).single()
    return (data?.parent_id as string | null) ?? null
  }

  // Check for circular reference: walk up from parentTicketId
  const visited = new Set<string>([ticketId])
  let depth = 0
  let currentId: string | null = parentTicketId

  while (currentId) {
    if (visited.has(currentId)) {
      return { error: 'This would create a circular reference' }
    }
    visited.add(currentId)
    depth++
    if (depth > 10) {
      return { error: 'Hierarchy depth exceeds safety limit' }
    }
    currentId = await fetchParentId(currentId)
  }

  // depth here is the depth of the parent from root.
  // The ticket will be at depth level. Max allowed is 2 (0-indexed: root=0, child=1, grandchild=2)
  if (depth >= 3) {
    return { error: 'Maximum nesting depth of 3 levels would be exceeded' }
  }

  // Check that ticket's children wouldn't exceed max depth either
  const { data: children } = await supabase
    .from('tickets')
    .select('id')
    .eq('parent_id', ticketId)
    .limit(1)

  if (children && children.length > 0 && depth >= 2) {
    return { error: 'This ticket has children and moving it here would exceed max nesting depth' }
  }

  const { error: updateError } = await supabase
    .from('tickets')
    .update({ parent_id: parentTicketId })
    .eq('id', ticketId)

  if (updateError) {
    console.error('Failed to set parent ticket:', updateError.message)
    return { error: 'Failed to set parent ticket. Please try again.' }
  }

  revalidatePath('/tickets')
  revalidatePath(`/tickets/${ticketId}`)
  revalidatePath(`/tickets/${parentTicketId}`)
  return {}
}

/* ============================================================
   removeParentTicket
   ============================================================ */

export const removeParentTicket = async (ticketId: string): Promise<TicketActionState> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  const { data: ticket } = await supabase
    .from('tickets')
    .select('org_id, parent_id')
    .eq('id', ticketId)
    .single()

  if (!ticket) {
    return { error: 'Ticket not found' }
  }

  await requirePermission(ticket.org_id, 'ticket.create')

  const previousParentId = ticket.parent_id

  const { error: updateError } = await supabase
    .from('tickets')
    .update({ parent_id: null })
    .eq('id', ticketId)

  if (updateError) {
    console.error('Failed to remove parent ticket:', updateError.message)
    return { error: 'Failed to remove parent ticket. Please try again.' }
  }

  revalidatePath('/tickets')
  revalidatePath(`/tickets/${ticketId}`)
  if (previousParentId) {
    revalidatePath(`/tickets/${previousParentId}`)
  }
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
