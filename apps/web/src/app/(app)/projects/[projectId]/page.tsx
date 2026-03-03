import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProjectOverviewClient } from './project-overview-client'
import { getProjectStats, getProjectMembers, getProjectActivity } from './overview-actions'
import { OverviewStats } from './overview-stats'
import { ActivityFeed } from './activity-feed'
import { MembersList } from './members-list'
import { Calendar, User } from 'lucide-react'

const STEP_LABELS: Record<number, string> = {
  1: 'Identify',
  2: 'Analyze',
  3: 'Generate',
  4: 'Select & Plan',
  5: 'Implement',
  6: 'Evaluate',
}

const ProjectDetailPage = async ({ params }: { params: Promise<{ projectId: string }> }) => {
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
      id, name, description, status, current_step,
      target_completion_date, created_at, owner_id,
      project_steps ( id, step_number, status, started_at, completed_at ),
      project_members ( id, user_id, role ),
      profiles!projects_owner_id_fkey ( display_name )
    `,
    )
    .eq('id', projectId)
    .single()

  if (!project) {
    notFound()
  }

  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const steps = (project.project_steps ?? []) as Array<{
    id: string
    step_number: number
    status: string
    started_at: string | null
    completed_at: string | null
  }>

  const [stats, members, activity] = await Promise.all([
    getProjectStats(projectId),
    getProjectMembers(projectId),
    getProjectActivity(projectId),
  ])

  const profilesRaw = project.profiles as unknown
  const ownerProfile = Array.isArray(profilesRaw)
    ? ((profilesRaw[0] as { display_name: string } | undefined) ?? null)
    : (profilesRaw as { display_name: string } | null)

  const currentStepLabel = STEP_LABELS[project.current_step ?? 1] ?? 'Unknown'

  return (
    <div className="space-y-6">
      <ProjectOverviewClient
        projectId={project.id}
        currentStep={project.current_step ?? 1}
        steps={steps.map((s) => ({
          step_number: s.step_number,
          status: s.status as 'not_started' | 'in_progress' | 'completed' | 'skipped',
        }))}
        orgRole={membership?.role ?? null}
      />

      <OverviewStats
        ticketsCreated={stats.ticketsCreated}
        ticketsCompleted={stats.ticketsCompleted}
        daysActive={stats.daysActive}
        stepsCompleted={
          steps.filter((s) => s.status === 'completed' || s.status === 'skipped').length
        }
      />

      {/* Project metadata */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MetaRow label="Current Step">
              <Badge variant="outline">{currentStepLabel}</Badge>
            </MetaRow>
            <MetaRow label="Created">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[var(--color-text-tertiary)]" />
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </MetaRow>
            <MetaRow label="Target Date">
              {project.target_completion_date
                ? new Date(project.target_completion_date).toLocaleDateString()
                : 'Not set'}
            </MetaRow>
            <MetaRow label="Owner">
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-[var(--color-text-tertiary)]" />
                {ownerProfile?.display_name ?? 'Unassigned'}
              </span>
            </MetaRow>
            {project.description && (
              <div className="pt-2 border-t border-[var(--color-border)]">
                <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1">
                  Description
                </p>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {project.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <MembersList members={members} />
      </div>

      <ActivityFeed activity={activity} />
    </div>
  )
}

const MetaRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-[var(--color-text-tertiary)]">{label}</span>
    <span className="text-[var(--color-text-primary)]">{children}</span>
  </div>
)

export default ProjectDetailPage
