import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { stepEnumToNumber, PIPS_STEPS } from '@pips/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProjectOverviewClient } from './project-overview-client'
import { getProjectStats, getProjectMembers, getProjectActivity } from './overview-actions'
import { OverviewStats } from './overview-stats'
import { ActivityFeed } from './activity-feed'
import { MembersList } from './members-list'
import { ExportPDFButton } from '@/components/export-pdf-button'
import { Calendar, User } from 'lucide-react'

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
      id, title, description, status, current_step,
      target_end, created_at, owner_id,
      project_steps ( id, step, status, started_at, completed_at ),
      project_members ( id, user_id, role ),
      profiles!projects_owner_id_fkey ( full_name, display_name )
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
    .maybeSingle()

  const stepsRaw = (project.project_steps ?? []) as Array<{
    id: string
    step: string
    status: string
    started_at: string | null
    completed_at: string | null
  }>
  const steps = stepsRaw.map((s) => ({
    ...s,
    step_number: stepEnumToNumber(s.step),
  }))

  const [stats, members, activity] = await Promise.all([
    getProjectStats(projectId),
    getProjectMembers(projectId),
    getProjectActivity(projectId),
  ])

  const profilesRaw = project.profiles as unknown
  const ownerProfile = Array.isArray(profilesRaw)
    ? ((profilesRaw[0] as { full_name: string; display_name: string | null } | undefined) ?? null)
    : (profilesRaw as { full_name: string; display_name: string | null } | null)

  const currentStepNum = stepEnumToNumber((project.current_step as string) ?? 'identify')
  const currentStepDef = PIPS_STEPS.find((s) => s.number === currentStepNum)
  const currentStepLabel = currentStepDef?.name ?? 'Unknown'

  return (
    <div className="space-y-6">
      <ProjectOverviewClient
        projectId={project.id}
        currentStep={currentStepNum}
        steps={steps.map((s) => ({
          step_number: s.step_number,
          status: s.status as 'not_started' | 'in_progress' | 'completed' | 'skipped',
        }))}
        orgRole={membership?.role ?? null}
      />

      <div className="flex items-center justify-end">
        <ExportPDFButton projectId={project.id} projectName={project.title as string} />
      </div>

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
              {project.target_end
                ? new Date(project.target_end as string).toLocaleDateString()
                : 'Not set'}
            </MetaRow>
            <MetaRow label="Owner">
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-[var(--color-text-tertiary)]" />
                {ownerProfile?.display_name || ownerProfile?.full_name || 'Unassigned'}
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
