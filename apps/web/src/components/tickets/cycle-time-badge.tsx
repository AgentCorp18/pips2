'use client'

import { Clock, Timer, AlertTriangle } from 'lucide-react'
import {
  getCycleTime,
  getLeadTime,
  getElapsedTime,
  formatDuration,
  getAgingLevel,
  AGING_COLORS,
} from '@/lib/cycle-time'

type CycleTimeBadgeProps = {
  ticket: {
    status: string
    started_at: string | null
    resolved_at: string | null
    created_at: string
  }
}

export const CycleTimeBadge = ({ ticket }: CycleTimeBadgeProps) => {
  const isDone = ticket.status === 'done' || ticket.status === 'cancelled'
  const isActive =
    ticket.status === 'in_progress' || ticket.status === 'in_review' || ticket.status === 'blocked'

  if (isDone) {
    // Completed ticket — show cycle time + lead time
    const cycleTime = getCycleTime(ticket)
    const leadTime = getLeadTime(ticket)

    if (!cycleTime && !leadTime) return null

    return (
      <div className="flex items-center gap-3" data-testid="cycle-time-badge">
        {cycleTime !== null && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
            title="Cycle time: started → completed"
          >
            <Clock size={12} />
            {formatDuration(cycleTime)}
          </span>
        )}
        {leadTime !== null && (
          <span
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: 'var(--color-text-tertiary)' }}
            title="Lead time: created → completed"
          >
            <Timer size={11} />
            {formatDuration(leadTime)} lead
          </span>
        )}
      </div>
    )
  }

  if (isActive) {
    // In-progress ticket — show elapsed time with aging color
    const elapsed = getElapsedTime(ticket)
    if (elapsed === null) return null

    const level = getAgingLevel(elapsed)
    const color = AGING_COLORS[level]

    return (
      <div className="flex items-center gap-1.5" data-testid="cycle-time-badge">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: `${color}15`,
            color: color,
            border: `1px solid ${color}30`,
          }}
          title="Time in progress"
        >
          {level === 'red' && <AlertTriangle size={11} />}
          {level !== 'red' && <Clock size={12} />}
          {formatDuration(elapsed)} in progress
        </span>
      </div>
    )
  }

  return null
}
