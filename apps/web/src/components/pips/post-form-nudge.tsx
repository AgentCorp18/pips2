'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getNextFormRecommendation, type PipsStepNumber } from '@pips/shared'
import { ArrowRight, Lightbulb, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PostFormNudgeProps = {
  projectId: string
  stepNumber: PipsStepNumber
  /** Set of form_type strings already completed */
  completedFormTypes: Set<string>
  /** The form type that was just saved */
  justCompletedType: string
  /** Whether a save just happened (controls visibility) */
  visible: boolean
}

export const PostFormNudge = ({
  projectId,
  stepNumber,
  completedFormTypes,
  justCompletedType,
  visible,
}: PostFormNudgeProps) => {
  const [dismissed, setDismissed] = useState(false)

  if (!visible || dismissed) return null

  const recommendation = getNextFormRecommendation(
    stepNumber,
    completedFormTypes,
    justCompletedType,
  )

  if (!recommendation) return null

  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-[var(--color-primary-light)] bg-[var(--color-primary)]/[0.03] px-4 py-3"
      data-testid="post-form-nudge"
    >
      <Lightbulb size={16} className="shrink-0 text-[var(--color-primary)]" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[var(--color-text-primary)]">
          <span className="font-medium">Deepen your analysis:</span> {recommendation.rationale}
        </p>
      </div>
      <Link
        href={`/projects/${projectId}/steps/${stepNumber}/forms/${recommendation.formType}`}
        data-testid="nudge-link"
      >
        <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap">
          {recommendation.formName}
          <ArrowRight size={14} />
        </Button>
      </Link>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
        aria-label="Dismiss suggestion"
        data-testid="nudge-dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}
