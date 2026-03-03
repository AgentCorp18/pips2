import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTicket, getChildTickets, getParentTicket } from '../actions'
import { getComments } from './comment-actions'
import { TicketDetailClient } from '@/components/tickets/ticket-detail-client'
import { CommentSection } from '@/components/tickets/comment-section'
import { ParentTicketLink } from '@/components/tickets/parent-ticket-link'
import { SubTickets } from '@/components/tickets/sub-tickets'
import { Separator } from '@/components/ui/separator'
import type { TicketStatus, TicketPriority, TicketType } from '@/types/tickets'

/* ============================================================
   Page Props
   ============================================================ */

type TicketDetailPageProps = {
  params: Promise<{ ticketId: string }>
}

/* ============================================================
   Metadata
   ============================================================ */

export const generateMetadata = async ({ params }: TicketDetailPageProps): Promise<Metadata> => {
  const { ticketId } = await params
  const ticket = await getTicket(ticketId)

  return {
    title: ticket ? `${ticket.title} - PIPS` : 'Ticket Not Found',
  }
}

/* ============================================================
   Page
   ============================================================ */

const TicketDetailPage = async ({ params }: TicketDetailPageProps) => {
  const { ticketId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const ticket = await getTicket(ticketId)
  if (!ticket) {
    notFound()
  }

  // Get org settings for ticket prefix
  const { data: orgSettings } = await supabase
    .from('org_settings')
    .select('ticket_prefix')
    .eq('org_id', ticket.org_id)
    .single()

  const prefix = orgSettings?.ticket_prefix ?? 'TKT'
  const sequenceId = `${prefix}-${ticket.sequence_number}`

  // Fetch parent ticket if this ticket has a parent
  const parentData = ticket.parent_id ? await getParentTicket(ticket.parent_id) : null

  // Fetch child tickets
  const childTicketsRaw = await getChildTickets(ticketId)
  const childTickets = childTicketsRaw.map((c) => {
    const assignee = c.assignee as unknown as {
      id: string
      display_name: string
      avatar_url: string | null
    } | null
    return {
      id: c.id,
      title: c.title,
      status: c.status as TicketStatus,
      priority: c.priority as TicketPriority,
      assignee,
    }
  })

  // Compute parent sequence ID for breadcrumb
  let parentSequenceId: string | undefined
  if (parentData) {
    const { data: parentOrgSettings } = await supabase
      .from('org_settings')
      .select('ticket_prefix')
      .eq('org_id', parentData.org_id)
      .single()
    const parentPrefix = parentOrgSettings?.ticket_prefix ?? 'TKT'
    parentSequenceId = `${parentPrefix}-${parentData.sequence_number}`
  }

  // Fetch comments
  const commentsRaw = await getComments(ticketId)
  const comments = commentsRaw.map((c) => {
    const author = c.author as unknown as {
      id: string
      display_name: string
      avatar_url: string | null
    }
    return {
      id: c.id,
      body: c.body,
      edited_at: c.edited_at,
      created_at: c.created_at,
      author_id: c.author_id,
      author,
    }
  })

  // Fetch org members for assignee selector and mentions
  const { data: membersRaw } = await supabase
    .from('org_members')
    .select('user_id, profiles!org_members_user_id_fkey ( display_name )')
    .eq('org_id', ticket.org_id)

  const members = (membersRaw ?? []).map((m) => {
    const profile = m.profiles as unknown as { display_name: string } | null
    return {
      user_id: m.user_id,
      display_name: profile?.display_name ?? 'Unknown',
    }
  })

  // Shape ticket data for client component
  const assignee = ticket.assignee as unknown as {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
  const reporter = ticket.reporter as unknown as {
    id: string
    display_name: string
    avatar_url: string | null
  }
  const project = ticket.project as unknown as {
    id: string
    name: string
  } | null

  const ticketData = {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status as TicketStatus,
    priority: ticket.priority as TicketPriority,
    type: ticket.type as TicketType,
    assignee_id: ticket.assignee_id,
    due_date: ticket.due_date,
    tags: ticket.tags ?? [],
    project,
    assignee,
    reporter,
    created_at: ticket.created_at,
    updated_at: ticket.updated_at,
  }

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {parentData && parentSequenceId && (
        <ParentTicketLink
          parentId={parentData.id}
          parentTitle={parentData.title}
          parentSequenceId={parentSequenceId}
        />
      )}

      <TicketDetailClient ticket={ticketData} sequenceId={sequenceId} members={members} />

      <Separator className="my-8" />

      <SubTickets parentTicketId={ticketId} tickets={childTickets} />

      <Separator className="my-8" />

      <CommentSection
        ticketId={ticketId}
        comments={comments}
        currentUserId={user.id}
        members={members}
      />
    </div>
  )
}

export default TicketDetailPage
