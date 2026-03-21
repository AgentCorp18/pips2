import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FolderKanban,
  FolderOpen,
  TicketCheck,
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldAlert,
} from 'lucide-react'
import type { DashboardStats, DashboardDeltas, StatDelta } from '@/app/(app)/dashboard/actions'

/* ============================================================
   Delta indicator
   ============================================================ */

type DeltaIndicatorProps = {
  delta: StatDelta
  /**
   * Whether "up" is considered a good direction for this metric.
   * - true  → green when up, red when down
   * - false → red when up, green when down
   */
  upIsGood: boolean
}

const DeltaIndicator = ({ delta, upIsGood }: DeltaIndicatorProps) => {
  if (delta.direction === 'flat') {
    return (
      <span
        className="mt-1 block text-xs"
        style={{ color: 'var(--color-text-tertiary)' }}
        data-testid="delta-flat"
      >
        — vs last week
      </span>
    )
  }

  const isPositive =
    (delta.direction === 'up' && upIsGood) || (delta.direction === 'down' && !upIsGood)
  const color = isPositive ? '#16A34A' : '#DC2626'
  const arrow = delta.direction === 'up' ? '↑' : '↓'
  const absValue = Math.abs(delta.delta)

  return (
    <span
      className="mt-1 block text-xs font-medium"
      style={{ color }}
      data-testid={`delta-${delta.direction}`}
    >
      {arrow}
      {absValue} vs last week
    </span>
  )
}

/* ============================================================
   Card definitions
   ============================================================ */

type StatCardsProps = {
  stats: DashboardStats
  deltas?: DashboardDeltas
}

type CardDef = {
  key: keyof DashboardStats
  title: string
  icon: typeof FolderKanban
  color: string
  testId: string
  accentWhenPositive?: string
  href?: string
  deltaKey?: keyof DashboardDeltas
  deltaUpIsGood?: boolean
}

const CARDS: CardDef[] = [
  {
    key: 'totalProjects',
    title: 'Total Projects',
    icon: FolderKanban,
    color: 'var(--color-step-1)',
    testId: 'stat-total-projects',
    href: '/projects',
  },
  {
    key: 'activeProjects',
    title: 'Active Projects',
    icon: FolderOpen,
    color: 'var(--color-step-1)',
    testId: 'stat-active-projects',
    href: '/projects?status=active',
    deltaKey: 'activeProjects',
    deltaUpIsGood: true,
  },
  {
    key: 'openTickets',
    title: 'Open Tickets',
    icon: TicketCheck,
    color: 'var(--color-step-2)',
    testId: 'stat-open-tickets',
    href: '/tickets?status=todo&status=in_progress&status=in_review&status=blocked',
    deltaKey: 'openTickets',
    deltaUpIsGood: false,
  },
  {
    key: 'overdueTickets',
    title: 'Overdue',
    icon: AlertTriangle,
    color: 'var(--color-step-2)',
    accentWhenPositive: 'var(--color-signal-red)',
    testId: 'stat-overdue',
    href: '/tickets?quick=overdue',
    deltaKey: 'overdueTickets',
    deltaUpIsGood: false,
  },
  {
    key: 'completedThisMonth',
    title: 'Completed This Month',
    icon: CheckCircle2,
    color: 'var(--color-step-3)',
    testId: 'stat-completed',
    href: '/tickets?status=done',
    deltaKey: 'completedThisMonth',
    deltaUpIsGood: true,
  },
  {
    key: 'teamMembers',
    title: 'Team Members',
    icon: Users,
    color: 'var(--color-step-4)',
    testId: 'stat-team-members',
    href: '/settings/members',
  },
]

export const StatCards = ({ stats, deltas }: StatCardsProps) => {
  const hasBlockers = stats.blockedTickets > 0

  return (
    <div className="space-y-4">
      {/* Blockers banner — only shown when blocked tickets exist */}
      {hasBlockers && (
        <Link
          href="/tickets?status=blocked"
          className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 transition-colors hover:bg-red-100"
          data-testid="stat-blocked-tickets-banner"
        >
          <ShieldAlert size={18} className="shrink-0 text-red-600" aria-hidden="true" />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <span className="text-sm font-semibold text-red-700">
              {stats.blockedTickets} Blocked Ticket{stats.blockedTickets !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-red-500">These need attention — click to view</span>
          </div>
        </Link>
      )}

      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
        {CARDS.map((card) => {
          const Icon = card.icon
          const value = stats[card.key]
          const isOverduePositive = card.key === 'overdueTickets' && value > 0
          const iconColor = isOverduePositive ? card.accentWhenPositive : card.color
          const statDelta = card.deltaKey && deltas ? deltas[card.deltaKey] : undefined

          const inner = (
            <Card data-testid={card.testId} className="flex h-full flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {card.title}
                </CardTitle>
                <Icon size={18} style={{ color: iconColor }} aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-bold"
                  style={{
                    color: isOverduePositive
                      ? 'var(--color-signal-red)'
                      : 'var(--color-text-primary)',
                  }}
                >
                  {value}
                </div>
                {/* Show blocked chip inside the Open Tickets card */}
                {card.key === 'openTickets' && hasBlockers && (
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    <ShieldAlert size={10} aria-hidden="true" />
                    {stats.blockedTickets} blocked
                  </div>
                )}
                {/* Week-over-week delta indicator */}
                {statDelta !== undefined && card.deltaUpIsGood !== undefined && (
                  <DeltaIndicator delta={statDelta} upIsGood={card.deltaUpIsGood} />
                )}
              </CardContent>
            </Card>
          )

          if (card.href) {
            return (
              <Link key={card.key} href={card.href} className="transition-opacity hover:opacity-80">
                {inner}
              </Link>
            )
          }

          // For non-linked cards, wrap in a fragment with key
          return <div key={card.key}>{inner}</div>
        })}
      </div>
    </div>
  )
}
