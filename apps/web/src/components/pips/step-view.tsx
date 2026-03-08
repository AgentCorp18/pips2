'use client'

import Link from 'next/link'
import { STEP_CONTENT, buildProductContext, type StepFormDef } from '@pips/shared'
import type { PipsStepNumber } from '@pips/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Circle,
  FileText,
  ArrowRight,
  SkipForward,
  MessageSquare,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KnowledgeCadenceBar } from '@/components/knowledge-cadence/knowledge-cadence-bar'

type FormStatus = {
  form_type: string
  started: boolean
}

type StepViewProps = {
  projectId: string
  stepNumber: PipsStepNumber
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  formStatuses: FormStatus[]
  canAdvance: boolean
  canOverride: boolean
  onAdvance?: () => void
  onOverride?: () => void
  isPending?: boolean
}

const RECOMMENDED_FORMS: Record<number, Set<string>> = {
  1: new Set(['problem_statement']),
  2: new Set(['fishbone', 'five_why']),
  3: new Set(['brainstorming']),
  4: new Set(['criteria_matrix', 'implementation_plan']),
  5: new Set(['milestone_tracker']),
  6: new Set(['before_after', 'lessons_learned']),
}

export const StepView = ({
  projectId,
  stepNumber,
  status,
  formStatuses,
  canAdvance,
  canOverride,
  onAdvance,
  onOverride,
  isPending = false,
}: StepViewProps) => {
  const content = STEP_CONTENT[stepNumber]
  const isCompleted = status === 'completed' || status === 'skipped'

  const requiredFormsStarted = content.forms
    .filter((f) => f.required)
    .every((f) => formStatuses.some((fs) => fs.form_type === f.type && fs.started))

  const canComplete = requiredFormsStarted && !isCompleted

  const cadenceContext = buildProductContext(stepNumber)

  return (
    <div className="space-y-6">
      {/* Objective */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className={`step-${stepNumber} flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white`}
              style={{ backgroundColor: `var(--color-step-${stepNumber})` }}
            >
              {stepNumber}
            </div>
            <div>
              <CardTitle className="text-lg">{content.title}</CardTitle>
              <StatusBadge status={status} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {content.objective}
          </p>
        </CardContent>
      </Card>

      {/* Guided Prompts */}
      <Card>
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2 text-base"
            data-testid="guiding-questions-title"
          >
            <MessageSquare size={16} className="text-[var(--color-text-tertiary)]" />
            Guiding Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {content.prompts.map((prompt) => (
              <li
                key={prompt}
                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-text-tertiary)]" />
                {prompt}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Forms */}
      <Card>
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2 text-base"
            data-testid="analysis-tools-title"
          >
            <FileText size={16} className="text-[var(--color-text-tertiary)]" />
            Analysis Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {content.forms.map((form) => (
              <FormRow
                key={form.type}
                form={form}
                projectId={projectId}
                stepNumber={stepNumber}
                started={formStatuses.some((fs) => fs.form_type === form.type && fs.started)}
                recommended={RECOMMENDED_FORMS[stepNumber]?.has(form.type) ?? false}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Completion Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base" data-testid="completion-criteria-title">
            Completion Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {content.completionCriteria.map((criterion) => (
              <li key={criterion} className="flex items-center gap-2 text-sm">
                {isCompleted ? (
                  <CheckCircle2 size={16} className="shrink-0 text-[var(--color-success)]" />
                ) : (
                  <Circle size={16} className="shrink-0 text-[var(--color-text-tertiary)]" />
                )}
                <span
                  className={cn(
                    isCompleted
                      ? 'text-[var(--color-text-secondary)] line-through'
                      : 'text-[var(--color-text-primary)]',
                  )}
                >
                  {criterion}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Knowledge Cadence Bar */}
      <KnowledgeCadenceBar context={cadenceContext} defaultCollapsed />

      {/* Actions */}
      {!isCompleted && (
        <div className="flex items-center gap-3">
          {canAdvance && (
            <Button onClick={onAdvance} disabled={!canComplete || isPending} className="gap-2">
              {isPending ? 'Advancing...' : 'Complete Step & Advance'}
              <ArrowRight size={16} />
            </Button>
          )}
          {canOverride && (
            <Button variant="outline" onClick={onOverride} disabled={isPending} className="gap-2">
              <SkipForward size={16} />
              Override (Skip Step)
            </Button>
          )}
          {!requiredFormsStarted && canAdvance && (
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Complete all required forms to advance
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ---- Sub-components ---- */

const StatusBadge = ({
  status,
}: {
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
}) => {
  const variants: Record<string, { label: string; variant: 'secondary' | 'default' | 'outline' }> =
    {
      not_started: { label: 'Not Started', variant: 'secondary' },
      in_progress: { label: 'In Progress', variant: 'default' },
      completed: { label: 'Completed', variant: 'outline' },
      skipped: { label: 'Skipped', variant: 'outline' },
    }

  const fallback = { label: 'Not Started', variant: 'secondary' as const }
  const config = variants[status] ?? fallback

  return (
    <Badge variant={config.variant} className="mt-1 text-xs" data-testid="step-status-badge">
      {config.label}
    </Badge>
  )
}

type FormRowProps = {
  form: StepFormDef
  projectId: string
  stepNumber: PipsStepNumber
  started: boolean
  recommended: boolean
}

const FormRow = ({ form, projectId, stepNumber, started, recommended }: FormRowProps) => (
  <Link
    href={`/projects/${projectId}/steps/${stepNumber}/forms/${form.type}`}
    data-testid={`form-link-${form.type}`}
    className={cn(
      'flex items-center justify-between rounded-[var(--radius-md)] border px-4 py-3 transition-all hover:bg-[var(--color-surface-secondary)]',
      started
        ? 'border-[var(--color-success)] bg-[var(--color-success-subtle)]'
        : 'border-[var(--color-border)]',
    )}
  >
    <div className="flex items-center gap-3">
      {started ? (
        <CheckCircle2 size={18} className="text-[var(--color-success)]" />
      ) : (
        <Circle size={18} className="text-[var(--color-text-tertiary)]" />
      )}
      <div>
        <span className="text-sm font-medium text-[var(--color-text-primary)]">{form.name}</span>
        <p className="text-xs text-[var(--color-text-tertiary)]">{form.description}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {recommended && (
        <Badge
          variant="outline"
          className="gap-1 text-[10px]"
          style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
          data-testid={`recommended-badge-${form.type}`}
        >
          <Star size={10} />
          Recommended
        </Badge>
      )}
      {form.required && (
        <Badge variant="secondary" className="text-[10px]">
          Required
        </Badge>
      )}
      <ArrowRight size={14} className="text-[var(--color-text-tertiary)]" />
    </div>
  </Link>
)
