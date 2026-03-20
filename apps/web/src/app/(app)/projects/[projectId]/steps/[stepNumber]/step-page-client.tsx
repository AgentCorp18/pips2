'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import type { PipsStepNumber } from '@pips/shared'
import { hasPermission, type OrgRole, STEP_CONTENT } from '@pips/shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StepView } from '@/components/pips/step-view'
import { advanceStep, overrideStep } from '../../actions'

const STEP_NAMES: Record<number, string> = {
  1: 'Identify',
  2: 'Analyze',
  3: 'Generate',
  4: 'Select & Plan',
  5: 'Implement',
  6: 'Evaluate',
}

const ADVANCE_THRESHOLD = 60

const RECOMMENDED_FORMS: Record<number, Set<string>> = {
  1: new Set(['problem_statement']),
  2: new Set(['fishbone', 'five_why']),
  3: new Set(['brainstorming']),
  4: new Set(['criteria_matrix', 'implementation_plan']),
  5: new Set(['milestone_tracker']),
  6: new Set(['before_after', 'lessons_learned']),
}

type StepPageClientProps = {
  projectId: string
  stepNumber: PipsStepNumber
  stepStatus: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  currentStep: number
  formStatuses: Array<{ form_type: string; started: boolean }>
  orgRole: string | null
}

export const StepPageClient = ({
  projectId,
  stepNumber,
  stepStatus,
  currentStep,
  formStatuses,
  orgRole,
}: StepPageClientProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false)

  const isCurrent = stepNumber === currentStep
  const canAdvance = isCurrent && stepStatus !== 'completed' && stepStatus !== 'skipped'
  const canOverride =
    isCurrent && orgRole !== null && hasPermission(orgRole as OrgRole, 'step.override')

  // Compute recommended completion % for the threshold dialog
  const recommendedFormTypes = RECOMMENDED_FORMS[stepNumber] ?? new Set<string>()
  const recommendedCount = recommendedFormTypes.size
  const stepContent = STEP_CONTENT[stepNumber as PipsStepNumber]
  const recommendedCompletedCount = formStatuses.filter(
    (fs) => fs.started && recommendedFormTypes.has(fs.form_type),
  ).length
  const recommendedPercent =
    recommendedCount > 0 ? Math.round((recommendedCompletedCount / recommendedCount) * 100) : 100

  const doAdvance = () => {
    startTransition(async () => {
      const result = await advanceStep(projectId, stepNumber)
      if (result.success) {
        toast.success('Step completed successfully')
        if (stepNumber < 6) {
          router.replace(`/projects/${projectId}/steps/${stepNumber + 1}`)
        } else {
          router.replace(`/projects/${projectId}`)
        }
      } else {
        toast.error(result.error ?? 'Failed to advance step')
      }
    })
  }

  const handleAdvance = () => {
    if (recommendedPercent < ADVANCE_THRESHOLD) {
      setShowAdvanceDialog(true)
    } else {
      doAdvance()
    }
  }

  const handleOverride = () => {
    startTransition(async () => {
      const result = await overrideStep(projectId, stepNumber)
      if (result.success) {
        toast.success('Step skipped')
        if (stepNumber < 6) {
          router.replace(`/projects/${projectId}/steps/${stepNumber + 1}`)
        } else {
          router.replace(`/projects/${projectId}`)
        }
      } else {
        toast.error(result.error ?? 'Failed to skip step')
      }
    })
  }

  return (
    <div className="space-y-6">
      <StepView
        projectId={projectId}
        stepNumber={stepNumber}
        status={stepStatus}
        formStatuses={formStatuses}
        canAdvance={canAdvance}
        canOverride={canOverride}
        onAdvance={handleAdvance}
        onOverride={handleOverride}
        isPending={isPending}
        currentProjectStep={currentStep as PipsStepNumber}
      />

      {/* Low-completion confirmation dialog */}
      <Dialog open={showAdvanceDialog} onOpenChange={setShowAdvanceDialog}>
        <DialogContent data-testid="advance-confirmation-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-[var(--color-warning)]" />
              Advance with incomplete forms?
            </DialogTitle>
            <DialogDescription>
              You&apos;ve completed{' '}
              <strong>
                {recommendedCompletedCount} of {recommendedCount} recommended forms
              </strong>{' '}
              ({recommendedPercent}%) for Step {stepNumber}: {stepContent?.title}.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Advancing early may result in shallow analysis. We recommend completing at least{' '}
            {ADVANCE_THRESHOLD}% of the recommended forms before advancing.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAdvanceDialog(false)}
              disabled={isPending}
              data-testid="advance-dialog-keep-working"
            >
              Keep Working
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setShowAdvanceDialog(false)
                doAdvance()
              }}
              disabled={isPending}
              data-testid="advance-dialog-advance-anyway"
            >
              Advance Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Previous / Next step navigation */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
        {stepNumber > 1 ? (
          <Button variant="outline" asChild data-testid="prev-step-nav">
            <Link href={`/projects/${projectId}/steps/${stepNumber - 1}`}>
              <ChevronLeft size={16} />
              Step {stepNumber - 1}: {STEP_NAMES[stepNumber - 1]}
            </Link>
          </Button>
        ) : (
          <div />
        )}
        {stepNumber < 6 ? (
          <Button variant="outline" asChild data-testid="next-step-nav">
            <Link href={`/projects/${projectId}/steps/${stepNumber + 1}`}>
              Step {stepNumber + 1}: {STEP_NAMES[stepNumber + 1]}
              <ChevronRight size={16} />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
