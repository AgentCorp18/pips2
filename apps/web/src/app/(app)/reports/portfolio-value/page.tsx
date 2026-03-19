import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/reports/kpi-card'
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  BookOpen,
  Clock,
  Brain,
  Lightbulb,
  GraduationCap,
  BarChart2,
  ChevronRight,
} from 'lucide-react'
import { getPortfolioValue } from './actions'
import type { PortfolioProject } from './actions'
import { CsvExportButton } from '@/components/reports/csv-export-button'

export const metadata: Metadata = {
  title: 'Portfolio Value Report',
  description: 'Executive portfolio view showing aggregate impact of all PIPS work.',
}

/* ============================================================
   Filter / sort helpers (URL searchParam driven)
   ============================================================ */

type StatusFilter = 'all' | 'completed' | 'active'
type SortKey = 'date' | 'depth' | 'cycle_time'

const VALID_STATUS_FILTERS: StatusFilter[] = ['all', 'completed', 'active']
const VALID_SORT_KEYS: SortKey[] = ['date', 'depth', 'cycle_time']

const parseStatus = (raw: string | undefined): StatusFilter =>
  VALID_STATUS_FILTERS.includes(raw as StatusFilter) ? (raw as StatusFilter) : 'all'

const parseSortKey = (raw: string | undefined): SortKey =>
  VALID_SORT_KEYS.includes(raw as SortKey) ? (raw as SortKey) : 'date'

const filterProjects = (projects: PortfolioProject[], status: StatusFilter): PortfolioProject[] => {
  if (status === 'all') return projects
  if (status === 'completed') return projects.filter((p) => p.status === 'completed')
  return projects.filter((p) => p.status === 'active' || p.status === 'draft')
}

const sortProjects = (projects: PortfolioProject[], sort: SortKey): PortfolioProject[] => {
  const copy = [...projects]
  if (sort === 'depth') {
    return copy.sort((a, b) => b.methodologyDepthPercent - a.methodologyDepthPercent)
  }
  if (sort === 'cycle_time') {
    return copy.sort((a, b) => {
      if (a.cycleTimeDays === null && b.cycleTimeDays === null) return 0
      if (a.cycleTimeDays === null) return 1
      if (b.cycleTimeDays === null) return -1
      return a.cycleTimeDays - b.cycleTimeDays
    })
  }
  // date: completed first (already server-sorted), then by createdAt desc
  return copy.sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return -1
    if (b.status === 'completed' && a.status !== 'completed') return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

/* ============================================================
   Sub-components
   ============================================================ */

const PROJECT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Completed', color: '#22C55E', bg: '#22C55E18' },
  active: { label: 'Active', color: '#3B82F6', bg: '#3B82F618' },
  draft: { label: 'Draft', color: '#F59E0B', bg: '#F59E0B18' },
}

const depthColor = (pct: number): { color: string; bg: string } => {
  if (pct >= 70) return { color: '#22C55E', bg: '#22C55E18' }
  if (pct >= 40) return { color: '#F59E0B', bg: '#F59E0B18' }
  return { color: '#6366F1', bg: '#6366F118' }
}

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

