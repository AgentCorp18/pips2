import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getTicketsForBoard } from '../actions'
import dynamic from 'next/dynamic'
import type { BoardTicket } from '@/components/tickets/kanban-board'

const KanbanBoard = dynamic(() =>
  import('@/components/tickets/kanban-board').then((mod) => ({ default: mod.KanbanBoard })),
)
import { BoardFilters } from '@/components/tickets/board-filters'
import { TicketQuickFilters } from '@/components/tickets/ticket-quick-filters'
import { resolveQuickFilters } from '@/components/tickets/quick-filter-resolver'
import type { QuickFilterKey } from '@/components/tickets/ticket-quick-filters'

export const metadata: Metadata = {
  title: 'Board',
  description: 'Kanban board view for tickets',
}

type BoardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const BoardPage = async ({ searchParams }: BoardPageProps) => {
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

  // Build filters from search params
  const filters: {
    priority?: string[]
    assignee_id?: string
    reporter_id?: string
    project_id?: string
    unassigned?: boolean
    due_date_before?: string
    type?: string[]
  } = {}

  if (params.priority) {
    filters.priority = Array.isArray(params.priority) ? params.priority : [params.priority]
  }
  if (typeof params.assignee_id === 'string') filters.assignee_id = params.assignee_id
  if (typeof params.project_id === 'string') filters.project_id = params.project_id

  // Resolve quick filters and merge
  const quickRaw = Array.isArray(params.quick) ? params.quick : params.quick ? [params.quick] : []
  const quickKeys = quickRaw.filter((v): v is QuickFilterKey =>
    ['my_open', 'overdue', 'created_by_me', 'unassigned', 'high_priority'].includes(v as string),
  )
  const resolved = resolveQuickFilters(quickKeys, user.id)

  if (resolved.priority && !filters.priority) filters.priority = resolved.priority
  if (resolved.assignee_id && !filters.assignee_id) filters.assignee_id = resolved.assignee_id
  if (resolved.reporter_id) filters.reporter_id = resolved.reporter_id
  if (resolved.unassigned) filters.unassigned = true
  if (resolved.due_date_before) filters.due_date_before = resolved.due_date_before

  const tickets = await getTicketsForBoard(currentOrg.orgId, filters)

  // Map to board ticket shape
  const boardTickets: BoardTicket[] = tickets.map((ticket) => {
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

  return (
    <div className="mx-auto max-w-full px-4">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
            data-testid="board-page-heading"
          >
            Board
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
            data-testid="board-description"
          >
            Drag tickets between columns to update status
          </p>
        </div>
        <Button asChild className="gap-2" data-testid="board-new-ticket-button">
          <Link href="/tickets/new" data-testid="board-new-ticket-link">
            <Plus size={16} />
            New Ticket
          </Link>
        </Button>
      </div>

      {/* Quick filters */}
      <div className="mb-3">
        <TicketQuickFilters basePath="/tickets/board" />
      </div>

      {/* Filters */}
      <div className="mb-4">
        <BoardFilters members={members} projects={projects} />
      </div>

      {/* Board */}
      {boardTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16">
          <p className="mb-2 text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
            No tickets to display
          </p>
          <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Create your first ticket to get started with the board view.
          </p>
          <Button asChild className="gap-2">
            <Link href="/tickets/new">
              <Plus size={16} />
              Create Ticket
            </Link>
          </Button>
        </div>
      ) : (
        <KanbanBoard initialTickets={boardTickets} />
      )}
    </div>
  )
}

export default BoardPage
