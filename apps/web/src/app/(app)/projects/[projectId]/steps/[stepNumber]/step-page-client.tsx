'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import type { PipsStepNumber } from '@pips/shared'
import { hasPermission, type OrgRole } from '@pips/shared'
import { Button } from '@/components/ui/button'
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

  const isCurrent = stepNumber === currentStep
  const canAdvance = isCurrent && stepStatus !== 'completed' && stepStatus !== 'skipped'
  const canOverride =
    isCurrent && orgRole !== null && hasPermission(orgRole as OrgRole, 'step.override')

  const handleAdvance = () => {
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
