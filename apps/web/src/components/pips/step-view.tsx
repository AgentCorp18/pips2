'use client'

import { useState } from 'react'
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
  Clock,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KnowledgeCadenceBar } from '@/components/knowledge-cadence/knowledge-cadence-bar'
import { StepAdvisor } from '@/components/pips/step-advisor'

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
  /** Current project step (1-based) — used for dependency warnings */
  currentProjectStep?: PipsStepNumber
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
  currentProjectStep,
}: StepViewProps) => {
  const content = STEP_CONTENT[stepNumber]
  const isCompleted = status === 'completed' || status === 'skipped'

  const requiredFormsStarted = content.forms
    .filter((f) => f.required)
    .every((f) => formStatuses.some((fs) => fs.form_type === f.type && fs.started))

  const canComplete = requiredFormsStarted && !isCompleted

  const cadenceContext = buildProductContext(stepNumber)

  // 1.3: Split forms into required and optional
  const requiredForms = content.forms.filter((f) => f.required)
  const optionalForms = content.forms.filter((f) => !f.required)

  // Build set of completed form types for StepAdvisor
  const completedFormTypes = new Set(
    formStatuses.filter((fs) => fs.started).map((fs) => fs.form_type),
  )

  // 1.6: Dependency warning — viewing a step ahead of current project step
  const showDependencyWarning =
    currentProjectStep !== undefined && stepNumber > currentProjectStep && !isCompleted

  return (
    <div className="space-y-6">
      {/* Back to Project link */}
      <div className="flex items-center">
        <Link
          href={`/projects/${projectId}`}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          data-testid="back-to-project-link"
        >
          <Home size={14} />
          Back to Project
        </Link>
      </div>

      {/* 1.6: Step Dependency Warning */}
      {showDependencyWarning && (
        <div
          className="flex items-start gap-3 rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent)]/5 px-4 py-3"
          data-testid="step-dependency-warning"
        >
          <Info size={18} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Step {stepNumber} builds on Step {stepNumber - 1}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
              Complete earlier steps first for best results. You can still explore this step.
            </p>
          </div>
        </div>
      )}

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

      {/* 1.1: Step Context Banner — why this step matters + time + top pitfall */}
      <StepContextBanner
        timeEstimate={content.timeEstimate}
        topMistake={content.topMistake}
        stepNumber={stepNumber}
      />

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

      {/* Tool Advisor — contextual form recommendations */}
      <StepAdvisor stepNumber={stepNumber} completedFormTypes={completedFormTypes} />

      {/* 1.3: Forms — split into Required Tools and Optional Tools */}
      {requiredForms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-base"
              data-testid="required-tools-title"
            >
              <FileText size={16} className="text-[var(--color-text-tertiary)]" />
              Required Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requiredForms.map((form) => (
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
      )}

      {optionalForms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-base"
              data-testid="optional-tools-title"
            >
              <FileText size={16} className="text-[var(--color-text-tertiary)]" />
              Optional Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optionalForms.map((form) => (
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
      )}

      {/* 2.2: Common Mistakes (collapsible) */}
      {content.commonMistakes.length > 0 && (
        <CollapsibleCard
          title="Common Mistakes to Avoid"
          icon={<AlertTriangle size={16} className="text-[var(--color-warning)]" />}
          testId="common-mistakes"
        >
          <ul className="space-y-2">
            {content.commonMistakes.map((mistake) => (
              <li
                key={mistake}
                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-warning)]" />
                {mistake}
              </li>
            ))}
          </ul>
        </CollapsibleCard>
      )}

      {/* 2.3: Facilitation Guide (collapsible) */}
      {content.methodology.facilitationGuide && (
        <CollapsibleCard
          title="Facilitation Guide"
          icon={<Users size={16} className="text-[var(--color-text-tertiary)]" />}
          testId="facilitation-guide"
        >
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {content.methodology.facilitationGuide}
          </p>
        </CollapsibleCard>
      )}

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

      {/* Step-to-step navigation */}
      <StepNavigation projectId={projectId} stepNumber={stepNumber} />
    </div>
  )
}

/* ---- Step navigation ---- */

const STEP_NAMES: Record<number, string> = {
  1: 'Identify',
  2: 'Analyze',
  3: 'Ideate',
  4: 'Plan',
  5: 'Implement',
  6: 'Evaluate',
}

