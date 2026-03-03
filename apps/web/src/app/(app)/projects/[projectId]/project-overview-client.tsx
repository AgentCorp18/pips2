'use client'

import { useRouter } from 'next/navigation'
import { StepStepper, type StepData } from '@/components/pips/step-stepper'

type ProjectOverviewClientProps = {
  projectId: string
  currentStep: number
  steps: StepData[]
  orgRole: string | null
}

export const ProjectOverviewClient = ({
  projectId,
  currentStep,
  steps,
  orgRole: _orgRole,
}: ProjectOverviewClientProps) => {
  const router = useRouter()

  const handleStepClick = (stepNumber: number) => {
    router.push(`/projects/${projectId}/steps/${stepNumber}`)
  }

  return <StepStepper steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />
}
