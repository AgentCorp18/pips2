import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { ProjectTabs } from '@/components/pips/project-tabs'
import { ArrowLeft } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
}

const ProjectLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}) => {
  const { projectId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: project } = await supabase
    .from('projects')
    .select(
      `
      id,
      title,
      status,
      current_step,
      owner_id,
      profiles!projects_owner_id_fkey ( display_name )
    `,
    )
    .eq('id', projectId)
    .single()

  if (!project) {
    notFound()
  }

  const profilesRaw = project.profiles as unknown
  const ownerProfile = Array.isArray(profilesRaw)
    ? ((profilesRaw[0] as { display_name: string } | undefined) ?? null)
    : (profilesRaw as { display_name: string } | null)
  const statusLabel = STATUS_LABELS[project.status ?? 'active'] ?? 'Active'

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Project header */}
      <div className="mb-6">
        <Link
          href="/projects"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={14} />
          Back to Projects
        </Link>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {project.title}
          </h1>
          <Badge variant="outline">{statusLabel}</Badge>
        </div>

        {ownerProfile && (
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Owned by {ownerProfile.display_name}
          </p>
        )}
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-6 rounded-full" />

      {/* Tab navigation */}
      <div className="mb-6">
        <ProjectTabs projectId={projectId} />
      </div>

      {/* Page content */}
      {children}
    </div>
  )
}

export default ProjectLayout
