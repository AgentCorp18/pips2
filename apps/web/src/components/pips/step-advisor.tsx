'use client'

import { useState } from 'react'
import {
  getStepRecommendations,
  calculateMethodologyDepth,
  type FormCategory,
  type PipsStepNumber,
} from '@pips/shared'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Lightbulb, CheckCircle2, Star, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

type StepAdvisorProps = {
  stepNumber: PipsStepNumber
  /** Set of form_type strings already completed for this project */
  completedFormTypes: Set<string>
}

const CATEGORY_CONFIG: Record<
  FormCategory,
  { label: string; variant: 'default' | 'secondary' | 'outline'; icon: typeof Star }
> = {
  required: { label: 'Required', variant: 'secondary', icon: Circle },
  recommended: { label: 'Recommended', variant: 'default', icon: Star },
  optional: { label: 'Optional', variant: 'outline', icon: Circle },
}

export const StepAdvisor = ({ stepNumber, completedFormTypes }: StepAdvisorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const recommendations = getStepRecommendations(stepNumber)
  const depth = calculateMethodologyDepth(completedFormTypes)

  const completedInStep = recommendations.forms.filter((f) => completedFormTypes.has(f.formType))
  const remainingInStep = recommendations.forms.filter((f) => !completedFormTypes.has(f.formType))

  // Don't show if all forms in this step are complete
  if (remainingInStep.length === 0) return null

  const remainingRequired = remainingInStep.filter((f) => f.category === 'required')
  const remainingRecommended = remainingInStep.filter((f) => f.category === 'recommended')

  // Build summary text
  const parts: string[] = []
  if (remainingRequired.length > 0) {
    parts.push(`${remainingRequired.length} required`)
  }
  if (remainingRecommended.length > 0) {
    parts.push(`${remainingRecommended.length} recommended`)
  }
  const summary = parts.length > 0 ? parts.join(', ') + ' remaining' : 'Optional tools available'

  return (
    <Card
      className="border-[var(--color-primary-light)] bg-[var(--color-primary)]/[0.03]"
      data-testid="step-advisor"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={isOpen}
        data-testid="step-advisor-toggle"
      >
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-[var(--color-primary)]" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Tool Advisor</span>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {completedInStep.length}/{recommendations.forms.length} complete · {summary}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-[10px]"
            style={{ borderColor: depth.color, color: depth.color }}
          >
            Depth: {depth.score}%
          </Badge>
          <ChevronDown
            size={14}
            className={cn(
              'text-[var(--color-text-tertiary)] transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        </div>
      </button>

      {isOpen && (
        <CardContent className="border-t border-[var(--color-border)] pt-3">
          <div className="space-y-2">
            {recommendations.forms.map((rec) => {
              const isComplete = completedFormTypes.has(rec.formType)
              const config = CATEGORY_CONFIG[rec.category]

              return (
                <div
                  key={rec.formType}
                  className={cn(
                    'flex items-start gap-2 rounded-md px-2 py-1.5 text-sm',
                    isComplete && 'opacity-60',
                  )}
                  data-testid={`advisor-form-${rec.formType}`}
                >
                  {isComplete ? (
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-[var(--color-success)]"
                    />
                  ) : rec.category === 'recommended' ? (
                    <Star size={14} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                  ) : (
                    <Circle
                      size={14}
                      className="mt-0.5 shrink-0 text-[var(--color-text-tertiary)]"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'font-medium',
                          isComplete
                            ? 'text-[var(--color-text-secondary)] line-through'
                            : 'text-[var(--color-text-primary)]',
                        )}
                      >
                        {rec.formName}
                      </span>
                      <Badge variant={config.variant} className="text-[9px] px-1 py-0">
                        {config.label}
                      </Badge>
                    </div>
                    {!isComplete && (
                      <p className="text-xs text-[var(--color-text-tertiary)]">{rec.rationale}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
