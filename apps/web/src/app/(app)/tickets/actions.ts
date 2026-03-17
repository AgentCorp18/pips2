'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { createTicketSchema, updateTicketSchema, ticketFiltersSchema } from '@/lib/validations'
import { trackServerEvent } from '@/lib/analytics'
import type { TicketStatus, TicketPriority } from '@/types/tickets'

/* ============================================================
   Action State Types
   ============================================================ */

export type TicketActionState = {
  error?: string
  fieldErrors?: Record<string, string>
  success?: boolean
  redirectTo?: string
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
    description: formData.get('description') ?? undefined,
    type: formData.get('type'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    assignee_id: formData.get('assignee_id') ?? undefined,
    project_id: formData.get('project_id') ?? undefined,
    parent_id: formData.get('parent_id') ?? undefined,
    due_date: formData.get('due_date') ?? undefined,
    tags: formData.get('tags') ?? undefined,
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

  const { supabase, user, orgId } = await getAuthContext()

  if (!user) {
    return { error: 'You must be signed in to create a ticket' }
  }

  if (!orgId) {
    return { error: 'You must belong to an organization' }
  }

  try {
    await requirePermission(orgId, 'ticket.create', { supabase, userId: user.id })
  } catch {
    return { error: 'You do not have permission to create tickets' }
  }

  // FIX 2: Validate assignee belongs to the same org
  if (result.data.assignee_id) {
    const { data: assigneeMembership } = await supabase
      .from('org_members')
      .select('user_id')
      .eq('user_id', result.data.assignee_id)
      .eq('org_id', orgId)
      .eq('status', 'active')
      .maybeSingle()

    if (!assigneeMembership) {
      return { error: 'Assignee is not an active member of this organization' }
    }
  }

  // Security: Validate project_id belongs to the same org to prevent cross-org data leakage
  if (result.data.project_id) {
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', result.data.project_id)
      .eq('org_id', orgId)
      .maybeSingle()

    if (!project) {
      return { error: 'Project does not belong to this organization' }
    }
  }

  const tagsArray = result.data.tags
    ? result.data.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  // CEO Requests auto-escalate: always critical priority, always todo status
  const isCeoRequest = result.data.type === 'ceo_request'
  const effectivePriority = isCeoRequest ? 'critical' : result.data.priority
  const effectiveStatus = isCeoRequest ? 'todo' : result.data.status

  const { error: insertError } = await supabase.from('tickets').insert({
    org_id: orgId,
    title: result.data.title,
    description: result.data.description || null,
    type: result.data.type,
    status: effectiveStatus,
    priority: effectivePriority,
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

  trackServerEvent('ticket.created', {
    ticket_type: result.data.type,
    has_assignee: !!result.data.assignee_id,
    has_project: !!result.data.project_id,
  })

  revalidatePath('/tickets')
  return { success: true, redirectTo: '/tickets' }
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

  const { supabase, user } = await getAuthContext()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  // Verify ticket exists and user has access
  // FIX 4: fetch started_at and status so we can avoid overwriting them
  const { data: ticket } = await supabase
    .from('tickets')
    .select('org_id, started_at, status')
    .eq('id', ticketId)
    .single()

  if (!ticket) {
    return { error: 'Ticket not found' }
  }

  // FIX 1: wrap requirePermission in try/catch
  try {
    await requirePermission(ticket.org_id, 'ticket.update')
  } catch {
    return { error: 'You do not have permission to update tickets' }
  }

  // FIX 2: Validate assignee belongs to the same org
  if (result.data.assignee_id) {
    const { data: assigneeMembership } = await supabase
      .from('org_members')
      .select('user_id')
      .eq('user_id', result.data.assignee_id)
      .eq('org_id', ticket.org_id)
      .eq('status', 'active')
      .maybeSingle()

    if (!assigneeMembership) {
      return { error: 'Assignee is not an active member of this organization' }
    }
  }

  // Security: Validate project_id belongs to the same org to prevent cross-org data leakage
  if (result.data.project_id) {
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', result.data.project_id)
      .eq('org_id', ticket.org_id)
      .maybeSingle()

    if (!project) {
      return { error: 'Project does not belong to this organization' }
    }
  }

  // Build update payload, strip empty strings to null
  const update: Record<string, unknown> = {}
  const d = result.data
  if (d.title !== undefined) update.title = d.title
  if (d.description !== undefined) update.description = d.description || null
  if (d.type !== undefined) update.type = d.type
  if (d.status !== undefined) update.status = d.status
  if (d.priority !== undefined) update.priority = d.priority

  // CEO Request auto-escalation: if type changes to ceo_request, force critical priority
  // (only when no explicit priority was provided — don't override user's chosen priority)
  if (d.type === 'ceo_request' && d.priority === undefined) {
    update.priority = 'critical'
  }
  if (d.assignee_id !== undefined) update.assignee_id = d.assignee_id || null
  if (d.project_id !== undefined) update.project_id = d.project_id || null
  if (d.due_date !== undefined) update.due_date = d.due_date || null
  if (d.tags !== undefined) update.tags = d.tags

  // FIX 4: Only set started_at if ticket doesn't already have one
  if ((d.status === 'in_progress' || d.status === 'in_review') && !ticket.started_at) {
    update.started_at = new Date().toISOString()
  }
  // FIX 4: Set resolved_at when transitioning TO done/cancelled, clear when transitioning AWAY
  if (d.status === 'done' || d.status === 'cancelled') {
    update.resolved_at = new Date().toISOString()
  } else if (d.status !== undefined) {
    // Transitioning away from done/cancelled — clear resolved_at
    update.resolved_at = null
  }

  const { error: updateError } = await supabase
    .from('tickets')
    .update(update)
    .eq('id', ticketId)
    .eq('org_id', ticket.org_id)

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
  const { supabase, user } = await getAuthContext()

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

  // FIX 1: wrap requirePermission in try/catch
  try {
    await requirePermission(ticket.org_id, 'ticket.delete')
  } catch {
    return { error: 'You do not have permission to delete tickets' }
  }

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
  try {
    await requirePermission(orgId, 'data.view')
  } catch {
    return { tickets: [], total: 0 }
  }

  const filters = ticketFiltersSchema.parse(rawFilters ?? {})

  const supabase = await createClient()

  let query = supabase
    .from('tickets')
    .select(
      `
      *,
      assignee:profiles!tickets_assignee_id_fkey ( id, full_name, display_name, avatar_url ),
      reporter:profiles!tickets_reporter_id_fkey ( id, full_name, display_name, avatar_url ),
      modifier:profiles!tickets_updated_by_fkey ( id, full_name, display_name ),
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

  // FIX 5: For priority sort, skip .order() in Supabase and sort in JS instead
  const ascending = filters.sort_order === 'asc'
  if (filters.sort_by !== 'priority') {
    query = query.order(filters.sort_by, { ascending })
  }

  // Pagination
  const from = (filters.page - 1) * filters.per_page
  const to = from + filters.per_page - 1
  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Failed to fetch tickets:', error.message)
    return { tickets: [], total: 0 }
  }

  let tickets = data ?? []

  // FIX 5: Sort by priority ordinal in JS
  if (filters.sort_by === 'priority') {
    const priorityOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      none: 4,
    }
    tickets = [...tickets].sort((a, b) => {
      const aOrd = priorityOrder[(a as Record<string, unknown>).priority as string] ?? 4
      const bOrd = priorityOrder[(b as Record<string, unknown>).priority as string] ?? 4
      return ascending ? aOrd - bOrd : bOrd - aOrd
    })
  }

  return { tickets, total: count ?? 0 }
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
      assignee:profiles!tickets_assignee_id_fkey ( id, full_name, display_name, avatar_url ),
      reporter:profiles!tickets_reporter_id_fkey ( id, full_name, display_name, avatar_url ),
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
      *,
      assignee:profiles!tickets_assignee_id_fkey ( id, full_name, display_name, avatar_url ),
      reporter:profiles!tickets_reporter_id_fkey ( id, full_name, display_name, avatar_url ),
      project:projects!tickets_project_id_fkey ( id, title )
    `,
    )
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(500)

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
  data: { status?: TicketStatus; priority?: TicketPriority; assignee_id?: string | null },
): Promise<TicketActionState> => {
  if (ticketIds.length === 0) {
    return { error: 'No tickets selected' }
  }

  const { supabase, user, orgId } = await getAuthContext()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  if (!orgId) {
    return { error: 'You must belong to an organization' }
  }

  // FIX 1: wrap requirePermission in try/catch
  try {
    await requirePermission(orgId, 'ticket.update', { supabase, userId: user.id })
  } catch {
    return { error: 'You do not have permission to update tickets' }
  }

  // Validate assignee belongs to the same org if provided
  if (data.assignee_id !== undefined && data.assignee_id !== null) {
    const { data: assigneeMembership } = await supabase
      .from('org_members')
      .select('user_id')
      .eq('user_id', data.assignee_id)
      .eq('org_id', orgId)
      .eq('status', 'active')
      .maybeSingle()

    if (!assigneeMembership) {
      return { error: 'Assignee is not an active member of this organization' }
    }
  }

  const update: Record<string, unknown> = {}
  if (data.status) update.status = data.status
  if (data.priority) update.priority = data.priority
  if (data.assignee_id !== undefined) update.assignee_id = data.assignee_id

  if (data.status === 'done' || data.status === 'cancelled') {
    update.resolved_at = new Date().toISOString()
  } else if (data.status) {
    // Transitioning away from done/cancelled — clear resolved_at
    update.resolved_at = null
  }

  // FIX 3: Guard against empty update
  if (Object.keys(update).length === 0) {
    return { error: 'No fields to update' }
  }

  const { error: updateError } = await supabase
    .from('tickets')
    .update(update)
    .in('id', ticketIds)
    .eq('org_id', orgId)

  // Set started_at only on tickets that don't already have one
  if (!updateError && (data.status === 'in_progress' || data.status === 'in_review')) {
    await supabase
      .from('tickets')
      .update({ started_at: new Date().toISOString() })
      .in('id', ticketIds)
      .eq('org_id', orgId)
      .is('started_at', null)
  }

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
      assignee:profiles!tickets_assignee_id_fkey ( id, full_name, display_name, avatar_url )
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

  const { supabase, user } = await getAuthContext()

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

  try {
    await requirePermission(ticket.org_id, 'ticket.update')
  } catch {
    return { error: 'Insufficient permissions' }
  }

  // Fetch all tickets in the org that could be part of the ancestor chain in one query,
  // then walk the parent chain in-memory — avoids N+1 sequential DB calls.
  const { data: orgTickets } = await supabase
    .from('tickets')
    .select('id, parent_id')
    .eq('org_id', ticket.org_id)

  const parentMap = new Map<string, string | null>()
  if (orgTickets) {
    for (const t of orgTickets) {
      parentMap.set(t.id, (t.parent_id as string | null) ?? null)
    }
  }

  // Check for circular reference: walk up from parentTicketId using in-memory map
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
    currentId = parentMap.get(currentId) ?? null
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
  const { supabase, user } = await getAuthContext()

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

  try {
    await requirePermission(ticket.org_id, 'ticket.update')
  } catch {
    return { error: 'Insufficient permissions' }
  }

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

  const { supabase, user, orgId } = await getAuthContext()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  if (!orgId) {
    return { error: 'You must belong to an organization' }
  }

  // FIX 1: wrap requirePermission in try/catch
  try {
    await requirePermission(orgId, 'ticket.delete', { supabase, userId: user.id })
  } catch {
    return { error: 'You do not have permission to delete tickets' }
  }

  const { error: deleteError } = await supabase
    .from('tickets')
    .delete()
    .in('id', ticketIds)
    .eq('org_id', orgId)

  if (deleteError) {
    console.error('Failed to bulk delete tickets:', deleteError.message)
    return { error: 'Failed to delete tickets. Please try again.' }
  }

  revalidatePath('/tickets')
  return {}
}
