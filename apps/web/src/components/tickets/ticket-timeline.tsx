'use client'

import { useMemo, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut } from 'lucide-react'
import type { TimelineTicket } from '@/app/(app)/tickets/timeline/actions'

/* ============================================================
   Constants
   ============================================================ */

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#3B82F6',
  none: 'var(--color-text-tertiary)',
}

const STATUS_COLORS: Record<string, string> = {
  backlog: 'var(--color-text-tertiary)',
  todo: '#6366F1',
  in_progress: '#3B82F6',
  in_review: '#8B5CF6',
  blocked: '#EF4444',
  done: '#22C55E',
  cancelled: 'var(--color-text-tertiary)',
}

const ROW_HEIGHT = 40
const HEADER_HEIGHT = 48
const LABEL_WIDTH = 260
const MIN_BAR_WIDTH = 24

type ZoomLevel = 'days' | 'weeks' | 'months'

const ZOOM_CONFIG: Record<ZoomLevel, { dayWidth: number; label: string }> = {
  days: { dayWidth: 32, label: 'Days' },
  weeks: { dayWidth: 12, label: 'Weeks' },
  months: { dayWidth: 4, label: 'Months' },
}

/* ============================================================
   Helpers
   ============================================================ */

const parseDate = (dateStr: string): Date => {
  // Handle both date-only and ISO timestamp formats
  if (dateStr.includes('T')) {
    return new Date(dateStr)
  }
  return new Date(dateStr + 'T00:00:00')
}

const formatDate = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const daysBetween = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/* ============================================================
   Component
   ============================================================ */

type TicketTimelineProps = {
  tickets: TimelineTicket[]
  prefix: string
}

