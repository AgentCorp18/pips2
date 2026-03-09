import { Clock, GitCommitHorizontal, Plus, Pencil, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { TicketChangeEntry } from '@/app/(app)/tickets/[ticketId]/audit-log-actions'

/* ============================================================
   Types
   ============================================================ */

type TicketChangeLogProps = {
  entries: TicketChangeEntry[]
}

/* ============================================================
   Helpers
   ============================================================ */

const actionIcon = (action: TicketChangeEntry['action']) => {
  switch (action) {
    case 'insert':
      return <Plus size={12} />
    case 'delete':
      return <Trash2 size={12} />
    default:
      return <Pencil size={12} />
  }
}

const actionColor = (action: TicketChangeEntry['action']): string => {
  switch (action) {
    case 'insert':
      return 'bg-green-100 text-green-700'
    case 'delete':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-blue-100 text-blue-700'
  }
}

/* ============================================================
   Component
   ============================================================ */

export const TicketChangeLog = ({ entries }: TicketChangeLogProps) => {
  if (entries.length === 0) {
    return (
      <div className="space-y-4">
        <ChangeLogHeading count={0} />
        <p className="py-6 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          No history recorded for this ticket yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4" data-testid="ticket-change-log">
      <ChangeLogHeading count={entries.length} />

      {/* Timeline */}
      <ol className="relative border-l" style={{ borderColor: 'var(--color-border)' }}>
        {entries.map((entry, index) => (
          <TimelineItem key={entry.id} entry={entry} isLast={index === entries.length - 1} />
        ))}
      </ol>
    </div>
  )
}

/* ============================================================
   Sub-components
   ============================================================ */

const ChangeLogHeading = ({ count }: { count: number }) => (
  <h2
    className="flex items-center gap-2 text-lg font-semibold"
    style={{ color: 'var(--color-text-primary)' }}
  >
    <GitCommitHorizontal size={18} style={{ color: 'var(--color-text-tertiary)' }} />
    Change Log
    {count > 0 && (
      <span className="text-sm font-normal" style={{ color: 'var(--color-text-tertiary)' }}>
        ({count})
      </span>
    )}
  </h2>
)

type TimelineItemProps = {
  entry: TicketChangeEntry
  isLast: boolean
}

const TimelineItem = ({ entry, isLast }: TimelineItemProps) => {
  const timeAgo = formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })

  return (
    <li className={`ml-4 ${isLast ? 'pb-0' : 'pb-5'}`}>
      {/* Dot on timeline */}
      <span
        className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ${actionColor(entry.action)}`}
      >
        {actionIcon(entry.action)}
      </span>

      {/* Content */}
      <div className="flex flex-wrap items-baseline gap-x-2">
        <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {entry.description}
        </p>
        <span
          className="flex items-center gap-1 text-xs"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          <Clock size={10} />
          {timeAgo}
        </span>
      </div>
    </li>
  )
}
