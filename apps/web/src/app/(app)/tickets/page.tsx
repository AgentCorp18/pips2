import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { TicketCard } from '@/components/tickets/ticket-card'
import { TicketListTable } from '@/components/tickets/ticket-list-table'
import { ViewToggle } from '@/components/tickets/view-toggle'
import type { ViewMode } from '@/components/tickets/view-toggle'
import type { TicketRow } from '@/components/tickets/ticket-list-table'
import { TicketEmptyState } from '@/components/tickets/ticket-empty-state'
import { Plus } from 'lucide-react'
import { ExportTicketsButton } from '@/components/tickets/export-tickets-button'
import { getTickets } from './actions'
import { TicketListFilters } from '@/components/tickets/ticket-list-filters'
import { TicketQuickFilters } from '@/components/tickets/ticket-quick-filters'
import { TicketFilterPanel } from '@/components/tickets/ticket-filter-panel'
import { resolveQuickFilters } from '@/components/tickets/quick-filter-resolver'
import type { QuickFilterKey } from '@/components/tickets/ticket-quick-filters'

export const metadata: Metadata = {
  title: 'Tickets - PIPS',
  description: 'Manage your tickets and tasks',
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

  // Get user's org
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) {
    redirect('/onboarding')
  }

  // Get org settings for ticket prefix
  const { data: orgSettings } = await supabase
    .from('org_settings')
    .select('ticket_prefix')
    .eq('org_id', membership.org_id)
    .single()

  const prefix = orgSettings?.ticket_prefix ?? 'TKT'

  // View mode
  const viewParam = typeof params.view === 'string' ? params.view : 'table'
  const view: ViewMode = viewParam === 'cards' ? 'cards' : 'table'

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

  const { tickets, total } = await getTickets(membership.org_id, filters)

  // Fetch org members for filter dropdown
  const { data: membersRaw } = await supabase
    .from('org_members')
    .select('user_id, profiles!org_members_user_id_fkey ( display_name )')
    .eq('org_id', membership.org_id)

  const members = (membersRaw ?? []).map((m) => {
    const profile = m.profiles as unknown as { display_name: string } | null
    return {
      user_id: m.user_id,
      display_name: profile?.display_name ?? 'Unknown',
    }
  })

  // Fetch projects for filter dropdown
  const { data: projectsRaw } = await supabase
    .from('projects')
    .select('id, name')
    .eq('org_id', membership.org_id)
    .order('name')

  const projects = (projectsRaw ?? []).map((p) => ({ id: p.id, name: p.name }))

  // Transform tickets into table rows
  const ticketRows: TicketRow[] = tickets.map((ticket) => {
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
      createdAt: ticket.created_at,
    }
  })

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Tickets
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {total} ticket{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportTicketsButton />
          <ViewToggle current={view} />
          <Button asChild className="gap-2">
            <Link href="/tickets/new">
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
      {tickets.length > 0 ? (
        view === 'table' ? (
          <div className="mt-4">
            <TicketListTable
              tickets={ticketRows}
              total={total}
              page={page}
              perPage={25}
              sortBy={sortBy}
              sortOrder={sortOrder as 'asc' | 'desc'}
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
    </div>
  )
}

export default TicketsPage