export const TicketTimeline = ({ tickets, prefix }: TicketTimelineProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState<ZoomLevel>('weeks')
  const [hoveredTicketId, setHoveredTicketId] = useState<string | null>(null)

  const { dayWidth } = ZOOM_CONFIG[zoom]

  // Calculate timeline range
  const { timelineStart, totalDays } = useMemo(() => {
    const now = new Date()
    let earliest = now
    let latest = now

    for (const t of tickets) {
      const start = parseDate(t.started_at ?? t.created_at)
      const end = t.due_date
        ? parseDate(t.due_date)
        : t.resolved_at
          ? parseDate(t.resolved_at)
          : now

      if (start < earliest) earliest = start
      if (end > latest) latest = end
    }

    // Add padding
    const paddedStart = addDays(earliest, -7)
    const paddedEnd = addDays(latest, 14)
    const total = Math.max(daysBetween(paddedStart, paddedEnd), 30)

    return { timelineStart: paddedStart, totalDays: total }
  }, [tickets])

  // Generate date columns for headers
  const dateColumns = useMemo(() => {
    const cols: { date: Date; label: string; isToday: boolean; isMonthStart: boolean }[] = []
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

    for (let i = 0; i < totalDays; i++) {
      const date = addDays(timelineStart, i)
      const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      cols.push({
        date,
        label: formatDate(date),
        isToday: dateStr === todayStr,
        isMonthStart: date.getDate() === 1,
      })
    }
    return cols
  }, [timelineStart, totalDays])

  // Scroll to today
  const scrollToToday = useCallback(() => {
    if (!scrollRef.current) return
    const today = new Date()
    const offset = daysBetween(timelineStart, today)
    const scrollX = offset * dayWidth - scrollRef.current.clientWidth / 2
    scrollRef.current.scrollLeft = Math.max(0, scrollX)
  }, [timelineStart, dayWidth])

  const cycleZoom = useCallback((direction: 'in' | 'out') => {
    const levels: ZoomLevel[] = ['months', 'weeks', 'days']
    setZoom((prev) => {
      const idx = levels.indexOf(prev)
      if (direction === 'in') return levels[Math.min(idx + 1, levels.length - 1)]!
      return levels[Math.max(idx - 1, 0)]!
    })
  }, [])

  // Today marker position
  const todayOffset = daysBetween(timelineStart, new Date())
  const todayX = todayOffset * dayWidth

  // Total chart width
  const chartWidth = totalDays * dayWidth

  return (
    <div data-testid="ticket-timeline">
      {/* Toolbar */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => cycleZoom('out')}
            disabled={zoom === 'months'}
            aria-label="Zoom out"
            data-testid="timeline-zoom-out"
          >
            <ZoomOut size={14} />
          </Button>
          <span
            className="min-w-[60px] text-center text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
            data-testid="timeline-zoom-level"
          >
            {ZOOM_CONFIG[zoom].label}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => cycleZoom('in')}
            disabled={zoom === 'days'}
            aria-label="Zoom in"
            data-testid="timeline-zoom-in"
          >
            <ZoomIn size={14} />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={scrollToToday}
          data-testid="timeline-today-btn"
        >
          Today
        </Button>
      </div>

      {/* Chart */}
      <div
        className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]"
        data-testid="timeline-chart"
      >
        <div className="flex">
          {/* Left labels column */}
          <div
            className="shrink-0 border-r border-[var(--color-border)]"
            style={{ width: LABEL_WIDTH }}
          >
            {/* Label header */}
            <div
              className="flex items-center border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 text-xs font-medium"
              style={{ height: HEADER_HEIGHT, color: 'var(--color-text-secondary)' }}
            >
              Ticket
            </div>

            {/* Ticket labels */}
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 transition-colors hover:bg-[var(--color-surface-secondary)]"
                style={{ height: ROW_HEIGHT }}
                data-testid={`timeline-label-${ticket.id}`}
                onMouseEnter={() => setHoveredTicketId(ticket.id)}
                onMouseLeave={() => setHoveredTicketId(null)}
              >
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      PRIORITY_COLORS[ticket.priority] ?? 'var(--color-text-tertiary)',
                  }}
                  aria-label={`Priority: ${ticket.priority}`}
                />
                <span className="truncate text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {prefix}-{ticket.sequence_number}
                </span>
                <span
                  className="min-w-0 truncate text-xs font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {ticket.title}
                </span>
              </Link>
            ))}
          </div>

          {/* Scrollable chart area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto"
            data-testid="timeline-scroll-area"
          >
            <div style={{ width: chartWidth, position: 'relative' }}>
              {/* Date headers */}
              <div
                className="sticky top-0 z-10 flex border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]"
                style={{ height: HEADER_HEIGHT }}
              >
                {dateColumns.map((col, i) => {
                  // Show label based on zoom level
                  const showLabel =
                    zoom === 'days' ||
                    (zoom === 'weeks' && col.date.getDay() === 1) ||
                    (zoom === 'months' && col.isMonthStart)

                  return (
                    <div
                      key={i}
                      className={`flex shrink-0 items-end border-r pb-1 text-center ${
                        col.isToday ? 'bg-[var(--color-primary)]/10' : ''
                      } ${col.isMonthStart ? 'border-l border-l-[var(--color-border)]' : ''}`}
                      style={{
                        width: dayWidth,
                        borderColor: 'var(--color-border)',
                        borderRightColor: zoom === 'days' ? 'var(--color-border)' : 'transparent',
                      }}
                    >
                      {showLabel && (
                        <span
                          className="w-full truncate text-[10px] leading-tight"
                          style={{
                            color: col.isToday
                              ? 'var(--color-primary)'
                              : 'var(--color-text-tertiary)',
                          }}
                        >
                          {zoom === 'months'
                            ? col.date.toLocaleDateString('en-US', {
                                month: 'short',
                                year: '2-digit',
                              })
                            : formatDate(col.date)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Rows */}
              {tickets.map((ticket) => {
                const start = parseDate(ticket.started_at ?? ticket.created_at)
                const end = ticket.due_date
                  ? parseDate(ticket.due_date)
                  : ticket.resolved_at
                    ? parseDate(ticket.resolved_at)
                    : addDays(start, 7) // default 7-day bar for no end date

                const startOffset = daysBetween(timelineStart, start)
                const duration = Math.max(daysBetween(start, end), 1)
                const barLeft = startOffset * dayWidth
                const barWidth = Math.max(duration * dayWidth, MIN_BAR_WIDTH)
                const isHovered = hoveredTicketId === ticket.id
                const barColor = STATUS_COLORS[ticket.status] ?? '#6366F1'

                return (
                  <div
                    key={ticket.id}
                    className="relative border-b border-[var(--color-border)]"
                    style={{ height: ROW_HEIGHT }}
                    data-testid={`timeline-row-${ticket.id}`}
                    onMouseEnter={() => setHoveredTicketId(ticket.id)}
                    onMouseLeave={() => setHoveredTicketId(null)}
                  >
                    {/* Bar */}
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="absolute top-[8px] flex items-center rounded-[var(--radius-sm)] px-1.5 text-[10px] font-medium text-white transition-shadow"
                      style={{
                        left: barLeft,
                        width: barWidth,
                        height: ROW_HEIGHT - 16,
                        backgroundColor: barColor,
                        opacity: isHovered ? 1 : 0.85,
                        boxShadow: isHovered ? 'var(--shadow-medium)' : 'none',
                      }}
                      data-testid={`timeline-bar-${ticket.id}`}
                      aria-label={`${prefix}-${ticket.sequence_number}: ${ticket.title}, ${ticket.status.replace(/_/g, ' ')}`}
                    >
                      <span className="truncate">{ticket.title}</span>
                    </Link>
                  </div>
                )
              })}

              {/* Today marker line */}
              {todayOffset >= 0 && todayOffset <= totalDays && (
                <div
                  className="pointer-events-none absolute top-0 z-20 w-0.5"
                  style={{
                    left: todayX,
                    height: HEADER_HEIGHT + tickets.length * ROW_HEIGHT,
                    backgroundColor: 'var(--color-primary)',
                  }}
                  data-testid="timeline-today-marker"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        className="mt-3 flex flex-wrap items-center gap-4 text-xs"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Status:
        </span>
        {Object.entries(STATUS_COLORS)
          .filter(([key]) => key !== 'cancelled')
          .map(([status, color]) => (
            <span key={status} className="flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-6 rounded-[2px]"
                style={{ backgroundColor: color }}
              />
              {status.replace(/_/g, ' ')}
            </span>
          ))}
      </div>

      {/* Empty state */}
      {tickets.length === 0 && (
        <div
          className="mt-4 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16"
          data-testid="timeline-empty"
        >
          <p className="mb-2 text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
            No tickets to display
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Create tickets with dates to see them on the timeline.
          </p>
        </div>
      )}
    </div>
  )
}
