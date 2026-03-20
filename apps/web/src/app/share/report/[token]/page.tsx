import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { validateShareToken } from '@/lib/share-token'
import { parsePeriod } from '@/app/(app)/reports/roi-dashboard/actions'
import { getExecutiveSummaryPublic } from '@/lib/get-executive-summary-public'

export const metadata: Metadata = {
  title: 'Executive Summary | PIPS',
  description: 'Read-only executive summary report shared via PIPS.',
  robots: { index: false, follow: false },
}

/* ============================================================
   Helpers (duplicated from the authenticated page for isolation)
   ============================================================ */

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  if (value === 0) return '$0'
  return `$${value.toLocaleString()}`
}

const formatDate = (): string =>
  new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

/* ============================================================
   Page
   ============================================================ */

type ShareReportPageProps = {
  params: Promise<{ token: string }>
}

const ShareReportPage = async ({ params }: ShareReportPageProps) => {
  const { token } = await params

  const payload = validateShareToken(token)
  if (!payload || payload.reportType !== 'executive-summary') {
    notFound()
  }

  const period = parsePeriod(payload.period)
  const data = await getExecutiveSummaryPublic(payload.orgId, period)

  const maxMonthlyCount = Math.max(...data.monthlyCompletions.map((m) => m.count), 1)

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background, #fff)' }}>
      {/* Minimal public header */}
      <header
        className="border-b px-6 py-3"
        style={{ borderColor: 'var(--color-border, #e5e7eb)' }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold"
            style={{ color: '#4F46E5' }}
            aria-label="PIPS homepage"
          >
            PIPS
          </Link>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}>
            Read-only shared report &bull; expires 7 days from creation
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8" id="main-content">
        {/* Header card */}
        <div className="mb-8">
          <div
            className="rounded-xl p-6"
            style={{ background: 'linear-gradient(135deg, #1B134015 0%, #4F46E515 100%)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}
                >
                  Executive Summary
                </p>
                <h1
                  className="mt-1 text-2xl font-bold"
                  style={{ color: 'var(--color-text-primary, #111827)' }}
                >
                  {data.orgName}
                </h1>
                <p className="mt-1 text-base font-medium" style={{ color: '#4F46E5' }}>
                  PIPS Executive Summary &mdash; {data.periodLabel}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}>
                  PIPS Methodology Report
                </p>
                <p
                  className="mt-0.5 text-xs"
                  style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}
                >
                  Generated {formatDate()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <section className="mb-8">
          <h2
            className="mb-4 text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}
          >
            Key Metrics &mdash; {data.periodLabel}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard
              label="Projects"
              value={String(data.projectsCompleted)}
              sub="completed this period"
              color="#4F46E5"
            />
            <MetricCard
              label="Realised Savings"
              value={formatCurrency(data.totalAnnualSavings)}
              sub={data.totalAnnualSavings === 0 ? 'add results metrics' : 'annual (Step 6)'}
              color="#10B981"
              borderColor="#10B98140"
              bgColor="#10B98108"
            />
            <MetricCard
              label="Hours Saved"
              value={
                data.totalWeeklyHoursSaved > 0
                  ? `${data.totalWeeklyHoursSaved.toFixed(1)}h`
                  : '\u2014'
              }
              sub="per week across projects"
              color="#3B82F6"
            />
            <MetricCard
              label="Avg ROI"
              value={data.avgRoiPercent !== null ? `${data.avgRoiPercent}%` : '\u2014'}
              sub={
                data.avgRoiPercent !== null ? 'across projects with data' : 'no ROI data yet'
              }
              color="#F59E0B"
            />
          </div>
        </section>

        {/* Projected Savings */}
        {(data.measurablesCount > 0 || data.totalProjectedSavings > 0) && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <div
                className="h-3 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: '#F59E0B' }}
                aria-hidden="true"
              />
              <h2
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: '#B45309' }}
              >
                Projected Savings
                <span
                  className="ml-1 font-normal normal-case tracking-normal"
                  style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}
                >
                  &mdash; from measurable targets (Step 1)
                </span>
              </h2>
            </div>
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: '#F59E0B40', backgroundColor: '#F59E0B06' }}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard
                  label="Projected Annual Savings"
                  value={formatCurrency(data.totalProjectedSavings)}
                  sub={
                    data.totalProjectedSavings === 0
                      ? 'Set cost targets in problem statement forms'
                      : 'from measurables targets across all projects'
                  }
                  color="#D97706"
                  labelColor="#B45309"
                />
                <MetricCard
                  label="Time Savings Identified"
                  value={
                    data.totalProjectedHoursSaved > 0
                      ? `${data.totalProjectedHoursSaved.toLocaleString()}h/yr`
                      : '\u2014'
                  }
                  sub={
                    data.totalProjectedHoursSaved === 0
                      ? 'Set time targets in problem statement forms'
                      : 'hours saved annually from time measurables'
                  }
                  color="#D97706"
                  labelColor="#B45309"
                />
                <MetricCard
                  label="Measurables Tracked"
                  value={String(data.measurablesCount)}
                  sub={
                    data.measurablesCount === 0
                      ? 'Add measurables in Step 1 problem statement'
                      : 'improvement metrics defined across projects'
                  }
                  color="#D97706"
                  labelColor="#B45309"
                />
              </div>
              {data.topMeasurables.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: '#B45309' }}
                  >
                    Top Measurables by Impact
                  </p>
                  {data.topMeasurables.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
                      style={{ borderColor: 'var(--color-border, #e5e7eb)' }}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-sm font-medium"
                          style={{ color: 'var(--color-text-primary, #111827)' }}
                        >
                          {m.metric || 'Unnamed metric'}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}
                        >
                          {m.projectTitle} &bull; {m.unit}
                        </p>
                      </div>
                      <div className="ml-4 shrink-0 text-right">
                        {m.projectedAnnualSavings > 0 && (
                          <p className="text-sm font-semibold" style={{ color: '#D97706' }}>
                            {formatCurrency(m.projectedAnnualSavings)}/yr
                          </p>
                        )}
                        {m.projectedAnnualHours > 0 && (
                          <p className="text-xs" style={{ color: '#0891B2' }}>
                            {m.projectedAnnualHours.toLocaleString()}h/yr
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Realised Savings */}
        {(data.totalAnnualSavings > 0 || data.realisationRate !== null) && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <div
                className="h-3 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: '#10B981' }}
                aria-hidden="true"
              />
              <h2
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: '#059669' }}
              >
                Realised Savings
                <span
                  className="ml-1 font-normal normal-case tracking-normal"
                  style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}
                >
                  &mdash; confirmed in results metrics (Step 6)
                </span>
              </h2>
            </div>
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: '#10B98140', backgroundColor: '#10B98106' }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label="Realised Annual Savings"
                  value={formatCurrency(data.totalAnnualSavings)}
                  sub="confirmed in Results Metrics across all projects"
                  color="#10B981"
                  labelColor="#059669"
                />
                <MetricCard
                  label="Realisation Rate"
                  value={
                    data.realisationRate !== null ? `${data.realisationRate}%` : '\u2014'
                  }
                  sub={
                    data.realisationRate !== null
                      ? 'realised \u00f7 projected savings'
                      : 'Need both projected + realised data'
                  }
                  color={
                    data.realisationRate === null
                      ? 'var(--color-text-tertiary, #9ca3af)'
                      : data.realisationRate >= 80
                        ? '#10B981'
                        : data.realisationRate >= 50
                          ? '#F59E0B'
                          : '#EF4444'
                  }
                  labelColor="#059669"
                />
              </div>
            </div>
          </section>
        )}

        {/* Top Projects */}
        {data.topProjects.length > 0 && (
          <section className="mb-8">
            <h2
              className="mb-4 text-sm font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}
            >
              Top Projects by Impact
            </h2>
            <div className="space-y-3">
              {data.topProjects.map((project, idx) => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 rounded-lg border px-4 py-3"
                  style={{ borderColor: 'var(--color-border, #e5e7eb)' }}
                >
                  <span
                    className="shrink-0 text-sm font-bold"
                    style={{
                      color: 'var(--color-text-tertiary, #9ca3af)',
                      width: 20,
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate font-medium"
                      style={{ color: 'var(--color-text-primary, #111827)' }}
                    >
                      {project.title}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-6 text-sm">
                    {project.annualSavings > 0 && (
                      <div className="text-right">
                        <p className="font-semibold" style={{ color: '#10B981' }}>
                          {formatCurrency(project.annualSavings)}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}
                        >
                          realised savings
                        </p>
                      </div>
                    )}
                    {project.roiPercent > 0 && (
                      <div className="hidden text-right sm:block">
                        <p className="font-semibold" style={{ color: '#F59E0B' }}>
                          {project.roiPercent}%
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}
                        >
                          ROI
                        </p>
                      </div>
                    )}
                    <div className="text-right">
                      <p
                        className="font-semibold"
                        style={{
                          color:
                            project.depthPercent >= 70
                              ? '#22C55E'
                              : project.depthPercent >= 40
                                ? '#F59E0B'
                                : '#6366F1',
                        }}
                      >
                        {project.depthPercent}%
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}
                      >
                        depth
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Methodology Insights */}
        <section className="mb-8">
          <h2
            className="mb-4 text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}
          >
            Methodology Insights
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Avg Methodology Depth"
              value={`${data.avgMethodologyDepth}%`}
              sub={
                data.avgMethodologyDepth >= 60
                  ? 'Strong methodology engagement'
                  : 'Room to deepen practice'
              }
              color={
                data.avgMethodologyDepth >= 70
                  ? '#22C55E'
                  : data.avgMethodologyDepth >= 40
                    ? '#F59E0B'
                    : '#6366F1'
              }
            />
            <MetricCard
              label="Avg Forms per Project"
              value={String(data.formsPerProject)}
              sub="methodology tools used per project"
              color="var(--color-text-primary, #111827)"
            />
            {data.multiplier !== null ? (
              <MetricCard
                label="PIPS Advantage"
                value={`${data.multiplier}x`}
                sub={`better ROI with thorough methodology — high-depth ${data.avgRoiHighDepth}% vs low-depth ${data.avgRoiLowDepth}%`}
                color="#10B981"
              />
            ) : (
              <MetricCard
                label="PIPS Advantage"
                value="\u2014"
                sub="Add ROI data to multiple projects to see the PIPS advantage multiplier"
                color="var(--color-text-tertiary, #9ca3af)"
              />
            )}
          </div>
        </section>

        {/* Monthly Completions Trend */}
        {data.monthlyCompletions.some((m) => m.count > 0) && (
          <section className="mb-8">
            <h2
              className="mb-4 text-sm font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-tertiary, #9ca3af)' }}
            >
              Project Completions (Last 6 Months)
            </h2>
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: 'var(--color-border, #e5e7eb)' }}
            >
              <div className="flex items-end gap-3">
                {data.monthlyCompletions.map(({ month, count }) => {
                  const heightPct = maxMonthlyCount > 0 ? (count / maxMonthlyCount) * 100 : 0
                  return (
                    <div key={month} className="flex flex-1 flex-col items-center gap-1">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: 'var(--color-text-primary, #111827)' }}
                      >
                        {count > 0 ? count : ''}
                      </span>
                      <div
                        className="w-full rounded-t-sm"
                        style={{
                          height: `${Math.max(heightPct, 4)}px`,
                          minHeight: 4,
                          maxHeight: 80,
                          backgroundColor:
                            count > 0 ? '#4F46E5' : 'var(--color-border, #e5e7eb)',
                        }}
                        aria-label={`${month}: ${count} project${count !== 1 ? 's' : ''}`}
                      />
                      <span
                        className="text-center text-xs"
                        style={{
                          color: 'var(--color-text-tertiary, #9ca3af)',
                          fontSize: '10px',
                        }}
                      >
                        {month}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <div
          className="border-t pt-6 text-center text-xs"
          style={{
            borderColor: 'var(--color-border, #e5e7eb)',
            color: 'var(--color-text-tertiary, #9ca3af)',
          }}
        >
          <p>
            Generated by{' '}
            <Link href="/" className="font-semibold" style={{ color: '#4F46E5' }}>
              PIPS
            </Link>{' '}
            on {formatDate()} &mdash; pips-app.vercel.app
          </p>
          <p className="mt-0.5">
            {data.orgName} &bull; {data.periodLabel}
          </p>
          <p className="mt-2">
            <Link
              href="/login"
              className="underline underline-offset-2 hover:opacity-80"
              style={{ color: '#4F46E5' }}
            >
              Sign in to PIPS
            </Link>{' '}
            to view live data, add projects, and generate reports.
          </p>
        </div>
      </main>
    </div>
  )
}

/* ============================================================
   MetricCard sub-component
   ============================================================ */

type MetricCardProps = {
  label: string
  value: string
  sub: string
  color: string
  labelColor?: string
  borderColor?: string
  bgColor?: string
}

const MetricCard = ({
  label,
  value,
  sub,
  color,
  labelColor,
  borderColor,
  bgColor,
}: MetricCardProps) => (
  <div
    className="rounded-xl border p-4 text-center"
    style={{
      borderColor: borderColor ?? 'var(--color-border, #e5e7eb)',
      backgroundColor: bgColor ?? 'var(--color-surface, #f9fafb)',
    }}
  >
    <p
      className="text-xs font-medium uppercase tracking-wide"
      style={{ color: labelColor ?? 'var(--color-text-tertiary, #9ca3af)' }}
    >
      {label}
    </p>
    <p className="mt-2 text-3xl font-bold" style={{ color }}>
      {value}
    </p>
    <p
      className="mt-0.5 text-xs"
      style={{ color: 'var(--color-text-secondary, #6b7280)' }}
    >
      {sub}
    </p>
  </div>
)

export default ShareReportPage
