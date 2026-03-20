import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Card, CardContent } from '@/components/ui/card'
import { KpiCard } from '@/components/reports/kpi-card'
import { MethodologyCorrelation } from '@/components/reports/methodology-correlation'
import { LazyRoiTrendChart as RoiTrendChart } from '@/components/reports/lazy-charts'
import {
  ArrowLeft,
  DollarSign,
  Clock,
  TrendingUp,
  BarChart2,
  ChevronRight,
  PlusCircle,
  ListChecks,
  FolderKanban,
  ListTodo,
} from 'lucide-react'
import { TeamPerformanceTable } from '@/components/reports/team-performance-table'
import { getROIDashboardData, getMethodologyCorrelation, getTeamPerformance } from './actions'
import { CsvExportButton } from '@/components/reports/csv-export-button'
import { ReportEmptyState } from '@/components/reports/report-empty-state'

export const metadata: Metadata = {
  title: 'ROI Dashboard',
  description:
    'Executive ROI dashboard showing total savings, hours saved, average ROI, and methodology-outcome correlation.',
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

const depthColor = (pct: number): string => {
  if (pct >= 70) return '#22C55E'
  if (pct >= 40) return '#F59E0B'
  return '#6366F1'
}

/* ============================================================
   Page
   ============================================================ */

const ROIDashboardPage = async () => {
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

  const orgId = currentOrg.orgId

  const [roiData, correlation, teamPerformance] = await Promise.all([
    getROIDashboardData(orgId),
    getMethodologyCorrelation(orgId),
    getTeamPerformance(orgId),
  ])

  const noRoiData = roiData.projectsWithRoiData === 0
  const noProjects = correlation.dataPoints.length === 0
  const noMeasurables = roiData.measurablesCount === 0 && !noProjects

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
              data-testid="roi-dashboard-heading"
            >
              ROI Dashboard
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Executive view of financial impact, time savings, and the relationship between
              methodology depth and outcomes.
            </p>
          </div>
          <CsvExportButton
            data={roiData.topProjectsByImpact.map((p) => ({
              title: p.title,
              annualSavings: p.annualSavings,
              roiPercent: p.roiPercent,
              methodologyDepth: `${p.depthPercent}%`,
              cycleTimeDays: p.cycleTimeDays ?? '',
            }))}
            filename="roi-dashboard"
            columns={[
              { key: 'title', label: 'Project' },
              { key: 'annualSavings', label: 'Annual Savings ($)' },
              { key: 'roiPercent', label: 'ROI (%)' },
              { key: 'methodologyDepth', label: 'Methodology Depth' },
              { key: 'cycleTimeDays', label: 'Cycle Time (Days)' },
            ]}
          />
        </div>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* No-projects guard */}
      {noProjects && (
        <ReportEmptyState
          icon={FolderKanban}
          title="Start your first project to see ROI data"
          description="Create a project and fill in Impact Metrics (Step 1) and Results Metrics (Step 6) to unlock this dashboard."
          actionLabel="Create Project"
          actionHref="/projects/new"
        />
      )}

      {/* No-measurables nudge */}
      {noMeasurables && (
        <div className="mb-6">
          <ReportEmptyState
            icon={ListTodo}
            title="Add measurables to track ROI"
            description="Open a Problem Statement form (Step 1) and add measurables to start projecting savings and tracking outcomes."
            actionLabel="Learn How"
            actionHref="/knowledge"
            note="You have projects — add measurables to unlock financial projections."
          />
        </div>
      )}

      {/* Hero KPI strip */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Annual Savings"
          value={formatCurrency(roiData.totalAnnualSavings)}
          icon={DollarSign}
          color="#10B981"
          subtitle={
            roiData.totalAnnualSavings === 0
              ? 'Add results metrics to projects'
              : 'across all projects'
          }
        />
        <KpiCard
          title="Weekly Hours Saved"
          value={
            roiData.totalWeeklyHoursSaved > 0
              ? `${roiData.totalWeeklyHoursSaved.toFixed(1)}h`
              : '--'
          }
          icon={Clock}
          color="#3B82F6"
          subtitle={
            roiData.totalWeeklyHoursSaved === 0
              ? 'No time savings recorded'
              : 'per week across all projects'
          }
        />
        <KpiCard
          title="Average ROI"
          value={roiData.avgRoiPercent !== null ? `${roiData.avgRoiPercent}%` : '--'}
          icon={TrendingUp}
          color="#F59E0B"
          subtitle={
            roiData.avgRoiPercent === null ? 'No ROI data yet' : 'across projects with data'
          }
        />
        <KpiCard
          title="Projects with ROI Data"
          value={roiData.projectsWithRoiData}
          icon={BarChart2}
          color="#6366F1"
          subtitle={
            roiData.projectsWithRoiData === 0
              ? 'No results metrics filled'
              : `of ${correlation.dataPoints.length} total project${correlation.dataPoints.length !== 1 ? 's' : ''}`
          }
        />
      </div>

      {/* Measurables-based projected savings */}
      {(roiData.measurablesCount > 0 || roiData.totalProjectedSavings > 0) && (
        <section className="mb-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Projected Savings from Measurables
            </h2>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Based on problem statement targets
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard
              title="Projected Annual Savings"
              value={formatCurrency(roiData.totalProjectedSavings)}
              icon={DollarSign}
              color="#059669"
              subtitle={
                roiData.totalProjectedSavings === 0
                  ? 'No cost measurables set'
                  : 'from measurables targets'
              }
            />
            <KpiCard
              title="Hours Saved Annually"
              value={
                roiData.totalProjectedHoursSaved > 0
                  ? `${roiData.totalProjectedHoursSaved.toLocaleString()}h`
                  : '--'
              }
              icon={Clock}
              color="#0891B2"
              subtitle={
                roiData.totalProjectedHoursSaved === 0
                  ? 'No time measurables set'
                  : 'per year from time targets'
              }
            />
            <KpiCard
              title="Measurables Tracked"
              value={roiData.measurablesCount}
              icon={ListChecks}
              color="#4338CA"
              subtitle={
                roiData.projectsWithMeasurables === 0
                  ? 'Add measurables in Step 1'
                  : `across ${roiData.projectsWithMeasurables} project${roiData.projectsWithMeasurables !== 1 ? 's' : ''}`
              }
            />
          </div>
        </section>
      )}

      {/* Methodology-Outcome Correlation */}
      <section className="mb-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Methodology-Outcome Correlation
          </h2>
          <Link
            href="/reports/portfolio-value"
            className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--color-primary)' }}
          >
            Portfolio View <ChevronRight size={14} />
          </Link>
        </div>
        <MethodologyCorrelation data={correlation} />
      </section>

      {/* Top Projects by Impact */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Top Projects by Impact
        </h2>
        <Card>
          <CardContent className="p-0">
            {roiData.topProjectsByImpact.length === 0 ? (
              <div
                className="flex h-32 items-center justify-center text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                No projects found. Create projects and use PIPS to start tracking impact.
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {roiData.topProjectsByImpact.map((project, idx) => (
                  <div key={project.id} className="flex items-center gap-4 px-6 py-4">
                    {/* Rank */}
                    <span
                      className="shrink-0 text-sm font-bold"
                      style={{ color: 'var(--color-text-tertiary)', width: 20 }}
                    >
                      #{idx + 1}
                    </span>

                    {/* Project name */}
                    <Link
                      href={`/projects/${project.id}`}
                      className="group flex min-w-0 flex-1 items-center gap-1.5 font-medium leading-snug hover:underline"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      <span className="truncate">{project.title}</span>
                      <ChevronRight
                        size={14}
                        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      />
                    </Link>

                    {/* Metrics */}
                    <div className="flex shrink-0 items-center gap-6 text-sm">
                      <div className="hidden flex-col items-end sm:flex">
                        <span className="font-semibold" style={{ color: '#10B981' }}>
                          {project.annualSavings > 0 ? formatCurrency(project.annualSavings) : '--'}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          annual savings
                        </span>
                      </div>
                      <div className="hidden flex-col items-end lg:flex">
                        <span className="font-semibold" style={{ color: '#F59E0B' }}>
                          {project.roiPercent > 0 ? `${project.roiPercent}%` : '--'}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          ROI
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className="font-semibold"
                          style={{ color: depthColor(project.depthPercent) }}
                        >
                          {project.depthPercent}%
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          depth
                        </span>
                      </div>
                      <div className="hidden flex-col items-end md:flex">
                        <span
                          className="font-semibold"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {project.cycleTimeDays !== null ? `${project.cycleTimeDays}d` : '--'}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          cycle
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ROI Trend chart */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Savings Over Time
        </h2>
        <RoiTrendChart data={roiData.monthlyTrend} />
      </section>

      {/* Team Performance */}
      {teamPerformance.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Team Performance
          </h2>
          <TeamPerformanceTable data={teamPerformance} />
        </section>
      )}

      {/* Call to action — shown if little/no ROI data */}
      {noRoiData && (
        <Card>
          <CardContent className="py-10 text-center">
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: '#10B98120' }}
            >
              <DollarSign size={24} style={{ color: '#10B981' }} />
            </div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Start Tracking Financial Impact
            </h3>
            <p
              className="mx-auto mt-2 max-w-md text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Add <strong>Impact Metrics</strong> (Step 1) and <strong>Results Metrics</strong>{' '}
              (Step 6) to your projects to see financial ROI, annual savings, and hours saved appear
              here.
            </p>
            <Link
              href="/projects"
              className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#10B981' }}
            >
              <PlusCircle size={16} />
              Go to Projects
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ROIDashboardPage
