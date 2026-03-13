import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { stepEnumToNumber } from '@pips/shared'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/pips/project-card'
import { ProjectListTable } from '@/components/pips/project-list-table'
import type { ProjectRow } from '@/components/pips/project-list-table'
import { ProjectBoard } from '@/components/pips/project-board'
import type { BoardProject } from '@/components/pips/project-board'
import { ViewToggle } from '@/components/tickets/view-toggle'
import type { ViewMode } from '@/components/tickets/view-toggle'
import { Plus, FolderKanban, Sparkles, Columns3, Rows3 } from 'lucide-react'
import { ExportProjectsButton } from '@/components/pips/export-projects-button'
import { QuickCreateFab } from '@/components/ui/quick-create-fab'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Create and manage process improvement projects using the 6-step PIPS methodology.',
}

type ProjectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const ProjectsPage = async ({ searchParams }: ProjectsPageProps) => {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's org
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership) {
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
      owner_id,
      profiles!projects_owner_id_fkey ( full_name, display_name ),
      project_steps ( step, status )
    `,
    )
    .eq('org_id', membership.org_id)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  const projectList = projects ?? []

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
    }
  })

  // Build typed arrays for table and board views
  const projectRows: ProjectRow[] = transformedProjects
  const boardProjects: BoardProject[] = transformedProjects

  return (
    <div
      className={`mx-auto ${view === 'board' ? 'max-w-full px-4' : 'max-w-[var(--content-max-width)]'}`}
    >
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
          <Button asChild className="gap-2" data-testid="new-project-button">
            <Link href="/projects/new" data-testid="new-project-link">
              <Plus size={16} />
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {transformedProjects.map((project) => (
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
              />
            ))}
          </div>
        )
      ) : (
        <EmptyState />
      )}

      <QuickCreateFab />
    </div>
  )
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16">
    <div
      className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
      style={{ backgroundColor: 'var(--color-primary-subtle)' }}
    >
      <FolderKanban size={36} style={{ color: 'var(--color-primary)' }} />
    </div>
    <h3
      className="mb-2 text-xl font-semibold"
      style={{ color: 'var(--color-text-primary)' }}
      data-testid="projects-empty-title"
    >
      Start your first improvement project
    </h3>
    <p
      className="mb-2 max-w-md text-center text-sm"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      PIPS walks you through a proven 6-step methodology to identify, analyze, and solve process
      problems.
    </p>
    <p
      className="mb-8 max-w-sm text-center text-xs"
      style={{ color: 'var(--color-text-tertiary)' }}
    >
      It only takes a minute to get started — just give your project a name and description.
    </p>
    <div className="flex items-center gap-3">
      <Button asChild className="gap-2" data-testid="empty-create-project-button">
        <Link href="/projects/new">
          <Plus size={16} />
          Create Your First Project
        </Link>
      </Button>
      <Button asChild variant="outline" className="gap-2" data-testid="empty-sample-project-link">
        <Link href="/dashboard">
          <Sparkles size={16} />
          Create a sample project
        </Link>
      </Button>
    </div>
  </div>
)

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
      <Columns3 size={13} />
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
      <Rows3 size={13} />
      By Step
    </Link>
  </div>
)

export default ProjectsPage
