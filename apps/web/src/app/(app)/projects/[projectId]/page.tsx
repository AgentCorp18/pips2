import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { stepEnumToNumber, PIPS_STEPS } from '@pips/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProjectOverviewClient } from './project-overview-client'
import {
  getProjectStats,
  getProjectMembers,
  getProjectActivity,
  getStepSummaries,
  getProjectProgress,
  getProjectValueNarrative,
} from './overview-actions'
import { ProjectValueCard } from '@/components/pips/project-value-card'
import { OverviewStats } from './overview-stats'
import { ActivityFeed } from './activity-feed'
import { MembersList } from './members-list'
import { ExportPDFButton } from '@/components/export-pdf-button'
import { ExportOnePagerButton } from '@/components/pips/export-one-pager-button'
import { Button } from '@/components/ui/button'
import { StepSummaryCard } from '@/components/pips/step-summary-card'
import { Calendar, User, BarChart3, ClipboardList } from 'lucide-react'
import { StartHereCard } from '@/components/pips/start-here-card'
import { formatDateTime, formatDateOnly } from '@/lib/format-date'

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

  // Get user's active org (respects org switcher cookie)
  const currentOrg = await getCurrentOrg(supabase, user.id)

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

  const [stats, members, activity, stepSummaries, progress, valueNarrative] = await Promise.all([
    getProjectStats(projectId),
    getProjectMembers(projectId),
    getProjectActivity(projectId),
    getStepSummaries(projectId),
    getProjectProgress(projectId),
    getProjectValueNarrative(projectId),
  ])

  const profilesRaw = project.profiles as unknown
  const ownerProfile = Array.isArray(profilesRaw)
    ? ((profilesRaw[0] as { full_name: string; display_name: string | null } | undefined) ?? null)
    : (profilesRaw as { full_name: string; display_name: string | null } | null)

  const currentStepNum = stepEnumToNumber((project.current_step as string) ?? 'identify')
  const currentStepDef = PIPS_STEPS.find((s) => s.number === currentStepNum)
  const currentStepLabel = currentStepDef?.name ?? 'Unknown'

  return (
    <div className="mx-auto max-w-[var(--content-max-width)] space-y-6">
      <ProjectOverviewClient
        projectId={project.id}
        currentStep={currentStepNum}
        steps={steps.map((s) => {
          const fc = progress.stepFormCounts.find((c) => c.stepNumber === s.step_number)
          return {
            step_number: s.step_number,
            status: s.status as 'not_started' | 'in_progress' | 'completed' | 'skipped',
            formsStarted: fc?.formsStarted,
            formsTotal: fc?.formsTotal,
          }
        })}
        orgRole={currentOrg?.role ?? null}
      />

      {/* 1.4: Project Progress Bar */}
      <ProjectProgressBar
        percentage={progress.percentage}
        stepsCompleted={progress.stepsCompleted}
        formsStarted={progress.formsStarted}
        totalForms={progress.totalForms}
      />

      {/* 1.5: Start Here Card — only for new projects at Step 1 with no forms */}
      {currentStepNum === 1 && progress.formsStarted === 0 && (
        <StartHereCard projectId={projectId} />
      )}

      {/* Phase 0B: Value Narrative — below header, above step list, only when forms exist */}
      {valueNarrative !== null && <ProjectValueCard data={valueNarrative} />}

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-2"
          data-testid="view-summary-button"
        >
          <Link href={`/projects/${project.id}/summary`}>
            <ClipboardList size={14} />
            View Summary
          </Link>
        </Button>
        <ExportOnePagerButton projectId={project.id} projectName={project.title as string} />
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

      {/* Step Progress & Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 size={16} className="text-[var(--color-text-tertiary)]" />
            Step Progress & Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="step-summaries-grid"
          >
            {PIPS_STEPS.map((pipStep) => {
              const stepData = steps.find((s) => s.step_number === pipStep.number)
              const status = (stepData?.status ?? 'not_started') as
                | 'not_started'
                | 'in_progress'
                | 'completed'
                | 'skipped'
              const summary = stepSummaries[pipStep.number]
              return (
                <StepSummaryCard
                  key={pipStep.number}
                  projectId={projectId}
                  stepNumber={pipStep.number}
                  stepName={pipStep.name}
                  stepColor={pipStep.color}
                  status={status}
                  completedAt={stepData?.completed_at}
                  highlights={summary?.highlights ?? []}
                />
              )
            })}
          </div>
        </CardContent>
      </Card>

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
                {formatDateTime(project.created_at)}
              </span>
            </MetaRow>
            <MetaRow label="Target Date">
              {project.target_end ? formatDateOnly(project.target_end as string) : 'Not set'}
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

/** 1.4: Visual progress bar with percentage */
const ProjectProgressBar = ({
  percentage,
  stepsCompleted,
  formsStarted,
  totalForms,
}: {
  percentage: number
  stepsCompleted: number
  formsStarted: number
  totalForms: number
}) => (
  <Card data-testid="project-progress-bar">
    <CardContent className="py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          Project Progress
        </span>
        <span className="text-sm font-bold text-[var(--color-primary)]">{percentage}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-[var(--color-surface-secondary)]">
        <div
          className="h-2.5 rounded-full bg-[var(--color-primary)] transition-all duration-500"
          style={{ width: `${percentage}%` }}
          data-testid="progress-bar-fill"
        />
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
        <span>{stepsCompleted} of 6 steps completed</span>
        <span>
          {formsStarted} of {totalForms} forms started
        </span>
      </div>
    </CardContent>
  </Card>
)

export default ProjectDetailPage
