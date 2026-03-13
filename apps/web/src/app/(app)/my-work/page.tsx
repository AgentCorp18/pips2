import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, CalendarDays, CalendarRange, Inbox } from 'lucide-react'
import { getMyTickets } from './actions'
import type { MyWorkTicket } from './actions'

export const metadata: Metadata = {
  title: 'My Work',
  description: 'Your assigned tickets and tasks',
}

/* ============================================================
   Priority badge colors
   ============================================================ */

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#3B82F6',
  none: 'var(--color-text-tertiary)',
}

/* ============================================================
   Status display labels
   ============================================================ */

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  blocked: 'Blocked',
}

/* ============================================================
   TicketRow
   ============================================================ */

const TicketRow = ({ ticket }: { ticket: MyWorkTicket }) => {
  const priorityColor = PRIORITY_COLORS[ticket.priority] ?? 'var(--color-text-tertiary)'

  return (
    <a href={`/tickets/${ticket.id}`} className="block" data-testid={`ticket-row-${ticket.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-3 py-3">
          <div
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: priorityColor }}
            aria-label={`Priority: ${ticket.priority}`}
            data-testid="ticket-priority-dot"
          />
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
              data-testid="ticket-title"
            >
              {ticket.title}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              {ticket.project && (
                <span
                  className="truncate text-xs"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  data-testid="ticket-project"
                >
                  {ticket.project.title}
                </span>
              )}
              {ticket.due_date && (
                <span
                  className="text-xs"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  data-testid="ticket-due-date"
                >
                  Due {ticket.due_date}
                </span>
              )}
            </div>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 text-xs"
            data-testid="ticket-status-badge"
            aria-label={`Status: ${STATUS_LABELS[ticket.status] ?? ticket.status}`}
          >
            {STATUS_LABELS[ticket.status] ?? ticket.status}
          </Badge>
        </CardContent>
      </Card>
    </a>
  )
}

/* ============================================================
   Section header
   ============================================================ */

type SectionProps = {
  title: string
  icon: typeof AlertTriangle
  color: string
  tickets: MyWorkTicket[]
}

const TicketSection = ({ title, icon: Icon, color, tickets }: SectionProps) => {
  if (tickets.length === 0) return null

  const sectionId = title.toLowerCase().replace(/\s+/g, '-')

  return (
    <section
      className="mb-6"
      data-testid={`my-work-section-${sectionId}`}
      aria-labelledby={`section-heading-${sectionId}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon size={16} style={{ color }} aria-hidden="true" />
        <h2 id={`section-heading-${sectionId}`} className="text-sm font-semibold" style={{ color }}>
          {title}
        </h2>
        <span
          className="text-xs"
          style={{ color: 'var(--color-text-tertiary)' }}
          data-testid={`section-count-${sectionId}`}
        >
          ({tickets.length})
        </span>
      </div>
      <div className="space-y-2" data-testid={`ticket-list-${sectionId}`}>
        {tickets.map((ticket) => (
          <TicketRow key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </section>
  )
}

/* ============================================================
   MyWorkPage
   ============================================================ */

const MyWorkPage = async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership) {
    redirect('/onboarding')
  }

  const grouped = await getMyTickets(membership.org_id)
  const totalCount =
    grouped.overdue.length +
    grouped.dueToday.length +
    grouped.thisWeek.length +
    grouped.later.length

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]" data-testid="my-work-page">
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
          data-testid="my-work-heading"
        >
          My Work
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
          data-testid="my-work-description"
        >
          Tickets assigned to you, grouped by urgency.
        </p>
      </div>

      {totalCount === 0 ? (
        <Card data-testid="my-work-empty-state" role="status" aria-label="No assigned tickets">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Inbox
              size={48}
              style={{ color: 'var(--color-text-tertiary)' }}
              className="mb-4"
              aria-hidden="true"
            />
            <p className="text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              No assigned tickets
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              When someone assigns a ticket to you, it will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <TicketSection
            title="Overdue"
            icon={AlertTriangle}
            color="#EF4444"
            tickets={grouped.overdue}
          />
          <TicketSection
            title="Due Today"
            icon={Clock}
            color="#F59E0B"
            tickets={grouped.dueToday}
          />
          <TicketSection
            title="This Week"
            icon={CalendarDays}
            color="var(--color-text-primary)"
            tickets={grouped.thisWeek}
          />
          <TicketSection
            title="Later"
            icon={CalendarRange}
            color="var(--color-text-tertiary)"
            tickets={grouped.later}
          />
        </>
      )}
    </div>
  )
}

export default MyWorkPage
