'use client'

import Link from 'next/link'
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDuration, getAgingLevel, AGING_COLORS } from '@/lib/cycle-time'

export type AgingTicket = {
  id: string
  sequenceId: string
  title: string
  assigneeName: string | null
  daysOpen: number
  status: 'in_progress' | 'in_review' | 'blocked'
}

type AgingTicketsAlertProps = {
  tickets: AgingTicket[]
}

export const AgingTicketsAlert = ({ tickets }: AgingTicketsAlertProps) => {
  if (tickets.length === 0) return null

  const blockedCount = tickets.filter((t) => t.status === 'blocked').length

  return (
    <Card className="border-[var(--color-border)]" data-testid="aging-tickets-alert">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <AlertTriangle size={18} style={{ color: '#F59E0B' }} />
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Aging Tickets
        </CardTitle>
        {blockedCount > 0 && (
          <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
            <ShieldAlert size={11} />
            {blockedCount} blocked
          </span>
        )}
        <span className="ml-auto text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          In progress {'>'} 7 days
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tickets.map((t) => {
            const level = getAgingLevel(t.daysOpen)
            const color = AGING_COLORS[level]
            const isBlocked = t.status === 'blocked'
            return (
              <Link
                key={t.id}
                href={`/tickets/${t.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-[var(--color-surface)]"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="font-mono text-xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {t.sequenceId}
                  </span>
                  {isBlocked && (
                    <span
                      className="inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide"
                      style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                      data-testid="blocked-badge"
                    >
                      <ShieldAlert size={10} />
                      Blocked
                    </span>
                  )}
                  <span className="truncate text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {t.title}
                  </span>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-3">
                  {t.assigneeName && (
                    <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      {t.assigneeName}
                    </span>
                  )}
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    <Clock size={11} />
                    {formatDuration(t.daysOpen)}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
