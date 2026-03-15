'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import type { PipsStepNumber } from '@pips/shared'
import { hasPermission, type OrgRole } from '@pips/shared'
import { StepView } from '@/components/pips/step-view'
import { advanceStep, overrideStep } from '../../actions'

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
  )
}
