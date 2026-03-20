'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'

/* ============================================================
   Types
   ============================================================ */

export type ActionResult<T = undefined> = T extends undefined
  ? { error?: string }
  : { error?: string; data?: T }

export type LinkedTicket = {
  id: string
  linkId: string
  title: string
  sequence_number: number
  status: string
}

export type TicketLinksData = {
  blocking: LinkedTicket[]
  blockedBy: LinkedTicket[]
  related: LinkedTicket[]
}

/* ============================================================
   Validation schemas
   ============================================================ */

const addLinkSchema = z.object({
  sourceTicketId: z.string().uuid(),
  targetTicketId: z.string().uuid(),
  linkType: z.enum(['blocks', 'related']),
})

/* ============================================================
   getTicketLinks — fetch all link relationships for a ticket
   ============================================================ */

export const getTicketLinks = async (ticketId: string): Promise<ActionResult<TicketLinksData>> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  // Verify ticket exists and get org_id
  const { data: ticket } = await supabase
    .from('tickets')
    .select('org_id')
    .eq('id', ticketId)
    .single()

  if (!ticket) {
    return { error: 'Ticket not found' }
  }

  // Fetch outgoing links (this ticket is source → it blocks others)
  const { data: outgoing, error: outError } = await supabase
    .from('ticket_links')
    .select(
      `
      id,
      link_type,
      target:tickets!ticket_links_target_ticket_id_fkey ( id, title, sequence_number, status )
    `,
    )
    .eq('source_ticket_id', ticketId)
    .eq('org_id', ticket.org_id)

  if (outError) {
    console.error('Failed to fetch outgoing ticket links:', outError.message)
    return { error: 'Failed to load ticket links' }
  }

  // Fetch incoming links (this ticket is target → it is blocked by others)
  const { data: incoming, error: inError } = await supabase
    .from('ticket_links')
    .select(
      `
      id,
      link_type,
      source:tickets!ticket_links_source_ticket_id_fkey ( id, title, sequence_number, status )
    `,
    )
    .eq('target_ticket_id', ticketId)
    .eq('org_id', ticket.org_id)

  if (inError) {
    console.error('Failed to fetch incoming ticket links:', inError.message)
    return { error: 'Failed to load ticket links' }
  }

  const blocking: LinkedTicket[] = []
  const related: LinkedTicket[] = []

  for (const row of outgoing ?? []) {
    const t = row.target as unknown as {
      id: string
      title: string
      sequence_number: number
      status: string
    } | null
    if (!t) continue

    const linked: LinkedTicket = {
      id: t.id,
      linkId: row.id,
      title: t.title,
      sequence_number: t.sequence_number,
      status: t.status,
    }

    if (row.link_type === 'blocks') {
      blocking.push(linked)
    } else {
      related.push(linked)
    }
  }

  const blockedBy: LinkedTicket[] = []

  for (const row of incoming ?? []) {
    const t = row.source as unknown as {
      id: string
      title: string
      sequence_number: number
      status: string
    } | null
    if (!t) continue

    if (row.link_type === 'blocks') {
      blockedBy.push({
        id: t.id,
        linkId: row.id,
        title: t.title,
        sequence_number: t.sequence_number,
        status: t.status,
      })
    } else {
      // Bidirectional related: also show in the related list
      related.push({
        id: t.id,
        linkId: row.id,
        title: t.title,
        sequence_number: t.sequence_number,
        status: t.status,
      })
    }
  }

  return { data: { blocking, blockedBy, related } }
}

/* ============================================================
   addTicketLink — create a new link between two tickets
   ============================================================ */

export const addTicketLink = async (
  sourceTicketId: string,
  targetTicketId: string,
  linkType: 'blocks' | 'related',
): Promise<ActionResult> => {
  const parsed = addLinkSchema.safeParse({ sourceTicketId, targetTicketId, linkType })
  if (!parsed.success) {
    return { error: 'Invalid input' }
  }

  if (sourceTicketId === targetTicketId) {
    return { error: 'A ticket cannot link to itself' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  // Fetch both tickets, verify they both exist and belong to the same org
  const { data: tickets } = await supabase
    .from('tickets')
    .select('id, org_id')
    .in('id', [sourceTicketId, targetTicketId])

  if (!tickets || tickets.length !== 2) {
    return { error: 'One or both tickets not found' }
  }

  const orgId = tickets[0]!.org_id
  if (tickets[1]!.org_id !== orgId) {
    return { error: 'Tickets must belong to the same organization' }
  }

  try {
    await requirePermission(orgId, 'ticket.update')
  } catch {
    return { error: 'You do not have permission to link tickets' }
  }

  const { error: insertError } = await supabase.from('ticket_links').insert({
    org_id: orgId,
    source_ticket_id: sourceTicketId,
    target_ticket_id: targetTicketId,
    link_type: linkType,
    created_by: user.id,
  })

  if (insertError) {
    if (insertError.code === '23505') {
      return { error: 'This link already exists' }
    }
    console.error('Failed to create ticket link:', insertError.message)
    return { error: 'Failed to create link. Please try again.' }
  }

  revalidatePath(`/tickets/${sourceTicketId}`)
  revalidatePath(`/tickets/${targetTicketId}`)
  return {}
}

/* ============================================================
   removeTicketLink — delete a link by its ID
   ============================================================ */

export const removeTicketLink = async (linkId: string): Promise<ActionResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  // Fetch link to verify ownership and get org_id
  const { data: link } = await supabase
    .from('ticket_links')
    .select('id, org_id, source_ticket_id, target_ticket_id')
    .eq('id', linkId)
    .single()

  if (!link) {
    return { error: 'Link not found' }
  }

  try {
    await requirePermission(link.org_id, 'ticket.update')
  } catch {
    return { error: 'You do not have permission to remove ticket links' }
  }

  const { error: deleteError } = await supabase.from('ticket_links').delete().eq('id', linkId)

  if (deleteError) {
    console.error('Failed to delete ticket link:', deleteError.message)
    return { error: 'Failed to remove link. Please try again.' }
  }

  revalidatePath(`/tickets/${link.source_ticket_id}`)
  revalidatePath(`/tickets/${link.target_ticket_id}`)
  return {}
}

/* ============================================================
   searchTickets — find tickets by sequence number or title for the link dialog
   ============================================================ */

export const searchTickets = async (
  orgId: string,
  query: string,
  excludeTicketId: string,
): Promise<ActionResult<LinkedTicket[]>> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  if (!query.trim()) {
    return { data: [] }
  }

  // Parse TKT-NNN style queries
  const seqMatch = query.match(/^(?:[A-Z]+-)?(\d+)$/)

  let queryBuilder = supabase
    .from('tickets')
    .select('id, title, sequence_number, status')
    .eq('org_id', orgId)
    .neq('id', excludeTicketId)
    .limit(10)

  if (seqMatch) {
    queryBuilder = queryBuilder.eq('sequence_number', parseInt(seqMatch[1] ?? '0', 10))
  } else {
    queryBuilder = queryBuilder.ilike('title', `%${query}%`)
  }

  const { data, error } = await queryBuilder.order('sequence_number', { ascending: false })

  if (error) {
    console.error('Failed to search tickets:', error.message)
    return { error: 'Failed to search tickets' }
  }

  const results: LinkedTicket[] = (data ?? []).map((t) => ({
    id: t.id,
    linkId: '',
    title: t.title,
    sequence_number: t.sequence_number,
    status: t.status,
  }))

  return { data: results }
}
