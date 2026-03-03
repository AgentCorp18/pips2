import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectOverviewClient } from './project-overview-client'
import { Calendar, Users, Target } from 'lucide-react'

const ProjectDetailPage = async ({ params }: { params: Promise<{ projectId: string }> }) => {
  const { projectId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch project with steps
  const { data: project } = await supabase
    .from('projects')
    .select(
      `
      id,
      name,
      description,
      status,
      current_step,
      target_completion_date,
      created_at,
      project_steps ( id, step_number, status, started_at, completed_at ),
      project_members ( id, user_id, role )
    `,
    )
    .eq('id', projectId)
    .single()

  if (!project) {
    notFound()
  }

  // Get user's org role for permission checks
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

  const members = (project.project_members ?? []) as Array<{
    id: string
    user_id: string
    role: string
  }>

  const stepsCompleted = steps.filter(
    (s) => s.status === 'completed' || s.status === 'skipped',
  ).length

  return (
    <div className="space-y-6">
      {/* Stepper + navigation */}
      <ProjectOverviewClient
        projectId={project.id}
        currentStep={project.current_step ?? 1}
        steps={steps.map((s) => ({
          step_number: s.step_number,
          status: s.status as 'not_started' | 'in_progress' | 'completed' | 'skipped',
        }))}
        orgRole={membership?.role ?? null}
      />

      {/* Project info cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
              <Target size={16} />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {stepsCompleted} / 6
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">steps completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
              <Users size={16} />
              Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{members.length}</p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              {members.length === 1 ? 'member' : 'members'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
              <Calendar size={16} />
              Target Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {project.target_completion_date
                ? new Date(project.target_completion_date).toLocaleDateString()
                : '---'}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              {project.target_completion_date ? 'target completion' : 'no target set'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {project.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ProjectDetailPage
