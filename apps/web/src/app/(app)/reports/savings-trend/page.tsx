import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/reports/kpi-card'
import { LazySavingsTrendChart } from '@/components/reports/lazy-charts'
import { ArrowLeft, TrendingUp, DollarSign, Clock, Target, CheckCircle2 } from 'lucide-react'
import { getSavingsTrend } from './actions'
import { CsvExportButton } from '@/components/reports/csv-export-button'

export const metadata: Metadata = {
  title: 'Savings Trend Report',
  description: 'Monthly projected vs actual savings across all PIPS improvement projects.',
}

/* ============================================================
   Helpers
   ============================================================ */

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  if (value === 0) return '$0'
  return `$${value.toLocaleString()}`
}

type PeriodOption = '3' | '6' | '12' | 'all'
const VALID_PERIODS: PeriodOption[] = ['3', '6', '12', 'all']

const parsePeriod = (raw: string | undefined): PeriodOption =>
  VALID_PERIODS.includes(raw as PeriodOption) ? (raw as PeriodOption) : '12'

const PERIOD_LABELS: Record<PeriodOption, string> = {
  '3': 'Last 3 months',
  '6': 'Last 6 months',
  '12': 'Last 12 months',
  all: 'All time',
}

const periodToMonths = (period: PeriodOption): number | undefined => {
  if (period === 'all') return undefined
  return Number(period)
}

/* ============================================================
   Sub-components
   ============================================================ */