const StepNavigation = ({
  projectId,
  stepNumber,
}: {
  projectId: string
  stepNumber: PipsStepNumber
}) => (
  <div
    className="flex items-center justify-between border-t border-[var(--color-border)] pt-4"
    data-testid="step-navigation"
  >
    {stepNumber > 1 ? (
      <Link
        href={`/projects/${projectId}/steps/${stepNumber - 1}`}
        className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        data-testid="prev-step-link"
      >
        <ChevronLeft size={16} />
        Step {stepNumber - 1}: {STEP_NAMES[stepNumber - 1]}
      </Link>
    ) : (
      <div />
    )}
    {stepNumber < 6 ? (
      <Link
        href={`/projects/${projectId}/steps/${stepNumber + 1}`}
        className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        data-testid="next-step-link"
      >
        Step {stepNumber + 1}: {STEP_NAMES[stepNumber + 1]}
        <ChevronRight size={16} />
      </Link>
    ) : (
      <div />
    )}
  </div>
)

/* ---- Sub-components ---- */

/** 1.1: Compact context banner — time estimate, top pitfall */
const StepContextBanner = ({
  timeEstimate,
  topMistake,
  stepNumber,
}: {
  timeEstimate: string
  topMistake: string
  stepNumber: PipsStepNumber
}) => (
  <div
    className="flex flex-wrap items-start gap-4 rounded-lg border px-4 py-3"
    style={{
      borderColor: `var(--color-step-${stepNumber})`,
      backgroundColor: `color-mix(in srgb, var(--color-step-${stepNumber}) 5%, transparent)`,
    }}
    data-testid="step-context-banner"
  >
    <div className="flex items-center gap-2">
      <Clock size={14} className="shrink-0 text-[var(--color-text-tertiary)]" />
      <span className="text-sm text-[var(--color-text-secondary)]">
        <span className="font-medium">Time:</span> {timeEstimate}
      </span>
    </div>
    <div className="flex items-start gap-2">
      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[var(--color-warning)]" />
      <span className="text-sm text-[var(--color-text-secondary)]">
        <span className="font-medium">Top pitfall:</span> {topMistake}
      </span>
    </div>
  </div>
)

/** Collapsible card section — used for facilitation guide, common mistakes */
const CollapsibleCard = ({
  title,
  icon,
  children,
  testId,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  testId?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card data-testid={testId}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-base font-semibold text-[var(--color-text-primary)]">
          {icon}
          {title}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'text-[var(--color-text-tertiary)] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && (
        <CardContent className="border-t border-[var(--color-border)] pt-4">{children}</CardContent>
      )}
    </Card>
  )
}

const StatusBadge = ({
  status,
}: {
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
}) => {
  const variants: Record<
    string,
    {
      label: string
      variant: 'secondary' | 'default' | 'outline'
      icon: typeof CheckCircle2
      iconColor: string
    }
  > = {
    not_started: {
      label: 'Not Started',
      variant: 'secondary',
      icon: Circle,
      iconColor: 'var(--color-text-tertiary)',
    },
    in_progress: {
      label: 'In Progress',
      variant: 'default',
      icon: Clock,
      iconColor: 'var(--color-primary)',
    },
    completed: {
      label: 'Completed',
      variant: 'outline',
      icon: CheckCircle2,
      iconColor: 'var(--color-success)',
    },
    skipped: {
      label: 'Skipped',
      variant: 'outline',
      icon: SkipForward,
      iconColor: 'var(--color-text-tertiary)',
    },
  }

  const fallback = {
    label: 'Not Started',
    variant: 'secondary' as const,
    icon: Circle,
    iconColor: 'var(--color-text-tertiary)',
  }
  const config = variants[status] ?? fallback
  const StatusIcon = config.icon

  return (
    <Badge variant={config.variant} className="mt-1 gap-1 text-xs" data-testid="step-status-badge">
      <StatusIcon size={12} style={{ color: config.iconColor }} aria-hidden="true" />
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
    href={`/projects/${projectId}/steps/${stepNumber}/forms/${form.slug ?? form.type}`}
    data-testid={`form-link-${form.type}`}
    className={cn(
      'flex items-center justify-between rounded-[var(--radius-md)] border px-4 py-3 transition-all hover:bg-[var(--color-surface-secondary)]',
      started
        ? 'border-[var(--color-success)] bg-[var(--color-success-subtle)]'
        : 'border-[var(--color-border)]',
      form.required && !started && 'border-l-4',
    )}
    style={
      form.required && !started ? { borderLeftColor: `var(--color-step-${stepNumber})` } : undefined
    }
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
      {/* 1.2: Time estimate badge */}
      {form.timeEstimate && (
        <Badge
          variant="outline"
          className="gap-1 text-[10px] text-[var(--color-text-tertiary)]"
          data-testid={`time-badge-${form.type}`}
        >
          <Clock size={10} />
          {form.timeEstimate}
        </Badge>
      )}
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
