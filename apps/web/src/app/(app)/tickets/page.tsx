import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Button } from '@/components/ui/button'
import { TicketCard } from '@/components/tickets/ticket-card'
import { TicketListTable } from '@/components/tickets/ticket-list-table'
import { ViewToggle } from '@/components/tickets/view-toggle'
import type { ViewMode } from '@/components/tickets/view-toggle'
import type { TicketRow } from '@/components/tickets/ticket-list-table'
import { TicketEmptyState } from '@/components/tickets/ticket-empty-state'
import { Plus } from 'lucide-react'
import { ExportTicketsButton } from '@/components/tickets/export-tickets-button'
import { QuickCreateFab } from '@/components/ui/quick-create-fab'
import dynamic from 'next/dynamic'
import type { BoardTicket } from '@/components/tickets/kanban-board'
import { getTickets, getTicketsForBoard } from './actions'

const KanbanBoard = dynamic(() =>
  import('@/components/tickets/kanban-board').then((mod) => ({ default: mod.KanbanBoard })),
)
import { TicketListFilters } from '@/components/tickets/ticket-list-filters'
import { TicketQuickFilters } from '@/components/tickets/ticket-quick-filters'
import { TicketFilterPanel } from '@/components/tickets/ticket-filter-panel'
import { resolveQuickFilters } from '@/components/tickets/quick-filter-resolver'
import type { QuickFilterKey } from '@/components/tickets/ticket-quick-filters'

export const metadata: Metadata = {
  title: 'Tickets',
  description:
    'Track and manage tickets, tasks, and action items across your process improvement projects.',
}

type TicketsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const TicketsPage = async ({ searchParams }: TicketsPageProps) => {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's active org (respects org switcher cookie)
  const currentOrg = await getCurrentOrg(supabase, user.id)

  if (!currentOrg) {
    redirect('/onboarding')
  }

  // Get org settings for ticket prefix
  const { data: orgSettings } = await supabase
    .from('org_settings')
    .select('ticket_prefix')
    .eq('org_id', currentOrg.orgId)
    .single()

  const prefix = orgSettings?.ticket_prefix ?? 'TKT'

  // View mode
  const viewParam = typeof params.view === 'string' ? params.view : 'table'
  const view: ViewMode = viewParam === 'cards' ? 'cards' : viewParam === 'board' ? 'board' : 'table'

  // Pagination / sort from params
  const page = typeof params.page === 'string' ? Math.max(1, Number(params.page) || 1) : 1
  const sortBy = typeof params.sort_by === 'string' ? params.sort_by : 'created_at'
  const sortOrder = typeof params.sort_order === 'string' ? params.sort_order : 'desc'

  // Build filters from search params
  const filters: Record<string, unknown> = { page, sort_by: sortBy, sort_order: sortOrder }
  if (params.status) {
    filters.status = Array.isArray(params.status) ? params.status : [params.status]
  }
  if (params.priority) {
    filters.priority = Array.isArray(params.priority) ? params.priority : [params.priority]
  }
  if (params.type) {
    filters.type = Array.isArray(params.type) ? params.type : [params.type]
  }
  if (typeof params.assignee_id === 'string') {
    filters.assignee_id = params.assignee_id
  }
  if (typeof params.project_id === 'string') {
    filters.project_id = params.project_id
  }
  if (typeof params.search === 'string') {
    filters.search = params.search
  }

  // Resolve quick filters and merge into filters
  const quickRaw = Array.isArray(params.quick) ? params.quick : params.quick ? [params.quick] : []
  const quickKeys = quickRaw.filter((v): v is QuickFilterKey =>
    ['my_open', 'overdue', 'created_by_me', 'unassigned', 'high_priority'].includes(v as string),
  )
  const resolved = resolveQuickFilters(quickKeys, user.id)

  if (resolved.status && !filters.status) filters.status = resolved.status
  if (resolved.priority && !filters.priority) filters.priority = resolved.priority
  if (resolved.assignee_id && !filters.assignee_id) filters.assignee_id = resolved.assignee_id
  if (resolved.reporter_id) filters.reporter_id = resolved.reporter_id
  if (resolved.unassigned) filters.unassigned = true
  if (resolved.due_date_before) filters.due_date_before = resolved.due_date_before

  // Board view: fetch all tickets without pagination
  // Table/Cards view: fetch paginated tickets
  let tickets: Awaited<ReturnType<typeof getTickets>>['tickets'] = []
  let total = 0
  let boardTickets: BoardTicket[] = []

  if (view === 'board') {
    const boardFilters: {
      priority?: string[]
      assignee_id?: string
      reporter_id?: string
      project_id?: string
      unassigned?: boolean
      due_date_before?: string
      type?: string[]
    } = {}
    if (filters.priority) boardFilters.priority = filters.priority as string[]
    if (filters.type) boardFilters.type = filters.type as string[]
    if (typeof filters.assignee_id === 'string') boardFilters.assignee_id = filters.assignee_id
    if (typeof filters.project_id === 'string') boardFilters.project_id = filters.project_id
    if (typeof filters.reporter_id === 'string') boardFilters.reporter_id = filters.reporter_id
    if (filters.unassigned) boardFilters.unassigned = true
    if (typeof filters.due_date_before === 'string')
      boardFilters.due_date_before = filters.due_date_before

    const rawBoardTickets = await getTicketsForBoard(currentOrg.orgId, boardFilters)
    total = rawBoardTickets.length

    boardTickets = rawBoardTickets.map((ticket) => {
      const assignee = ticket.assignee as unknown as {
        id: string
        display_name: string
        avatar_url: string | null
      } | null

      return {
        id: ticket.id,
        sequenceId: `${prefix}-${ticket.sequence_number}`,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        type: ticket.type,
        assigneeName: assignee?.display_name ?? null,
        assigneeAvatar: assignee?.avatar_url ?? null,
        dueDate: ticket.due_date,
      }
    })
  } else {
    const result = await getTickets(currentOrg.orgId, filters)
    tickets = result.tickets
    total = result.total
  }

  // Fetch org members for filter dropdown
  const { data: membersRaw } = await supabase
    .from('org_members')
    .select('user_id, profiles!org_members_user_id_fkey ( full_name, display_name )')
    .eq('org_id', currentOrg.orgId)

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

  // Fetch projects for filter dropdown
  const { data: projectsRaw } = await supabase
    .from('projects')
    .select('id, title')
    .eq('org_id', currentOrg.orgId)
    .order('title')

  const projects = (projectsRaw ?? []).map((p) => ({ id: p.id, name: p.title as string }))

  // Transform tickets into table rows
  const ticketRows: TicketRow[] = tickets.map((ticket) => {
    const assignee = ticket.assignee as unknown as {
      id: string
      full_name: string
      display_name: string | null
      avatar_url: string | null
    } | null

    const reporter = ticket.reporter as unknown as {
      id: string
      full_name: string
      display_name: string | null
    } | null

    const modifier = ticket.modifier as unknown as {
      id: string
      full_name: string
      display_name: string | null
    } | null

    const project = ticket.project as unknown as {
      id: string
      title: string
    } | null

    return {
      id: ticket.id,
      sequenceId: `${prefix}-${ticket.sequence_number}`,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      type: ticket.type,
      assigneeName: assignee ? assignee.display_name || assignee.full_name || null : null,
      assigneeAvatar: assignee?.avatar_url ?? null,
      dueDate: ticket.due_date,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      reporterName: reporter ? reporter.display_name || reporter.full_name || null : null,
      modifiedByName: modifier ? modifier.display_name || modifier.full_name || null : null,
      projectId: project?.id ?? null,
      projectName: project?.title ?? null,
    }
  })

  return (
    <div className="mx-auto max-w-full px-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
            data-testid="tickets-page-heading"
          >
            Tickets
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
            data-testid="tickets-count"
          >
            {total} ticket{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportTicketsButton />
          <ViewToggle current={view} />
          <Button asChild className="gap-2" data-testid="new-ticket-button">
            <Link href="/tickets/new" data-testid="new-ticket-link">
              <Plus size={16} />
              New Ticket
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick filters */}
      <div className="mb-3">
        <TicketQuickFilters />
      </div>

      {/* Search + basic filters */}
      <TicketListFilters members={members} />

      {/* Advanced filter panel */}
      <div className="mt-3">
        <TicketFilterPanel members={members} projects={projects} />
      </div>

      {/* Content */}
      {view === 'board' ? (
        <div className="mt-4 max-w-full">
          <KanbanBoard initialTickets={boardTickets} />
        </div>
      ) : tickets.length > 0 ? (
        view === 'table' ? (
          <div className="mt-4">
            <TicketListTable
              tickets={ticketRows}
              total={total}
              page={page}
              perPage={25}
              sortBy={sortBy}
              sortOrder={sortOrder as 'asc' | 'desc'}
              members={members}
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ticketRows.map((ticket) => (
              <TicketCard
                key={ticket.id}
                id={ticket.id}
                sequenceId={ticket.sequenceId}
                title={ticket.title}
                status={ticket.status}
                priority={ticket.priority}
                type={ticket.type}
                assigneeName={ticket.assigneeName}
                assigneeAvatar={ticket.assigneeAvatar}
                dueDate={ticket.dueDate}
              />
            ))}
          </div>
        )
      ) : (
        <TicketEmptyState />
      )}

      <QuickCreateFab />
    </div>
  )
}

export default TicketsPage
