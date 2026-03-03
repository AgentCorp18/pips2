'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, User } from 'lucide-react'
import { STATUS_CONFIG } from '@/components/tickets/ticket-config'
import type { TicketStatus, TicketPriority } from '@/types/tickets'

/* ============================================================
   Types
   ============================================================ */

type ChildTicket = {
  id: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  assignee: {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
}

type SubTicketsProps = {
  parentTicketId: string
  tickets: ChildTicket[]
}

/* ============================================================
   Helpers
   ============================================================ */

const DONE_STATUSES: TicketStatus[] = ['done', 'cancelled']

const computeProgress = (items: ChildTicket[]) => {
  if (items.length === 0) return { done: 0, total: 0, percentage: 0 }
  const done = items.filter((t) => DONE_STATUSES.includes(t.status)).length
  return { done, total: items.length, percentage: Math.round((done / items.length) * 100) }
}

/* ============================================================
   Component
   ============================================================ */

export const SubTickets = ({ parentTicketId, tickets: childTickets }: SubTicketsProps) => {
  const { done, total, percentage } = computeProgress(childTickets)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Sub-Tickets
          {total > 0 && (
            <span className="ml-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {done}/{total} done
            </span>
          )}
        </h2>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/tickets/new?parent=${parentTicketId}`}>
            <Plus size={14} className="mr-1" />
            Add Sub-Ticket
          </Link>
        </Button>
      </div>

      {total > 0 && (
        <div className="space-y-1">
          <Progress value={percentage} />
          <p className="text-right text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {percentage}% complete
          </p>
        </div>
      )}

      {childTickets.length === 0 ? (
        <p className="py-4 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          No sub-tickets yet
        </p>
      ) : (
        <ul className="space-y-2">
          {childTickets.map((ticket) => (
            <SubTicketRow key={ticket.id} ticket={ticket} />
          ))}
        </ul>
      )}
    </div>
  )
}

/* ============================================================
   SubTicketRow
   ============================================================ */

const SubTicketRow = ({ ticket }: { ticket: ChildTicket }) => {
  const statusConfig = STATUS_CONFIG[ticket.status]

  return (
    <li>
      <Link
        href={`/tickets/${ticket.id}`}
        className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:border-[var(--color-primary-light)]"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <Badge className={statusConfig.className} variant="secondary">
          {statusConfig.label}
        </Badge>

        <span
          className="min-w-0 flex-1 truncate text-sm font-medium"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {ticket.title}
        </span>

        {ticket.assignee && (
          <span
            className="flex shrink-0 items-center gap-1 text-xs"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <User size={12} />
            {ticket.assignee.display_name}
          </span>
        )}
      </Link>
    </li>
  )
}
