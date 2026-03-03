import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { TicketCard } from '@/components/tickets/ticket-card'
import { Plus, Ticket } from 'lucide-react'
import { getTickets } from './actions'
import { TicketListFilters } from '@/components/tickets/ticket-list-filters'

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

  // Build filters from search params
  const filters: Record<string, unknown> = {}
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
  if (typeof params.search === 'string') {
    filters.search = params.search
  }

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
        <Button asChild className="gap-2">
          <Link href="/tickets/new">
            <Plus size={16} />
            New Ticket
          </Link>
        </Button>
      </div>

      {/* Filter bar */}
      <TicketListFilters members={members} />

      {/* Ticket grid */}
      {tickets.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => {
            const assignee = ticket.assignee as unknown as {
              id: string
              display_name: string
              avatar_url: string | null
            } | null

            return (
              <TicketCard
                key={ticket.id}
                id={ticket.id}
                sequenceId={`${prefix}-${ticket.sequence_number}`}
                title={ticket.title}
                status={ticket.status}
                priority={ticket.priority}
                type={ticket.type}
                assigneeName={assignee?.display_name ?? null}
                assigneeAvatar={assignee?.avatar_url ?? null}
                dueDate={ticket.due_date}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16">
    <div
      className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
      style={{ backgroundColor: 'var(--color-primary-subtle)' }}
    >
      <Ticket size={24} style={{ color: 'var(--color-primary)' }} />
    </div>
    <h3 className="mb-1 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
      No tickets yet
    </h3>
    <p
      className="mb-6 max-w-sm text-center text-sm"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      Create your first ticket to start tracking work.
    </p>
    <Button asChild className="gap-2">
      <Link href="/tickets/new">
        <Plus size={16} />
        Create your first ticket
      </Link>
    </Button>
  </div>
)

export default TicketsPage
