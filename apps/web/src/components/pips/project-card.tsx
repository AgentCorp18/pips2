'use client'

import Link from 'next/link'
import { PIPS_STEPS } from '@pips/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormattedDate } from '@/components/ui/formatted-date'
import { ArrowRight, Calendar, User } from 'lucide-react'

type ProjectCardProps = {
  id: string
  name: string
  description: string | null
  status: string
  currentStep: number
  ownerName: string
  stepsCompleted: number
  targetDate: string | null
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  active: { label: 'Active', variant: 'default' },
  completed: { label: 'Completed', variant: 'outline' },
  on_hold: { label: 'On Hold', variant: 'secondary' },
  archived: { label: 'Archived', variant: 'destructive' },
}

export const ProjectCard = ({
  id,
  name,
  description,
  status,
  currentStep,
  ownerName,
  stepsCompleted,
  targetDate,
}: ProjectCardProps) => {
  const currentPipsStep = PIPS_STEPS.find((s) => s.number === currentStep)
  const fallback = { label: 'Active', variant: 'default' as const }
  const statusConfig = STATUS_CONFIG[status] ?? fallback

  return (
    <Link href={`/projects/${id}`} className="group block">
      <Card className="transition-all hover:shadow-[var(--shadow-medium)] group-hover:border-[var(--color-primary-light)]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base leading-snug group-hover:text-[var(--color-primary)]">
              {name}
            </CardTitle>
            <Badge variant={statusConfig.variant} className="shrink-0 text-xs">
              {statusConfig.label}
            </Badge>
          </div>
          {description && (
            <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-tertiary)]">
              {description}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Current step indicator */}
          {currentPipsStep && (
            <div className="flex items-center gap-2">
              <div
                className={`step-${currentStep} pip-dot`}
                style={{ backgroundColor: `var(--color-step-${currentStep})` }}
              />
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                Step {currentStep}: {currentPipsStep.name}
              </span>
            </div>
          )}

          {/* Progress bar */}
          <StepProgressBar stepsCompleted={stepsCompleted} currentStep={currentStep} />

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <User size={12} />
                {ownerName}
              </span>
              {targetDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  <FormattedDate date={targetDate} />
                </span>
              )}
            </div>
            <ArrowRight
              size={14}
              className="text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

/* ---- Sub-components ---- */

const StepProgressBar = ({
  stepsCompleted,
  currentStep,
}: {
  stepsCompleted: number
  currentStep: number
}) => (
  <div className="flex gap-1">
    {PIPS_STEPS.map((step) => {
      const isComplete = step.number <= stepsCompleted
      const isCurrent = step.number === currentStep && !isComplete

      return (
        <div
          key={step.number}
          className="h-1.5 flex-1 rounded-full transition-colors"
          style={{
            backgroundColor: isComplete
              ? `var(--color-step-${step.number})`
              : isCurrent
                ? `var(--color-step-${step.number}-subtle)`
                : 'var(--color-border)',
          }}
        />
      )
    })}
  </div>
)
