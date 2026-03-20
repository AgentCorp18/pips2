import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { RecentItemTracker } from '@/components/layout/recent-item-tracker'
import { createClient } from '@/lib/supabase/server'
import { getTicket, getChildTickets, getParentTicket } from '../actions'
import { getComments } from './comment-actions'
import { getTicketAuditLog } from './audit-log-actions'
import { getAttachments, getTicketCommentAttachments } from './attachment-actions'
import { getTicketLinks } from './link-actions'
import { TicketDetailClient } from '@/components/tickets/ticket-detail-client'
import { CommentSection } from '@/components/tickets/comment-section'
import { TicketAttachments } from '@/components/tickets/ticket-attachments'
import { ParentTicketLink } from '@/components/tickets/parent-ticket-link'
import { SubTickets } from '@/components/tickets/sub-tickets'
import { TicketChangeLog } from '@/components/tickets/ticket-change-log'
import { TicketProjectForms } from '@/components/tickets/ticket-project-forms'
import { TicketLinks } from '@/components/tickets/ticket-links'
import { Separator } from '@/components/ui/separator'
import type { TicketStatus, TicketPriority, TicketType } from '@/types/tickets'
import { pipsStepEnumToNumber, buildProductContext } from '@pips/shared'
import { KnowledgeCadenceBar } from '@/components/knowledge-cadence/knowledge-cadence-bar'

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
    title: ticket ? ticket.title : 'Ticket Not Found',
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

  // Fetch project forms if ticket is linked to a project
  const projectId = (ticket.project as unknown as { id: string } | null)?.id
  const projectForms = projectId
    ? await supabase
        .from('project_forms')
        .select('id, step, form_type, title')
        .eq('project_id', projectId)
        .order('step')
        .order('form_type')
        .then((r) => r.data ?? [])
    : []

  // Fetch comments, audit log, attachments, comment attachments, and links in parallel
  const [commentsRaw, auditEntries, attachmentsRaw, commentAttachmentsRaw, linksResult] =
    await Promise.all([
      getComments(ticketId),
      getTicketAuditLog(ticketId),
      getAttachments(ticketId),
      getTicketCommentAttachments(ticketId),
      getTicketLinks(ticketId),
    ])

  const ticketLinks = linksResult.data ?? { blocking: [], blockedBy: [], related: [] }
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

  // Fetch org projects for project selector
  const { data: projectsRaw } = await supabase
    .from('projects')
    .select('id, title')
    .eq('org_id', ticket.org_id)
    .neq('status', 'archived')
    .order('title')

  const orgProjects = (projectsRaw ?? []).map((p) => ({
    id: p.id as string,
    title: p.title as string,
  }))

  // Fetch initiative linked to the ticket's project (if any)
  let linkedInitiative: { id: string; title: string } | null = null
  if (ticket.project) {
    const projectObj = ticket.project as unknown as { id: string }
    const { data: ipRow } = await supabase
      .from('initiative_projects')
      .select('initiative_id, initiatives!inner ( id, title )')
      .eq('project_id', projectObj.id)
      .limit(1)
      .single()

    if (ipRow) {
      const init = ipRow.initiatives as unknown as { id: string; title: string }
      linkedInitiative = { id: init.id, title: init.title }
    }
  }

  // Fetch org members for assignee selector and mentions
  const { data: membersRaw } = await supabase
    .from('org_members')
    .select('user_id, profiles!org_members_user_id_fkey ( full_name, display_name )')
    .eq('org_id', ticket.org_id)

  const members = (membersRaw ?? []).map((m) => {
    const profile = m.profiles as unknown as {
      full_name: string
      display_name: string | null
    } | null
    return {
      user_id: m.user_id,
      display_name: profile?.display_name || profile?.full_name || 'Unknown',
    }
  })

  // Shape ticket data for client component — use full_name as fallback when display_name is null
  const rawAssignee = ticket.assignee as unknown as {
    id: string
    full_name: string
    display_name: string | null
    avatar_url: string | null
  } | null
  const assignee = rawAssignee
    ? { ...rawAssignee, display_name: rawAssignee.display_name || rawAssignee.full_name }
    : null
  const rawReporter = ticket.reporter as unknown as {
    id: string
    full_name: string
    display_name: string | null
    avatar_url: string | null
  }
  const reporter = {
    ...rawReporter,
    display_name: rawReporter.display_name || rawReporter.full_name,
  }
  const project = ticket.project as unknown as {
    id: string
    title: string
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
    started_at: ticket.started_at ?? null,
    resolved_at: ticket.resolved_at ?? null,
    tags: ticket.tags ?? [],
    project,
    assignee,
    reporter,
    created_at: ticket.created_at,
    updated_at: ticket.updated_at,
  }

  // Build cadence context if ticket is linked to a PIPS step or project
  let cadenceStepNumber: number | undefined
  const ticketPipsStep = ticket.pips_step as string | null
  if (ticketPipsStep) {
    cadenceStepNumber = pipsStepEnumToNumber(ticketPipsStep)
  } else if (project) {
    // Fetch project's current step to derive context
    const { data: projectRow } = await supabase
      .from('projects')
      .select('current_step')
      .eq('id', project.id)
      .single()
    if (projectRow?.current_step) {
      cadenceStepNumber = pipsStepEnumToNumber(projectRow.current_step as string)
    }
  }

  const cadenceContext = cadenceStepNumber ? buildProductContext(cadenceStepNumber) : null

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      <RecentItemTracker
        id={ticket.id}
        title={ticket.title}
        type="ticket"
        path={`/tickets/${ticket.id}`}
      />
      {parentData && parentSequenceId ? (
        <ParentTicketLink
          parentId={parentData.id}
          parentTitle={parentData.title}
          parentSequenceId={parentSequenceId}
        />
      ) : (
        <div className="mb-2">
          <Link
            href="/tickets"
            className="inline-flex items-center gap-1 text-xs hover:underline"
            style={{ color: 'var(--color-text-tertiary)' }}
            data-testid="back-to-tickets-link"
          >
            <ChevronLeft size={14} />
            Back to Tickets
          </Link>
        </div>
      )}

      <TicketDetailClient
        ticket={ticketData}
        sequenceId={sequenceId}
        members={members}
        orgProjects={orgProjects}
        linkedInitiative={linkedInitiative}
        parentTicket={
          parentData && parentSequenceId
            ? { id: parentData.id, title: parentData.title, sequenceId: parentSequenceId }
            : undefined
        }
      />

      {cadenceContext && (
        <div className="mt-6">
          <KnowledgeCadenceBar context={cadenceContext} defaultCollapsed />
        </div>
      )}

      {project && projectForms.length > 0 && (
        <>
          <div className="mt-6">
            <TicketProjectForms
              projectId={project.id}
              projectTitle={project.title}
              forms={projectForms}
            />
          </div>
          <Separator className="my-8" />
        </>
      )}

      {(!project || projectForms.length === 0) && <Separator className="my-8" />}

      <TicketLinks
        ticketId={ticketId}
        orgId={ticket.org_id}
        ticketPrefix={prefix}
        initialLinks={ticketLinks}
      />

      <Separator className="my-8" />

      <TicketAttachments
        ticketId={ticketId}
        attachments={attachmentsRaw.map((a) => ({
          id: a.id,
          file_name: a.file_name,
          file_size: a.file_size,
          mime_type: a.mime_type,
          uploaded_by: a.uploaded_by,
          created_at: a.created_at,
          uploader: a.uploader as {
            id: string
            display_name: string
            avatar_url: string | null
          } | null,
        }))}
        currentUserId={user.id}
      />

      <Separator className="my-8" />

      <SubTickets parentTicketId={ticketId} tickets={childTickets} />

      <Separator className="my-8" />

      <CommentSection
        ticketId={ticketId}
        comments={comments}
        currentUserId={user.id}
        members={members}
        commentAttachments={commentAttachmentsRaw.map((a) => ({
          id: a.id,
          file_name: a.file_name,
          file_size: a.file_size,
          mime_type: a.mime_type,
          uploaded_by: a.uploaded_by,
          created_at: a.created_at,
          comment_id: a.comment_id,
          uploader: a.uploader as {
            id: string
            display_name: string
            avatar_url: string | null
          } | null,
        }))}
      />

      <Separator className="my-8" />

      <TicketChangeLog entries={auditEntries} />
    </div>
  )
}

export default TicketDetailPage
