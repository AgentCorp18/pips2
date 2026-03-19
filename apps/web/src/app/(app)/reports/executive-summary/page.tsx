import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { ArrowLeft } from 'lucide-react'
import { getExecutiveSummaryData } from '../roi-dashboard/actions'
import { PrintButton } from './print-button'

export const metadata: Metadata = {
  title: 'Executive Summary',
  description: 'Print-ready executive summary of PIPS outcomes, savings, and methodology insights.',
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

const formatDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/* ============================================================
   Inline print styles (injected as a style tag)
   ============================================================ */

const printStyles = `
  @media print {
    /* Hide navigation, header, sidebar, and screen-only elements */
    nav, header, aside, [data-sidebar], [data-screen-only] {
      display: none !important;
    }
    /* Reset page margins */
    @page {
      margin: 0.75in;
    }
    body {
      background: white !important;
      color: black !important;
      font-size: 11pt;
    }
    /* Ensure content fills the page */
    [data-print-container] {
      max-width: 100% !important;
      padding: 0 !important;
    }
    /* Avoid page breaks inside cards */
    [data-print-card] {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    /* Force black text on white background */
    [data-print-card] {
      background: white !important;
      border: 1px solid #e5e7eb !important;
      box-shadow: none !important;
    }
    /* KPI values use full color for print */
    [data-kpi-value] {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    /* Bar chart colors */
    [data-bar] {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`

/* ============================================================
   Page
   ============================================================ */

const ExecutiveSummaryPage = async () => {
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

  const data = await getExecutiveSummaryData(currentOrg.orgId)

  const maxMonthlyCount = Math.max(...data.monthlyCompletions.map((m) => m.count), 1)

  return (
    <>
      {/* Print styles injected as a style element */}
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <div className="mx-auto max-w-4xl" data-print-container>
        {/* Screen-only navigation */}
        <div data-screen-only className="mb-6 flex items-center justify-between print:hidden">
          <Link
            href="/reports"
            className="inline-flex items-center gap-1 text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ArrowLeft size={14} />
            Back to Reports
          </Link>
          <PrintButton />
        </div>

        {/* ============================================================
            PRINT BODY — everything below renders in both screen + print
            ============================================================ */}

        {/* Header */}
        <div className="mb-8" data-print-card>
          <div
            className="rounded-xl p-6"
            style={{ background: 'linear-gradient(135deg, #1B134015 0%, #4F46E515 100%)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Executive Summary
                </p>
                <h1
                  className="mt-1 text-2xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                  data-testid="executive-summary-heading"
                >
                  {data.orgName}
                </h1>
                <p className="mt-1 text-base font-medium" style={{ color: '#4F46E5' }}>
                  {data.periodLabel}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  PIPS Methodology Report
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Generated {formatDate()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step stripe */}
        <div className="step-gradient-stripe mb-8 rounded-full print:hidden" />

        {/* Key Metrics — 4 hero cards */}
        <section className="mb-8">
          <h2
            className="mb-4 text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Key Metrics — {data.periodLabel}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4" data-print-card>
            {/* Projects Completed */}
            <div
              className="rounded-xl border p-4 text-center"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <p
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Projects
              </p>
              <p className="mt-2 text-3xl font-bold" style={{ color: '#4F46E5' }} data-kpi-value>
                {data.projectsCompleted}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                completed this quarter
              </p>
            </div>

            {/* Total Annual Savings */}
            <div
              className="rounded-xl border p-4 text-center"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <p
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Annual Savings
              </p>
              <p className="mt-2 text-3xl font-bold" style={{ color: '#10B981' }} data-kpi-value>
                {formatCurrency(data.totalAnnualSavings)}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {data.totalAnnualSavings === 0 ? 'add results metrics' : 'projected annual'}
              </p>
            </div>

            {/* Weekly Hours Saved */}
            <div
              className="rounded-xl border p-4 text-center"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <p
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Hours Saved
              </p>
              <p className="mt-2 text-3xl font-bold" style={{ color: '#3B82F6' }} data-kpi-value>
                {data.totalWeeklyHoursSaved > 0 ? `${data.totalWeeklyHoursSaved.toFixed(1)}h` : '—'}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                per week across projects
              </p>
            </div>

            {/* Avg ROI */}
            <div
              className="rounded-xl border p-4 text-center"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <p
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Avg ROI
              </p>
              <p className="mt-2 text-3xl font-bold" style={{ color: '#F59E0B' }} data-kpi-value>
                {data.avgRoiPercent !== null ? `${data.avgRoiPercent}%` : '—'}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {data.avgRoiPercent !== null ? 'across projects with data' : 'no ROI data yet'}
              </p>
            </div>
          </div>
        </section>

        {/* Projected Savings — from measurables */}
        {(data.measurablesCount > 0 || data.totalProjectedSavings > 0) && (
          <section className="mb-8" data-print-card>
            <h2
              className="mb-4 text-sm font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Projected Savings from Improvement Portfolio
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Projected annual savings */}
              <div
                className="rounded-xl border p-4"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  Projected Annual Savings
                </p>
                <p className="mt-2 text-2xl font-bold" style={{ color: '#059669' }} data-kpi-value>
                  {formatCurrency(data.totalProjectedSavings)}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {data.totalProjectedSavings === 0
                    ? 'Set cost targets in problem statement forms'
                    : 'from measurables targets across all projects'}
                </p>
              </div>

              {/* Projected annual hours */}
              <div
                className="rounded-xl border p-4"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  Time Savings Identified
                </p>
                <p className="mt-2 text-2xl font-bold" style={{ color: '#0891B2' }} data-kpi-value>
                  {data.totalProjectedHoursSaved > 0
                    ? `${data.totalProjectedHoursSaved.toLocaleString()}h/yr`
                    : '—'}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {data.totalProjectedHoursSaved === 0
                    ? 'Set time targets in problem statement forms'
                    : 'hours saved annually from time measurables'}
                </p>
              </div>

              {/* Measurables count */}
              <div
                className="rounded-xl border p-4"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  Measurables Tracked
                </p>
                <p className="mt-2 text-2xl font-bold" style={{ color: '#4338CA' }} data-kpi-value>
                  {data.measurablesCount}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {data.measurablesCount === 0
                    ? 'Add measurables in Step 1 problem statement'
                    : 'improvement metrics defined across projects'}
                </p>
              </div>
            </div>

            {/* Top 3 measurables by impact */}
            {data.topMeasurables.length > 0 && (
              <div className="mt-4 space-y-2">
                <p
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Top Measurables by Impact
                </p>
                {data.topMeasurables.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {m.metric || 'Unnamed metric'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {m.projectTitle} &bull; {m.unit}
                      </p>
                    </div>
                    <div className="ml-4 shrink-0 text-right">
                      {m.projectedAnnualSavings > 0 && (
                        <p
                          className="text-sm font-semibold"
                          style={{ color: '#059669' }}
                          data-kpi-value
                        >
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
          </section>
        )}

        {/* Highlights — Top Projects */}
        {data.topProjects.length > 0 && (
          <section className="mb-8" data-print-card>
            <h2
              className="mb-4 text-sm font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Top Projects by Impact
            </h2>
            <div className="space-y-3">
              {data.topProjects.map((project, idx) => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 rounded-lg border px-4 py-3"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span
                    className="shrink-0 text-sm font-bold"
                    style={{ color: 'var(--color-text-tertiary)', width: 20 }}
                  >
                    #{idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {project.title}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-6 text-sm">
                    {project.annualSavings > 0 && (
                      <div className="text-right">
                        <p className="font-semibold" style={{ color: '#10B981' }} data-kpi-value>
                          {formatCurrency(project.annualSavings)}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          annual savings
                        </p>
                      </div>
                    )}
                    {project.roiPercent > 0 && (
                      <div className="hidden text-right sm:block">
                        <p className="font-semibold" style={{ color: '#F59E0B' }} data-kpi-value>
                          {project.roiPercent}%
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
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
                        data-kpi-value
                      >
                        {project.depthPercent}%
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
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
        <section className="mb-8" data-print-card>
          <h2
            className="mb-4 text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Methodology Insights
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Avg depth */}
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                Avg Methodology Depth
              </p>
              <p
                className="mt-2 text-2xl font-bold"
                style={{
                  color:
                    data.avgMethodologyDepth >= 70
                      ? '#22C55E'
                      : data.avgMethodologyDepth >= 40
                        ? '#F59E0B'
                        : '#6366F1',
                }}
                data-kpi-value
              >
                {data.avgMethodologyDepth}%
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {data.avgMethodologyDepth >= 60
                  ? 'Strong methodology engagement'
                  : 'Room to deepen practice'}
              </p>
            </div>

            {/* Forms per project */}
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                Avg Forms per Project
              </p>
              <p
                className="mt-2 text-2xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
                data-kpi-value
              >
                {data.formsPerProject}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                methodology tools used per project
              </p>
            </div>

            {/* ROI multiplier */}
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                PIPS Advantage
              </p>
              {data.multiplier !== null ? (
                <>
                  <p
                    className="mt-2 text-2xl font-bold"
                    style={{ color: '#10B981' }}
                    data-kpi-value
                  >
                    {data.multiplier}x
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    better ROI with thorough methodology — high-depth projects achieve{' '}
                    {data.avgRoiHighDepth}% vs {data.avgRoiLowDepth}% for low-depth
                  </p>
                </>
              ) : (
                <>
                  <p
                    className="mt-2 text-2xl font-bold"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    —
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Add ROI data to multiple projects to see the PIPS advantage multiplier
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Monthly Completions Trend */}
        {data.monthlyCompletions.some((m) => m.count > 0) && (
          <section className="mb-8" data-print-card>
            <h2
              className="mb-4 text-sm font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Project Completions (Last 6 Months)
            </h2>
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-end gap-3">
                {data.monthlyCompletions.map(({ month, count }) => {
                  const heightPct = maxMonthlyCount > 0 ? (count / maxMonthlyCount) * 100 : 0
                  return (
                    <div key={month} className="flex flex-1 flex-col items-center gap-1">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {count > 0 ? count : ''}
                      </span>
                      <div
                        className="w-full rounded-t-sm"
                        style={{
                          height: `${Math.max(heightPct, 4)}px`,
                          minHeight: 4,
                          maxHeight: 80,
                          backgroundColor: count > 0 ? '#4F46E5' : 'var(--color-border)',
                        }}
                        data-bar
                        aria-label={`${month}: ${count} project${count !== 1 ? 's' : ''}`}
                      />
                      <span
                        className="text-center text-xs"
                        style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}
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
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}
        >
          <p>
            Generated by{' '}
            <span className="font-semibold" style={{ color: '#4F46E5' }}>
              PIPS
            </span>{' '}
            on {formatDate()} &mdash; pips-app.vercel.app
          </p>
          <p className="mt-0.5">
            {data.orgName} &bull; {data.periodLabel}
          </p>
        </div>
      </div>
    </>
  )
}

export default ExecutiveSummaryPage
