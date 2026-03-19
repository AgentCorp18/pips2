import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { stepEnumToNumber, PIPS_STEPS } from '@pips/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExportOnePagerButton } from '@/components/pips/export-one-pager-button'
import { getStepSummaries, getProjectStats, getProjectMembers } from '../overview-actions'
import { formatDateOnly } from '@/lib/format-date'

type SummaryPageProps = {
  params: Promise<{ projectId: string }>
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On Hold',
  archived: 'Archived',
}

const STEP_STATUS_ICON: Record<string, typeof CheckCircle> = {
  completed: CheckCircle,
  in_progress: Clock,
  not_started: AlertTriangle,
}

const ProjectSummaryPage = async ({ params }: SummaryPageProps) => {
  const { projectId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const currentOrg = await getCurrentOrg(supabase, user.id)
  if (!currentOrg) redirect('/onboarding')

  // Fetch project with steps
  const { data: project } = await supabase
    .from('projects')
    .select(
      `
      id, title, description, status, current_step,
      target_end, created_at, completed_at,
      project_steps ( step, status, started_at, completed_at ),
      profiles!projects_owner_id_fkey ( full_name, display_name )
    `,
    )
    .eq('id', projectId)
    .eq('org_id', currentOrg.orgId)
    .single()

  if (!project) notFound()

  // Fetch all summary data in parallel
  const [stepSummaries, stats, members] = await Promise.all([
    getStepSummaries(projectId),
    getProjectStats(projectId),
    getProjectMembers(projectId),
  ])

  const stepsRaw = (project.project_steps ?? []) as Array<{
    step: string
    status: string
    started_at: string | null
    completed_at: string | null
  }>

  const owner = project.profiles as unknown as {
    full_name: string
    display_name: string | null
  } | null
  const ownerName = owner?.display_name ?? owner?.full_name ?? 'Unknown'

  const currentStepNum = stepEnumToNumber(project.current_step as string) ?? 1

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]" data-testid="project-summary-page">
      {/* Back link */}
      <Link
        href={`/projects/${projectId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <ArrowLeft size={16} />
        Back to Project
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
            data-testid="summary-heading"
          >
            Project Summary
          </h1>
          <p
            className="mt-1 text-lg"
            style={{ color: 'var(--color-text-secondary)' }}
            data-testid="summary-project-title"
          >
            {project.title}
          </p>
        </div>
        <ExportOnePagerButton projectId={projectId} projectName={project.title as string} />
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-6 rounded-full" />

      {/* Project metadata */}
      <Card className="mb-6" data-testid="summary-metadata">
        <CardContent className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {STATUS_LABELS[project.status as string] ?? project.status}
            </Badge>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Step {currentStepNum}: {PIPS_STEPS[currentStepNum - 1]?.name ?? 'Unknown'}
            </span>
          </div>
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Calendar size={14} aria-hidden="true" />
            <span>Created {formatDateOnly(project.created_at as string)}</span>
            {project.target_end && (
              <span> &middot; Target {formatDateOnly(project.target_end as string)}</span>
            )}
          </div>
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Users size={14} aria-hidden="true" />
            <span>Owner: {ownerName}</span>
            {members.length > 0 && (
              <span>
                &middot; {members.length} member{members.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <BarChart3 size={14} aria-hidden="true" />
            <span>
              {stats.ticketsCreated} tickets ({stats.ticketsCompleted} done) &middot;{' '}
              {stats.daysActive}d active
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {project.description && (
        <Card className="mb-6" data-testid="summary-description">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-sm whitespace-pre-wrap"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {project.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step-by-step summaries */}
      <div className="space-y-4" data-testid="summary-steps">
        {PIPS_STEPS.map((step, idx) => {
          const stepNum = idx + 1
          const stepData = stepsRaw.find((s) => stepEnumToNumber(s.step as string) === stepNum)
          const status = stepData?.status ?? 'not_started'
          const summary = stepSummaries[stepNum]
          const StepIcon = STEP_STATUS_ICON[status] ?? AlertTriangle

          return (
            <Card
              key={stepNum}
              data-testid={`summary-step-${stepNum}`}
              className={status === 'not_started' ? 'opacity-60' : ''}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {stepNum}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{step.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StepIcon
                      size={14}
                      style={{
                        color:
                          status === 'completed'
                            ? '#22C55E'
                            : status === 'in_progress'
                              ? '#3B82F6'
                              : 'var(--color-text-tertiary)',
                      }}
                      aria-hidden="true"
                    />
                    <Badge
                      variant="outline"
                      className="text-xs"
                      data-testid={`summary-step-${stepNum}-status`}
                    >
                      {status === 'completed'
                        ? 'Completed'
                        : status === 'in_progress'
                          ? 'In Progress'
                          : 'Not Started'}
                    </Badge>
                    {stepData?.completed_at && (
                      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {formatDateOnly(stepData.completed_at)}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {summary && summary.highlights.length > 0 ? (
                  <dl className="grid gap-2 sm:grid-cols-2">
                    {summary.highlights.map((h, hIdx) => (
                      <div
                        key={hIdx}
                        className="rounded-[var(--radius-md)] bg-[var(--color-surface-secondary)] p-3"
                      >
                        <dt
                          className="text-xs font-medium"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          {h.label}
                        </dt>
                        <dd
                          className="mt-0.5 text-sm"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {h.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    {status === 'not_started'
                      ? 'This step has not been started yet.'
                      : 'No form data captured for this step yet.'}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Team members */}
      {members.length > 0 && (
        <Card className="mt-6" data-testid="summary-team">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {members.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1.5"
                >
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium text-white"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {m.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {m.displayName}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {m.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ProjectSummaryPage
