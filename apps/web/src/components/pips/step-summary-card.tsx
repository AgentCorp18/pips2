import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Circle } from 'lucide-react'
import type { StepHighlight } from '@/app/(app)/projects/[projectId]/overview-actions'

type StepStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped'

type StepSummaryCardProps = {
  stepNumber: number
  stepName: string
  stepColor: string
  status: StepStatus
  completedAt?: string | null
  highlights: StepHighlight[]
}

export const StepSummaryCard = ({
  stepNumber,
  stepName,
  stepColor,
  status,
  completedAt,
  highlights,
}: StepSummaryCardProps) => {
  const isCompleted = status === 'completed' || status === 'skipped'
  const isInProgress = status === 'in_progress'

  return (
    <Card data-testid={`step-summary-card-${stepNumber}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: stepColor }}
          >
            {stepNumber}
          </div>
          <div className="flex flex-1 items-center justify-between">
            <CardTitle className="text-sm font-semibold">{stepName}</CardTitle>
            <StatusIndicator status={status} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isCompleted && highlights.length > 0 && (
          <div className="space-y-2">
            {completedAt && (
              <p className="text-[10px] text-[var(--color-text-tertiary)]">
                Completed {new Date(completedAt).toLocaleDateString()}
              </p>
            )}
            <dl className="space-y-1.5">
              {highlights.map((h) => (
                <div key={h.label} className="flex flex-col gap-0.5" data-testid="step-highlight">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    {h.label}
                  </dt>
                  <dd className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {h.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {isCompleted && highlights.length === 0 && (
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Completed — no form data recorded
          </p>
        )}

        {isInProgress && highlights.length > 0 && (
          <div className="space-y-2">
            <dl className="space-y-1.5">
              {highlights.map((h) => (
                <div key={h.label} className="flex flex-col gap-0.5" data-testid="step-highlight">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    {h.label}
                  </dt>
                  <dd className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {h.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {isInProgress && highlights.length === 0 && (
          <p className="text-xs text-[var(--color-text-link)]">In progress</p>
        )}

        {!isCompleted && !isInProgress && (
          <p className="text-xs text-[var(--color-text-tertiary)]">Not yet started</p>
        )}
      </CardContent>
    </Card>
  )
}

const StatusIndicator = ({ status }: { status: StepStatus }) => {
  switch (status) {
    case 'completed':
      return (
        <Badge
          variant="outline"
          className="gap-1 text-[10px] text-[var(--color-success)] border-[var(--color-success)]"
        >
          <CheckCircle2 size={10} />
          Completed
        </Badge>
      )
    case 'skipped':
      return (
        <Badge
          variant="outline"
          className="gap-1 text-[10px] text-[var(--color-success)] border-[var(--color-success)]"
        >
          <CheckCircle2 size={10} />
          Skipped
        </Badge>
      )
    case 'in_progress':
      return (
        <Badge
          variant="outline"
          className="gap-1 text-[10px] text-[var(--color-step-4)] border-[var(--color-step-4)]"
        >
          <Clock size={10} />
          In Progress
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="gap-1 text-[10px]">
          <Circle size={10} />
          Not Started
        </Badge>
      )
  }
}
