'use client'

import { PIPS_STEPS } from '@pips/shared'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type StepStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped'

export type StepData = {
  step_number: number
  status: StepStatus
  /** Number of forms started for this step */
  formsStarted?: number
  /** Total forms available for this step */
  formsTotal?: number
}

type StepStepperProps = {
  steps: StepData[]
  currentStep: number
  onStepClick?: (stepNumber: number) => void
}

export const StepStepper = ({ steps, currentStep, onStepClick }: StepStepperProps) => {
  const getStepStatus = (stepNumber: number): StepStatus => {
    const step = steps.find((s) => s.step_number === stepNumber)
    return step?.status ?? 'not_started'
  }

  const isClickable = (stepNumber: number): boolean => {
    if (!onStepClick) return false
    const status = getStepStatus(stepNumber)
    return status === 'completed' || status === 'skipped' || stepNumber === currentStep
  }

  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden md:flex md:items-center md:gap-0">
        {PIPS_STEPS.map((pipStep, index) => {
          const status = getStepStatus(pipStep.number)
          const isCurrent = pipStep.number === currentStep
          const clickable = isClickable(pipStep.number)

          const stepData = steps.find((s) => s.step_number === pipStep.number)

          return (
            <div key={pipStep.number} className="flex flex-1 items-center">
              <StepItem
                number={pipStep.number}
                name={pipStep.name}
                description={pipStep.description}
                status={status}
                isCurrent={isCurrent}
                clickable={clickable}
                onClick={() => clickable && onStepClick?.(pipStep.number)}
                formsStarted={stepData?.formsStarted}
                formsTotal={stepData?.formsTotal}
              />
              {index < PIPS_STEPS.length - 1 && (
                <StepConnector completed={status === 'completed' || status === 'skipped'} />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex flex-col gap-2 md:hidden">
        {PIPS_STEPS.map((pipStep) => {
          const status = getStepStatus(pipStep.number)
          const isCurrent = pipStep.number === currentStep
          const clickable = isClickable(pipStep.number)

          return (
            <StepItemMobile
              key={pipStep.number}
              number={pipStep.number}
              name={pipStep.name}
              status={status}
              isCurrent={isCurrent}
              clickable={clickable}
              onClick={() => clickable && onStepClick?.(pipStep.number)}
            />
          )
        })}
      </div>
    </div>
  )
}

/* ---- Sub-components ---- */

type StepItemProps = {
  number: number
  name: string
  description: string
  status: StepStatus
  isCurrent: boolean
  clickable: boolean
  onClick: () => void
  formsStarted?: number
  formsTotal?: number
}

const StepItem = ({
  number,
  name,
  description,
  status,
  isCurrent,
  clickable,
  onClick,
  formsStarted,
  formsTotal,
}: StepItemProps) => {
  const isComplete = status === 'completed' || status === 'skipped'
  const showFormProgress =
    formsTotal !== undefined && formsTotal > 0 && !isComplete && status !== 'not_started'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={cn(
        'group flex flex-col items-center gap-2 rounded-[var(--radius-md)] px-3 py-3 transition-all',
        clickable && 'cursor-pointer hover:bg-[var(--color-surface-secondary)]',
        !clickable && 'cursor-default',
      )}
      data-testid={`step-button-${number}`}
    >
      {/* Step circle */}
      <div
        className={cn(
          `step-${number} flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all`,
          isComplete && 'bg-[var(--step-color)] text-white',
          isCurrent && !isComplete && 'pip-dot--active bg-[var(--step-color)] text-white',
          !isCurrent &&
            !isComplete &&
            'border-2 border-[var(--color-border)] text-[var(--color-text-tertiary)]',
        )}
      >
        {isComplete ? <Check size={18} /> : number}
      </div>

      {/* Label */}
      <div className="flex flex-col items-center">
        <span
          className={cn(
            'text-xs font-semibold',
            isCurrent ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]',
          )}
        >
          {name}
        </span>
        {/* 4.3: Form progress indicator */}
        {showFormProgress && (
          <span
            className="mt-0.5 text-[10px] text-[var(--color-text-tertiary)]"
            data-testid={`step-form-progress-${number}`}
          >
            {formsStarted ?? 0}/{formsTotal} forms
          </span>
        )}
        {isCurrent && !showFormProgress && (
          <span className="mt-0.5 max-w-[120px] text-center text-[10px] leading-tight text-[var(--color-text-tertiary)]">
            {description}
          </span>
        )}
      </div>
    </button>
  )
}

const StepConnector = ({ completed }: { completed: boolean }) => (
  <div
    className={cn(
      'h-0.5 min-w-[16px] flex-1 rounded-full transition-colors',
      completed ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]',
    )}
  />
)

type StepItemMobileProps = {
  number: number
  name: string
  status: StepStatus
  isCurrent: boolean
  clickable: boolean
  onClick: () => void
}

const StepItemMobile = ({
  number,
  name,
  status,
  isCurrent,
  clickable,
  onClick,
}: StepItemMobileProps) => {
  const isComplete = status === 'completed' || status === 'skipped'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={cn(
        `step-${number} flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 transition-all`,
        isCurrent && 'bg-[var(--step-color-subtle)] ring-1 ring-[var(--step-color)]',
        clickable && !isCurrent && 'hover:bg-[var(--color-surface-secondary)]',
        !clickable && 'cursor-default',
      )}
      data-testid={`step-button-mobile-${number}`}
    >
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
          isComplete && 'bg-[var(--step-color)] text-white',
          isCurrent && !isComplete && 'bg-[var(--step-color)] text-white',
          !isCurrent &&
            !isComplete &&
            'border-2 border-[var(--color-border)] text-[var(--color-text-tertiary)]',
        )}
      >
        {isComplete ? <Check size={14} /> : number}
      </div>
      <span
        className={cn(
          'text-sm font-medium',
          isCurrent ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]',
        )}
      >
        {name}
      </span>
    </button>
  )
}
