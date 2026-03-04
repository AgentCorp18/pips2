import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { stepEnumToNumber } from '@pips/shared'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/pips/project-card'
import { Plus, FolderKanban } from 'lucide-react'
import { ExportProjectsButton } from '@/components/pips/export-projects-button'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Create and manage process improvement projects using the 6-step PIPS methodology.',
}

const ProjectsPage = async () => {
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

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Projects
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Manage your process improvement projects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportProjectsButton />
          <Button asChild className="gap-2">
            <Link href="/projects/new">
              <Plus size={16} />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-6 rounded-full" />

      {/* Project grid or empty state */}
      {projectList.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projectList.map((project) => {
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

            return (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.title as string}
                description={project.description}
                status={project.status ?? 'active'}
                currentStep={currentStepNum}
                ownerName={ownerProfile?.display_name || ownerProfile?.full_name || 'Unknown'}
                stepsCompleted={stepsCompleted}
                targetDate={project.target_end}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16">
    <div
      className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
      style={{ backgroundColor: 'var(--color-primary-subtle)' }}
    >
      <FolderKanban size={24} style={{ color: 'var(--color-primary)' }} />
    </div>
    <h3 className="mb-1 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
      No projects yet
    </h3>
    <p
      className="mb-6 max-w-sm text-center text-sm"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      Create your first PIPS project to start improving processes with the 6-step methodology.
    </p>
    <Button asChild className="gap-2">
      <Link href="/projects/new">
        <Plus size={16} />
        Create your first project
      </Link>
    </Button>
  </div>
)

export default ProjectsPage