const ProjectCard = ({ project }: { project: PortfolioProject }) => {
  const statusConfig = PROJECT_STATUS_CONFIG[project.status] ?? PROJECT_STATUS_CONFIG.draft!
  const depth = depthColor(project.methodologyDepthPercent)

  const formattedDate = project.completedAt
    ? new Date(project.completedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(project.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/projects/${project.id}`}
            className="group flex items-center gap-1.5 text-base font-semibold leading-tight hover:underline"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {project.title}
            <ChevronRight
              size={14}
              className="mt-0.5 opacity-0 transition-opacity group-hover:opacity-100"
              style={{ color: 'var(--color-text-tertiary)' }}
            />
          </Link>
          <span
            className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ color: statusConfig.color, backgroundColor: statusConfig.bg }}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Date */}
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {project.status === 'completed' ? 'Completed' : 'Started'} {formattedDate}
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Metric row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Methodology depth */}
          <div
            className="flex flex-col items-center rounded-[var(--radius-md)] px-2 py-2"
            style={{ backgroundColor: depth.bg }}
          >
            <span className="text-lg font-bold" style={{ color: depth.color }}>
              {project.methodologyDepthPercent}%
            </span>
            <span
              className="mt-0.5 text-center text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Depth
            </span>
          </div>

          {/* Cycle time */}
          <div
            className="flex flex-col items-center rounded-[var(--radius-md)] px-2 py-2"
            style={{ backgroundColor: 'var(--color-surface-secondary)' }}
          >
            <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {project.cycleTimeDays !== null ? `${project.cycleTimeDays}d` : '--'}
            </span>
            <span
              className="mt-0.5 text-center text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Cycle
            </span>
          </div>

          {/* Forms */}
          <div
            className="flex flex-col items-center rounded-[var(--radius-md)] px-2 py-2"
            style={{ backgroundColor: 'var(--color-surface-secondary)' }}
          >
            <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {project.formsCompleted}/25
            </span>
            <span
              className="mt-0.5 text-center text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Forms
            </span>
          </div>
        </div>

        {/* Secondary stats */}
        <div
          className="flex flex-wrap gap-x-4 gap-y-1 text-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <span>
            {project.ticketsCompleted}/{project.ticketCount} tickets
          </span>
          {project.rootCausesCount > 0 && <span>{project.rootCausesCount} root causes</span>}
          {project.ideasGenerated > 0 && <span>{project.ideasGenerated} ideas</span>}
          {project.lessonsCount > 0 && <span>{project.lessonsCount} lessons</span>}
        </div>

        {/* Tools used */}
        {project.toolsUsed.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.toolsUsed.slice(0, 5).map((tool) => (
              <Badge key={tool} variant="secondary" className="text-xs">
                {tool}
              </Badge>
            ))}
            {project.toolsUsed.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{project.toolsUsed.length - 5} more
              </Badge>
            )}
          </div>
        )}

        {/* Narrative */}
        {project.narrative && (
          <p
            className="line-clamp-3 text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {project.narrative}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/* ============================================================
   Page
   ============================================================ */

type PortfolioValuePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const PortfolioValuePage = async ({ searchParams }: PortfolioValuePageProps) => {
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
  const statusFilter = parseStatus(typeof params.status === 'string' ? params.status : undefined)
  const sortKey = parseSortKey(typeof params.sort === 'string' ? params.sort : undefined)

  const summary = await getPortfolioValue(currentOrg.orgId)

  const visibleProjects = sortProjects(filterProjects(summary.projects, statusFilter), sortKey)

  const buildUrl = (overrides: Record<string, string>) => {
    const next: Record<string, string> = {
      status: statusFilter,
      sort: sortKey,
      ...overrides,
    }
    const qs = Object.entries(next)
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    return `/reports/portfolio-value?${qs}`
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
              data-testid="portfolio-value-heading"
            >
              Portfolio Value Report
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Executive view of all PIPS projects — methodology depth, cycle times, and aggregate
              impact.
            </p>
          </div>
          <CsvExportButton
            data={summary.projects.map((p) => ({
              title: p.title,
              status: p.status,
              completedAt: p.completedAt ?? '',
              methodologyDepth: `${p.methodologyDepthPercent}%`,
              cycleTimeDays: p.cycleTimeDays ?? '',
              formsCompleted: p.formsCompleted,
              ticketsCompleted: `${p.ticketsCompleted}/${p.ticketCount}`,
              rootCauses: p.rootCausesCount,
              ideasGenerated: p.ideasGenerated,
              lessons: p.lessonsCount,
              narrative: p.narrative ?? '',
            }))}
            filename="portfolio-value"
            columns={[
              { key: 'title', label: 'Project' },
              { key: 'status', label: 'Status' },
              { key: 'completedAt', label: 'Completed At' },
              { key: 'methodologyDepth', label: 'Methodology Depth' },
              { key: 'cycleTimeDays', label: 'Cycle Time (Days)' },
              { key: 'formsCompleted', label: 'Forms Completed' },
              { key: 'ticketsCompleted', label: 'Tickets (Done/Total)' },
              { key: 'rootCauses', label: 'Root Causes' },
              { key: 'ideasGenerated', label: 'Ideas Generated' },
              { key: 'lessons', label: 'Lessons Documented' },
              { key: 'narrative', label: 'Narrative' },
            ]}
          />
        </div>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* Summary KPI strip */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Total Projects"
          value={summary.totalProjects}
          icon={Briefcase}
          color="#4F46E5"
        />
        <KpiCard
          title="Tickets Resolved"
          value={summary.totalTicketsResolved}
          icon={CheckCircle2}
          color="#22C55E"
        />
        <KpiCard
          title="Forms Completed"
          value={summary.totalFormsCompleted}
          icon={BookOpen}
          color="#3B82F6"
        />
        <KpiCard
          title="Avg Depth"
          value={`${summary.avgMethodologyDepth}%`}
          icon={BarChart2}
          color="#6366F1"
          subtitle="methodology depth"
        />
        <KpiCard
          title="Avg Cycle Time"
          value={summary.avgCycleTimeDays !== null ? `${summary.avgCycleTimeDays}d` : '--'}
          icon={Clock}
          color="#F59E0B"
          subtitle={
            summary.avgCycleTimeDays !== null ? 'days per project' : 'No completed projects'
          }
        />
        <KpiCard
          title="Root Causes Found"
          value={summary.totalRootCauses}
          icon={Brain}
          color="#0891B2"
        />
      </div>

      {/* Secondary aggregate stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <KpiCard
          title="Ideas Generated"
          value={summary.totalIdeasGenerated}
          icon={Lightbulb}
          color="#F59E0B"
          subtitle="across all brainstorming sessions"
        />
        <KpiCard
          title="Lessons Documented"
          value={summary.totalLessonsDocumented}
          icon={GraduationCap}
          color="#10B981"
          subtitle="captured in retrospectives"
        />
      </div>

      {/* Filter + Sort controls */}
      <div className="mb-6 flex flex-wrap items-center gap-6">
        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
            Status:
          </span>
          <div className="flex gap-1">
            <FilterLink href={buildUrl({ status: 'all' })} active={statusFilter === 'all'}>
              All
            </FilterLink>
            <FilterLink
              href={buildUrl({ status: 'completed' })}
              active={statusFilter === 'completed'}
            >
              Completed
            </FilterLink>
            <FilterLink href={buildUrl({ status: 'active' })} active={statusFilter === 'active'}>
              Active
            </FilterLink>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
            Sort:
          </span>
          <div className="flex gap-1">
            <FilterLink href={buildUrl({ sort: 'date' })} active={sortKey === 'date'}>
              Date
            </FilterLink>
            <FilterLink href={buildUrl({ sort: 'depth' })} active={sortKey === 'depth'}>
              Depth
            </FilterLink>
            <FilterLink href={buildUrl({ sort: 'cycle_time' })} active={sortKey === 'cycle_time'}>
              Cycle Time
            </FilterLink>
          </div>
        </div>

        {/* Count */}
        <span className="ml-auto text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          {visibleProjects.length} project{visibleProjects.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Project cards */}
      {visibleProjects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              No projects match the selected filter.
            </p>
            <Link
              href={buildUrl({ status: 'all' })}
              className="mt-2 inline-block text-sm font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              Show all projects
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

export default PortfolioValuePage
