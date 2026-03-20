'use client'

import Link from 'next/link'
import {
  Bug,
  CheckSquare,
  CircleDot,
  Crown,
  Lightbulb,
  FolderKanban,
  Calendar,
  ShieldAlert,
} from 'lucide-react'
import { useMounted } from '@/hooks/use-mounted'
import { FormattedDate } from '@/components/ui/formatted-date'
import type { TicketPriority, TicketType } from '@/types/tickets'

/* ============================================================
   Config Maps
   ============================================================ */

const PRIORITY_COLOR: Record<TicketPriority, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#3B82F6',
  none: '#9CA3AF',
}

const TYPE_ICONS: Record<TicketType, React.ReactNode> = {
  task: <CheckSquare size={12} />,
  bug: <Bug size={12} />,
  feature: <Lightbulb size={12} />,
  general: <CircleDot size={12} />,
  pips_project: <FolderKanban size={12} />,
  ceo_request: <Crown size={12} />,
}

/* ============================================================
   Props
   ============================================================ */

export type KanbanCardProps = {
  id: string
  sequenceId: string
  title: string
  priority: TicketPriority
  type: TicketType
  assigneeName: string | null
  assigneeAvatar: string | null
  dueDate: string | null
  isBlocked?: boolean
}

/* ============================================================
   Component
   ============================================================ */

export const KanbanCard = ({
  id,
  sequenceId,
  title,
  priority,
  type,
  assigneeName,
  dueDate,
  isBlocked = false,
}: KanbanCardProps) => {
  const mounted = useMounted()
  const isOverdue = mounted && dueDate ? new Date(dueDate) < new Date() : false

  return (
    <Link
      href={`/tickets/${id}`}
      className="group block rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-sm transition-all hover:shadow-[var(--shadow-medium)] hover:border-[var(--color-primary-light)]"
    >
      {/* Top row: sequence ID + type icon */}
      <div className="mb-1.5 flex items-center justify-between">
        <span
          className="font-mono text-[11px] font-medium"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {sequenceId}
        </span>
        <span
          style={{ color: 'var(--color-text-tertiary)' }}
          aria-label={`Type: ${type}`}
          role="img"
        >
          {TYPE_ICONS[type]}
        </span>
      </div>

      {/* Title */}
      <p
        className="mb-2 line-clamp-2 text-sm font-medium leading-snug group-hover:text-[var(--color-primary)]"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </p>

      {/* Blocked indicator */}
      {isBlocked && (
        <div
          className="mb-2 flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium"
          style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
          data-testid="kanban-card-blocked-badge"
          role="status"
          aria-label="Blocked by another ticket"
        >
          <ShieldAlert size={10} aria-hidden="true" />
          Blocked
        </div>
      )}

      {/* Bottom row: priority dot, assignee, due date */}
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: PRIORITY_COLOR[priority] }}
            role="img"
            aria-label={`Priority: ${priority}`}
          />
          {assigneeName && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
              role="img"
              aria-label={`Assigned to ${assigneeName}`}
            >
              {assigneeName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {dueDate && (
          <span
            className="flex items-center gap-1"
            style={{ color: isOverdue ? '#EF4444' : 'var(--color-text-tertiary)' }}
          >
            <Calendar size={10} aria-hidden="true" />
            <FormattedDate
              date={dueDate}
              options={{ month: 'short', day: 'numeric' }}
              showTime={false}
            />
          </span>
        )}
      </div>
    </Link>
  )
}
