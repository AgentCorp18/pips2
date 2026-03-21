import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Timer, FileCheck, Percent, Minus } from 'lucide-react'
import type { DashboardMetrics } from '@/app/(app)/dashboard/actions'

type MetricsWidgetsProps = {
  metrics: DashboardMetrics
  /** When true, renders skeleton placeholder cards instead of real data */
  loading?: boolean
}

const MetricsWidgetsSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="metrics-widgets-skeleton">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="flex items-center gap-3 py-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

export const MetricsWidgets = ({ metrics, loading = false }: MetricsWidgetsProps) => {
  if (loading) {
    return <MetricsWidgetsSkeleton />
  }

  const ticketTrend = metrics.ticketsClosedThisWeek - metrics.ticketsCreatedThisWeek
  const trendPositive = ticketTrend >= 0

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      data-testid="metrics-widgets"
      aria-label="Dashboard performance metrics"
    >
      {/* Completion Rate */}
      <Card
        data-testid="metric-completion-rate"
        title="Percentage of projects that have reached completed status"
      >
        <CardContent className="flex items-center gap-3 py-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)' }}
          >
            <Percent size={18} style={{ color: '#22C55E' }} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {metrics.completionRate}%
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Project Completion Rate
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Avg Cycle Time */}
      <Card
        data-testid="metric-avg-cycle-time"
        title="Average days from project creation to completion, calculated over the last 90 days"
      >
        <CardContent className="flex items-center gap-3 py-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)' }}
          >
            <Timer size={18} style={{ color: '#3B82F6' }} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {metrics.avgCycleTimeDays !== null ? `${metrics.avgCycleTimeDays}d` : '--'}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Avg Cycle Time (90d)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Velocity */}
      <Card data-testid="metric-ticket-velocity">
        <CardContent className="flex items-center gap-3 py-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor: trendPositive
                ? 'rgba(34, 197, 94, 0.12)'
                : 'rgba(239, 68, 68, 0.12)',
            }}
          >
            {ticketTrend > 0 ? (
              <TrendingUp size={18} style={{ color: '#22C55E' }} aria-hidden="true" />
            ) : ticketTrend < 0 ? (
              <TrendingDown size={18} style={{ color: '#EF4444' }} aria-hidden="true" />
            ) : (
              <Minus size={18} style={{ color: 'var(--color-text-tertiary)' }} aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {metrics.ticketsClosedThisWeek}
              <span className="text-sm font-normal" style={{ color: 'var(--color-text-tertiary)' }}>
                {' '}
                / {metrics.ticketsCreatedThisWeek}
              </span>
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Closed / Created This Week
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Forms Completed */}
      <Card data-testid="metric-forms-completed">
        <CardContent className="flex items-center gap-3 py-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(168, 85, 247, 0.12)' }}
          >
            <FileCheck size={18} style={{ color: '#8B5CF6' }} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {metrics.formsCompletedCount}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Methodology Forms
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
