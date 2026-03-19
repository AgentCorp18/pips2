'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CalendarTicket } from '@/app/(app)/tickets/calendar/actions'

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

const STATUS_DOT: Record<string, string> = {
  backlog: 'var(--color-text-tertiary)',
  todo: '#6366F1',
  in_progress: '#3B82F6',
  in_review: '#8B5CF6',
  blocked: '#EF4444',
  done: '#22C55E',
  cancelled: 'var(--color-text-tertiary)',
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* ============================================================
   Helper — get calendar grid days
   ============================================================ */

type CalendarDay = {
  date: Date
  dateStr: string
  isCurrentMonth: boolean
  isToday: boolean
}

const getCalendarDays = (year: number, month: number): CalendarDay[] => {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const firstDay = new Date(year, month - 1, 1)
  // Adjust to make Monday = 0
  let startDay = firstDay.getDay() - 1
  if (startDay < 0) startDay = 6

  const daysInMonth = new Date(year, month, 0).getDate()

  const days: CalendarDay[] = []

  // Previous month padding
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, -i)
    const dateStr = formatDateStr(date)
    days.push({
      date,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    })
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d)
    const dateStr = formatDateStr(date)
    days.push({
      date,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    })
  }

  // Next month padding to fill 6 rows
  const totalCells = Math.ceil(days.length / 7) * 7
  const remaining = totalCells - days.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month, d)
    const dateStr = formatDateStr(date)
    days.push({
      date,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    })
  }

  return days
}

const formatDateStr = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/* ============================================================
   TicketCalendar Component
   ============================================================ */

type TicketCalendarProps = {
  tickets: CalendarTicket[]
  year: number
  month: number
  prefix: string
}

export const TicketCalendar = ({ tickets, year, month, prefix }: TicketCalendarProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const days = useMemo(() => getCalendarDays(year, month), [year, month])

  // Group tickets by due date
  const ticketsByDate = useMemo(() => {
    const map = new Map<string, CalendarTicket[]>()
    for (const ticket of tickets) {
      const dateKey = ticket.due_date
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(ticket)
    }
    return map
  }, [tickets])

  const navigateMonth = useCallback(
    (delta: number) => {
      let newMonth = month + delta
      let newYear = year
      if (newMonth < 1) {
        newMonth = 12
        newYear -= 1
      } else if (newMonth > 12) {
        newMonth = 1
        newYear += 1
      }
      const params = new URLSearchParams(searchParams.toString())
      params.set('year', String(newYear))
      params.set('month', String(newMonth))
      router.push(`/tickets/calendar?${params.toString()}`)
    },
    [month, year, router, searchParams],
  )

  const goToToday = useCallback(() => {
    const now = new Date()
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', String(now.getFullYear()))
    params.set('month', String(now.getMonth() + 1))
    router.push(`/tickets/calendar?${params.toString()}`)
  }, [router, searchParams])

  const monthLabel = new Date(year, month - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  // Selected date tickets
  const selectedTickets = selectedDate ? (ticketsByDate.get(selectedDate) ?? []) : []

  return (
    <div data-testid="ticket-calendar">
      {/* Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth(-1)}
            aria-label="Previous month"
            data-testid="calendar-prev-month"
          >
            <ChevronLeft size={16} />
          </Button>
          <h2
            className="min-w-[180px] text-center text-lg font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
            data-testid="calendar-month-label"
          >
            {monthLabel}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth(1)}
            aria-label="Next month"
            data-testid="calendar-next-month"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday} data-testid="calendar-today-btn">
          Today
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
        {/* Day names header */}
        <div className="grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
          {DAY_NAMES.map((name) => (
            <div
              key={name}
              className="px-2 py-2 text-center text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayTickets = ticketsByDate.get(day.dateStr) ?? []
            const isSelected = selectedDate === day.dateStr

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDate(isSelected ? null : day.dateStr)}
                data-testid={`calendar-day-${day.dateStr}`}
                className={`min-h-[100px] border-b border-r border-[var(--color-border)] p-1.5 text-left transition-colors hover:bg-[var(--color-surface-secondary)] ${
                  isSelected
                    ? 'bg-[var(--color-primary)]/5 ring-2 ring-inset ring-[var(--color-primary)]'
                    : ''
                } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                aria-label={`${day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}${dayTickets.length > 0 ? `, ${dayTickets.length} ticket${dayTickets.length !== 1 ? 's' : ''}` : ''}`}
              >
                {/* Date number */}
                <span
                  className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    day.isToday
                      ? 'bg-[var(--color-primary)] text-white'
                      : day.isCurrentMonth
                        ? ''
                        : 'opacity-40'
                  }`}
                  style={
                    !day.isToday
                      ? {
                          color: day.isCurrentMonth
                            ? 'var(--color-text-primary)'
                            : 'var(--color-text-tertiary)',
                        }
                      : undefined
                  }
                >
                  {day.date.getDate()}
                </span>

                {/* Ticket pills (max 3 visible) */}
                <div className="space-y-0.5">
                  {dayTickets.slice(0, 3).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] leading-tight"
                      style={{
                        backgroundColor: `${PRIORITY_COLORS[ticket.priority] ?? 'var(--color-text-tertiary)'}15`,
                        color: PRIORITY_COLORS[ticket.priority] ?? 'var(--color-text-primary)',
                      }}
                      title={ticket.title}
                    >
                      <span
                        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            STATUS_DOT[ticket.status] ?? 'var(--color-text-tertiary)',
                        }}
                      />
                      <span className="truncate">{ticket.title}</span>
                    </div>
                  ))}
                  {dayTickets.length > 3 && (
                    <span
                      className="block text-[10px]"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      +{dayTickets.length - 3} more
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected date detail panel */}
      {selectedDate && (
        <div
          className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          data-testid="calendar-detail-panel"
        >
          <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            <span style={{ color: 'var(--color-text-tertiary)' }}>
              ({selectedTickets.length} ticket{selectedTickets.length !== 1 ? 's' : ''})
            </span>
          </h3>

          {selectedTickets.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              No tickets due on this date.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 transition-shadow hover:shadow-[var(--shadow-medium)]"
                  data-testid={`calendar-ticket-${ticket.id}`}
                >
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        PRIORITY_COLORS[ticket.priority] ?? 'var(--color-text-tertiary)',
                    }}
                    aria-label={`Priority: ${ticket.priority}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      <span style={{ color: 'var(--color-text-tertiary)' }}>
                        {prefix}-{ticket.sequence_number}
                      </span>{' '}
                      {ticket.title}
                    </p>
                    <div
                      className="mt-0.5 flex items-center gap-2 text-xs"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {ticket.project_title && <span>{ticket.project_title}</span>}
                      {ticket.assignee_name && <span>{ticket.assignee_name}</span>}
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {ticket.status.replace(/_/g, ' ')}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
