import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { stepEnumToNumber, calculateProjectHealth } from '@pips/shared'
import type { HealthScore } from '@pips/shared'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/pips/project-card'
import { ProjectListTable } from '@/components/pips/project-list-table'
import type { ProjectRow } from '@/components/pips/project-list-table'
import { ProjectBoard } from '@/components/pips/project-board'
import type { BoardProject } from '@/components/pips/project-board'
import { ViewToggle } from '@/components/tickets/view-toggle'
import type { ViewMode } from '@/components/tickets/view-toggle'
import { Plus, Columns3, Rows3, LayoutTemplate } from 'lucide-react'
import { ExportProjectsButton } from '@/components/pips/export-projects-button'
import { QuickCreateFab } from '@/components/ui/quick-create-fab'
import { ProjectsEmptyState } from '@/components/pips/projects-empty-state'
import { ProjectsFilterBar } from '@/components/pips/projects-filter-bar'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Create and manage process improvement projects using the 6-step PIPS methodology.',
}

type ProjectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const TOTAL_FORM_TYPES = 25

const ProjectsPage = async ({ searchParams }: ProjectsPageProps) => {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's active org (respects org switcher cookie)
  const currentOrg = await getCurrentOrg(supabase, user.id)

  if (!currentOrg) {
    redirect('/onboarding')
  }

  // Fetch projects with owner profile and step data
  const { data: projects } = await supabase
    .from('projects')
    .select(
      `
      id,
      title,
      description,
      status,
      current_step,
      target_end,
      created_at,
      owner_id,
      project_type,
      profiles!projects_owner_id_fkey ( full_name, display_name ),
      project_steps ( step, status )
    `,
    )
    .eq('org_id', currentOrg.orgId)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  const projectList = projects ?? []

  // Batch fetch form and ticket data for all projects (health + depth badges)
  const projectIds = projectList.map((p) => p.id)

  const [allFormsRes, ticketCountsRes, ticketDoneCountsRes] = await Promise.all([
    projectIds.length > 0
      ? supabase
          .from('project_forms')
          .select('project_id, form_type, updated_at, data')
          .in('project_id', projectIds)
      : Promise.resolve({
          data: [] as Array<{
            project_id: string
            form_type: string
            updated_at: string
            data: Record<string, unknown> | null
          }>,
        }),
    projectIds.length > 0
      ? supabase
          .from('tickets')
          .select('project_id')
          .in('project_id', projectIds)
          .eq('org_id', currentOrg.orgId)
      : Promise.resolve({ data: [] as Array<{ project_id: string }> }),
    projectIds.length > 0
      ? supabase
          .from('tickets')
          .select('project_id')
          .in('project_id', projectIds)
          .eq('org_id', currentOrg.orgId)
          .eq('status', 'done')
      : Promise.resolve({ data: [] as Array<{ project_id: string }> }),
  ])

  // Build per-project maps from the batch results
  const formsByProject = new Map<string, Set<string>>()
  const latestFormActivityByProject = new Map<string, string>()

  for (const f of allFormsRes.data ?? []) {
    const data = f.data as Record<string, unknown> | null
    if (data && Object.keys(data).length > 0) {
      if (!formsByProject.has(f.project_id)) {
        formsByProject.set(f.project_id, new Set())
      }
      formsByProject.get(f.project_id)!.add(f.form_type)
    }
    // Track latest form activity date
    const existing = latestFormActivityByProject.get(f.project_id)
    if (!existing || f.updated_at > existing) {
      latestFormActivityByProject.set(f.project_id, f.updated_at)
    }
  }

  // Count tickets per project
  const ticketTotalByProject = new Map<string, number>()
  for (const t of ticketCountsRes.data ?? []) {
    ticketTotalByProject.set(t.project_id, (ticketTotalByProject.get(t.project_id) ?? 0) + 1)
  }
  const ticketDoneByProject = new Map<string, number>()
  for (const t of ticketDoneCountsRes.data ?? []) {
    ticketDoneByProject.set(t.project_id, (ticketDoneByProject.get(t.project_id) ?? 0) + 1)
  }

  // Calculate health scores per project
  const healthByProject = new Map<string, HealthScore>()
  // eslint-disable-next-line react-hooks/purity -- Date.now() is safe in async Server Components
  const now = Date.now()
  for (const project of projectList) {
    const formSet = formsByProject.get(project.id) ?? new Set<string>()
    const distinctForms = formSet.size
    const formsCompletedPercent = Math.round((distinctForms / TOTAL_FORM_TYPES) * 100)

    const totalTickets = ticketTotalByProject.get(project.id) ?? 0
    const doneTickets = ticketDoneByProject.get(project.id) ?? 0
    const ticketCompletionPercent =
      totalTickets > 0 ? Math.round((doneTickets / totalTickets) * 100) : 0

    const latestFormDate = latestFormActivityByProject.get(project.id)
    const activityTimestamps = [new Date(project.created_at).getTime()]
    if (latestFormDate) activityTimestamps.push(new Date(latestFormDate).getTime())
    const lastActivityMs = Math.max(...activityTimestamps)
    const daysSinceLastActivity = Math.floor((now - lastActivityMs) / (1000 * 60 * 60 * 24))

    healthByProject.set(
      project.id,
      calculateProjectHealth({
        methodologyDepthPercent: formsCompletedPercent,
        daysSinceLastActivity,
        ticketCompletionPercent,
        formsCompletedPercent,
      }),
    )
  }

  // View mode
  const viewParam = typeof params.view === 'string' ? params.view : 'cards'
  const view: ViewMode =
    viewParam === 'table'
      ? 'table'
      : viewParam === 'board'
        ? 'board'
        : viewParam === 'swimlanes'
          ? 'board'
          : 'cards'
  const boardLayout = viewParam === 'swimlanes' ? ('swimlanes' as const) : ('columns' as const)

  // Sort + filter params (cards view only)
  const sortParam = typeof params.sort === 'string' ? params.sort : ''
  const filterParam = typeof params.filter === 'string' ? params.filter : ''

  // Count at-risk projects for the filter badge (health < 40)
  const AT_RISK_THRESHOLD = 40
  const atRiskCount = projectList.filter(
    (p) => (healthByProject.get(p.id)?.score ?? 100) < AT_RISK_THRESHOLD,
  ).length

  // Transform projects for reuse across views
  const transformedProjects = projectList.map((project) => {
    const profilesRaw = project.profiles as unknown
    type OwnerProfile = { full_name: string; display_name: string | null }
    const ownerProfile = Array.isArray(profilesRaw)
      ? ((profilesRaw[0] as OwnerProfile | undefined) ?? null)
      : (profilesRaw as OwnerProfile | null)
    const stepsRaw = (project.project_steps ?? []) as Array<{
      step: string
      status: string
    }>
    const stepsCompleted = stepsRaw.filter(
      (s) => s.status === 'completed' || s.status === 'skipped',
    ).length
    const currentStepNum = stepEnumToNumber((project.current_step as string) ?? 'identify')

    return {
      id: project.id,
      name: project.title as string,
      description: project.description,
      status: project.status ?? 'active',
      currentStep: currentStepNum,
      ownerName: ownerProfile?.display_name || ownerProfile?.full_name || 'Unknown',
      stepsCompleted,
      targetDate: project.target_end,
      createdAt: project.created_at,
      projectType: (project.project_type ?? 'pips') as 'pips' | 'simple',
    }
  })

  // Apply health sort + at-risk filter to the card view
  let displayProjects = transformedProjects

  if (filterParam === 'at-risk') {
    displayProjects = displayProjects.filter(
      (p) => (healthByProject.get(p.id)?.score ?? 100) < AT_RISK_THRESHOLD,
    )
  }

  if (sortParam === 'health') {
    displayProjects = [...displayProjects].sort(
      (a, b) => (healthByProject.get(a.id)?.score ?? 0) - (healthByProject.get(b.id)?.score ?? 0),
    )
  }

  // Build typed arrays for table and board views
  const projectRows: ProjectRow[] = transformedProjects
  const boardProjects: BoardProject[] = transformedProjects

  return (
    <div className="mx-auto max-w-full px-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
            data-testid="projects-page-heading"
          >
            Projects
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
            data-testid="projects-description"
          >
            Manage your process improvement projects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportProjectsButton />
          <ViewToggle current={view} basePath="/projects" />
          <Button asChild variant="outline" className="gap-2" data-testid="browse-templates-button">
            <Link href="/projects/templates" data-testid="browse-templates-link">
              <LayoutTemplate size={16} aria-hidden="true" />
              Browse Templates
            </Link>
          </Button>
          <Button asChild className="gap-2" data-testid="new-project-button">
            <Link href="/projects/new" data-testid="new-project-link">
              <Plus size={16} aria-hidden="true" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-6 rounded-full" />

      {/* Content by view mode */}
      {projectList.length > 0 ? (
        view === 'board' ? (
          <div className="mt-4 max-w-full">
            <BoardLayoutToggle currentLayout={boardLayout} />
            <ProjectBoard projects={boardProjects} layout={boardLayout} />
          </div>
        ) : view === 'table' ? (
          <div className="mt-4">
            <ProjectListTable projects={projectRows} />
          </div>
        ) : (
          <>
            <ProjectsFilterBar
              currentSort={sortParam}
              currentFilter={filterParam}
              atRiskCount={atRiskCount}
            />
            {displayProjects.length === 0 && filterParam === 'at-risk' ? (
              <div
                className="rounded-xl border px-6 py-12 text-center"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  No at-risk projects
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  All projects have a health score of {AT_RISK_THRESHOLD} or above.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    name={project.name}
                    description={project.description}
                    status={project.status}
                    currentStep={project.currentStep}
                    ownerName={project.ownerName}
                    stepsCompleted={project.stepsCompleted}
                    targetDate={project.targetDate}
                    completedFormTypes={formsByProject.get(project.id) ?? new Set()}
                    health={healthByProject.get(project.id)}
                    projectType={project.projectType}
                  />
                ))}
              </div>
            )}
          </>
        )
      ) : (
        <ProjectsEmptyState />
      )}

      <QuickCreateFab />
    </div>
  )
}

const BoardLayoutToggle = ({ currentLayout }: { currentLayout: 'columns' | 'swimlanes' }) => (
  <div className="mb-3 flex items-center justify-end gap-1">
    <span className="mr-2 text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
      Layout:
    </span>
    <Link
      href="/projects?view=board"
      className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
        currentLayout === 'columns'
          ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
          : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
      }`}
    >
      <Columns3 size={13} aria-hidden="true" />
      Status
    </Link>
    <Link
      href="/projects?view=swimlanes"
      className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
        currentLayout === 'swimlanes'
          ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
          : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
      }`}
    >
      <Rows3 size={13} aria-hidden="true" />
      By Step
    </Link>
  </div>
)

export default ProjectsPage