const FilterLink = ({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) => (
  <Link
    href={href}
    className="rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium transition-colors"
    style={
      active
        ? { backgroundColor: 'var(--color-primary)', color: '#fff' }
        : {
            color: 'var(--color-text-secondary)',
            backgroundColor: 'var(--color-surface-secondary)',
          }
    }
  >
    {children}
  </Link>
)

/* ============================================================
   Page
   ============================================================ */

type SavingsTrendPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const SavingsTrendPage = async ({ searchParams }: SavingsTrendPageProps) => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentOrg = await getCurrentOrg(supabase, user.id)

  if (!currentOrg) {
    redirect('/onboarding')
  }

  const params = await searchParams
  const period = parsePeriod(typeof params.period === 'string' ? params.period : undefined)
  const periodMonths = periodToMonths(period)

  const data = await getSavingsTrend(currentOrg.orgId, periodMonths)

  const buildUrl = (p: PeriodOption) => `/reports/savings-trend?period=${p}`

  const categoryColors: Record<string, string> = {
    Time: '#3B82F6',
    Cost: '#10B981',
    Quality: '#8B5CF6',
  }

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/reports"
          className="mb-3 inline-flex items-center gap-1 text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back to Reports
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
              data-testid="savings-trend-heading"
            >
              Savings Trend Report
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Monthly view of projected vs actual savings from your PIPS improvement projects.
            </p>
          </div>
          <CsvExportButton
            data={data.monthly.map((row) => ({
              month: row.monthLabel,
              projected: row.projectedSavings,
              actual: row.actualSavings,
              delta: row.actualSavings - row.projectedSavings,
              projectsCompleted: row.projectsCompleted,
            }))}
            filename="savings-trend"
            columns={[
              { key: 'month', label: 'Month' },
              { key: 'projected', label: 'Projected Savings ($)' },
              { key: 'actual', label: 'Actual Savings ($)' },
              { key: 'delta', label: 'Delta ($)' },
              { key: 'projectsCompleted', label: 'Projects Completed' },
            ]}
          />
        </div>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* Hero KPIs */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Projected Savings"
          value={formatCurrency(data.totalProjected)}
          icon={Target}
          color="#3B82F6"
          subtitle={
            data.totalProjected === 0 ? 'Add measurables to projects' : 'from measurables targets'
          }
        />
        <KpiCard
          title="Total Actual Savings"
          value={formatCurrency(data.totalActual)}
          icon={DollarSign}
          color="#10B981"
          subtitle={
            data.totalActual === 0
              ? 'Add Results Metrics to projects'
              : 'reported in Results Metrics'
          }
        />
        <KpiCard
          title="Hours Saved Annually"
          value={data.totalHoursSaved > 0 ? `${data.totalHoursSaved.toLocaleString()}h` : '--'}
          icon={Clock}
          color="#F59E0B"
          subtitle={
            data.totalHoursSaved === 0 ? 'No time measurables yet' : 'annualised from time targets'
          }
        />
        <KpiCard
          title="Achievement Rate"
          value={data.achievementRate !== null ? `${data.achievementRate}%` : '--'}
          icon={
            data.achievementRate !== null && data.achievementRate >= 100 ? CheckCircle2 : TrendingUp
          }
          color={
            data.achievementRate === null
              ? '#6B7280'
              : data.achievementRate >= 80
                ? '#10B981'
                : data.achievementRate >= 50
                  ? '#F59E0B'
                  : '#EF4444'
          }
          subtitle={
            data.achievementRate === null
              ? 'No projected or actual data'
              : 'actual ÷ projected savings'
          }
        />
      </div>

      {/* Period filter */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
          Period:
        </span>
        <div className="flex flex-wrap gap-1">
          {VALID_PERIODS.map((p) => (
            <FilterLink key={p} href={buildUrl(p)} active={period === p}>
              {PERIOD_LABELS[p]}
            </FilterLink>
          ))}
        </div>
      </div>

      {/* Trend chart */}
      <div className="mb-8">
        <LazySavingsTrendChart data={data.monthly} />
      </div>

      {/* Category breakdown */}
      <div className="mb-8">
        <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Savings by Category
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {data.savingsByCategory.map((cat) => {
            const color = categoryColors[cat.category] ?? '#6B7280'
            const hasData = cat.projected > 0 || cat.actual > 0
            return (
              <Card key={cat.category}>
                <CardHeader className="pb-3">
                  <CardTitle
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <span
                      className="inline-block h-3 w-3 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                    {cat.category} Savings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {!hasData ? (
                    <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                      No {cat.category.toLowerCase()} measurables recorded yet.
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          Projected
                        </span>
                        <span className="text-sm font-semibold" style={{ color }}>
                          {cat.projected > 0 ? formatCurrency(cat.projected) : '--'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          Actual
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {cat.actual > 0 ? formatCurrency(cat.actual) : '--'}
                        </span>
                      </div>
                      {cat.projected > 0 && cat.actual > 0 && (
                        <div
                          className="flex items-center justify-between border-t pt-2"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                            Achievement
                          </span>
                          <span
                            className="text-sm font-semibold"
                            style={{
                              color:
                                cat.actual >= cat.projected
                                  ? '#10B981'
                                  : cat.actual >= cat.projected * 0.5
                                    ? '#F59E0B'
                                    : '#EF4444',
                            }}
                          >
                            {Math.round((cat.actual / cat.projected) * 100)}%
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Monthly table */}
      {data.monthly.length > 0 && (
        <div className="mb-8">
          <h2
            className="mb-4 text-base font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Monthly Detail
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className="border-b"
                      style={{
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'var(--color-surface-secondary)',
                      }}
                    >
                      <th
                        className="px-4 py-3 text-left text-xs font-medium"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Month
                      </th>
                      <th
                        className="px-4 py-3 text-right text-xs font-medium"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Projected
                      </th>
                      <th
                        className="px-4 py-3 text-right text-xs font-medium"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Actual
                      </th>
                      <th
                        className="px-4 py-3 text-right text-xs font-medium"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Delta
                      </th>
                      <th
                        className="px-4 py-3 text-right text-xs font-medium"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Projects Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthly.map((row) => {
                      const delta = row.actualSavings - row.projectedSavings
                      const hasActivity =
                        row.projectedSavings > 0 ||
                        row.actualSavings > 0 ||
                        row.projectsCompleted > 0
                      if (!hasActivity) return null
                      return (
                        <tr
                          key={row.month}
                          className="border-b transition-colors hover:bg-[var(--color-surface-secondary)]"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <td
                            className="px-4 py-3 font-medium"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {row.monthLabel}
                          </td>
                          <td
                            className="px-4 py-3 text-right"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {row.projectedSavings > 0 ? formatCurrency(row.projectedSavings) : '--'}
                          </td>
                          <td className="px-4 py-3 text-right" style={{ color: '#10B981' }}>
                            {row.actualSavings > 0 ? formatCurrency(row.actualSavings) : '--'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {row.projectedSavings > 0 && row.actualSavings > 0 ? (
                              <span
                                style={{
                                  color: delta >= 0 ? '#10B981' : '#EF4444',
                                  fontWeight: 500,
                                }}
                              >
                                {delta >= 0 ? '+' : ''}
                                {formatCurrency(delta)}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--color-text-tertiary)' }}>--</span>
                            )}
                          </td>
                          <td
                            className="px-4 py-3 text-right"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {row.projectsCompleted > 0 ? row.projectsCompleted : '--'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {data.monthly.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <DollarSign
              size={36}
              className="mx-auto mb-4"
              style={{ color: 'var(--color-text-tertiary)' }}
            />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              No savings data yet
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Add measurables to Problem Statement forms to see projected savings.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SavingsTrendPage
