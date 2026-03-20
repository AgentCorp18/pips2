'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Bug,
  CheckSquare,
  CircleDot,
  Crown,
  Lightbulb,
  FolderKanban,
  Calendar,
  User,
  ShieldAlert,
} from 'lucide-react'
import { FormattedDate } from '@/components/ui/formatted-date'
import type { TicketStatus, TicketPriority, TicketType } from '@/types/tickets'

/* ============================================================
   Config Maps
   ============================================================ */

const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  backlog: { label: 'Backlog', className: 'bg-gray-100 text-gray-700' },
  todo: { label: 'Todo', className: 'bg-blue-100 text-blue-700' },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-100 text-amber-700',
  },
  in_review: { label: 'In Review', className: 'bg-purple-100 text-purple-700' },
  blocked: { label: 'Blocked', className: 'bg-red-100 text-red-700' },
  done: { label: 'Done', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500' },
}

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'var(--color-error, #ef4444)' },
  high: { label: 'High', color: '#f97316' },
  medium: { label: 'Medium', color: '#eab308' },
  low: { label: 'Low', color: '#3b82f6' },
  none: { label: 'None', color: '#9ca3af' },
}

const TYPE_ICONS: Record<TicketType, React.ReactNode> = {
  task: <CheckSquare size={14} />,
  bug: <Bug size={14} />,
  feature: <Lightbulb size={14} />,
  general: <CircleDot size={14} />,
  pips_project: <FolderKanban size={14} />,
  ceo_request: <Crown size={14} />,
}

/* ============================================================
   Props
   ============================================================ */

type TicketCardProps = {
  id: string
  sequenceId: string
  title: string
  status: TicketStatus
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

export const TicketCard = ({
  id,
  sequenceId,
  title,
  status,
  priority,
  type,
  assigneeName,
  dueDate,
  isBlocked = false,
}: TicketCardProps) => {
  const statusConfig = STATUS_CONFIG[status]
  const priorityConfig = PRIORITY_CONFIG[priority]

  return (
    <Link href={`/tickets/${id}`} className="group block">
      <Card className="transition-all hover:shadow-[var(--shadow-medium)] group-hover:border-[var(--color-primary-light)]">
        <CardContent className="p-4">
          {/* Top row: sequence ID + status badge */}
          <div className="mb-2 flex items-center justify-between">
            <span
              className="font-mono text-xs font-medium"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {sequenceId}
            </span>
            <Badge className={`text-xs ${statusConfig.className}`} variant="secondary">
              {statusConfig.label}
            </Badge>
          </div>

          {/* Title */}
          <h3
            className="mb-3 line-clamp-2 text-sm font-medium leading-snug group-hover:text-[var(--color-primary)]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {title}
          </h3>

          {/* Blocked by link indicator */}
          {isBlocked && (
            <div
              className="mb-2 flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
              data-testid="ticket-card-blocked-badge"
              role="status"
              aria-label="Blocked by another ticket"
            >
              <ShieldAlert size={10} aria-hidden="true" />
              Blocked
            </div>
          )}

          {/* Bottom row: type icon, priority dot, assignee, due date */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {/* Type icon */}
              <span style={{ color: 'var(--color-text-tertiary)' }}>{TYPE_ICONS[type]}</span>

              {/* Priority dot */}
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: priorityConfig.color }}
                aria-label={`Priority: ${priorityConfig.label}`}
                title={priorityConfig.label}
              />
            </div>

            <div
              className="flex items-center gap-3"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {assigneeName && (
                <span className="flex items-center gap-1">
                  <User size={12} />
                  <span className="max-w-[80px] truncate">{assigneeName}</span>
                </span>
              )}
              {dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  <FormattedDate date={dueDate} showTime={false} />
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
