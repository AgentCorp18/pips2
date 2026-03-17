'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { pipsStepEnumToNumber } from '@pips/shared'

/* ============================================================
   Constants
   ============================================================ */

const STEP_LABELS: Record<string, string> = {
  identify: 'Step 1: Identify',
  analyze: 'Step 2: Analyze',
  generate: 'Step 3: Generate',
  select_plan: 'Step 4: Select & Plan',
  implement: 'Step 5: Implement',
  evaluate: 'Step 6: Evaluate',
}

const STEP_COLORS: Record<string, string> = {
  identify: '#2563EB',
  analyze: '#D97706',
  generate: '#059669',
  select_plan: '#4338CA',
  implement: '#CA8A04',
  evaluate: '#0891B2',
}

/* ============================================================
   Types
   ============================================================ */

export type ProjectForm = {
  id: string
  step: string
  form_type: string
  title: string | null
}

type TicketProjectFormsProps = {
  projectId: string
  projectTitle: string
  forms: ProjectForm[]
}

/* ============================================================
   Helpers
   ============================================================ */

const formatFormType = (formType: string): string =>
  formType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const groupFormsByStep = (forms: ProjectForm[]): Map<string, ProjectForm[]> => {
  const map = new Map<string, ProjectForm[]>()
  for (const form of forms) {
    const existing = map.get(form.step)
    if (existing) {
      existing.push(form)
    } else {
      map.set(form.step, [form])
    }
  }
  return map
}

/* ============================================================
   Component
   ============================================================ */

export const TicketProjectForms = ({ projectId, projectTitle, forms }: TicketProjectFormsProps) => {
  const [collapsed, setCollapsed] = useState(false)

  const grouped = groupFormsByStep(forms)
  // Sort steps by step number order
  const stepOrder = ['identify', 'analyze', 'generate', 'select_plan', 'implement', 'evaluate']
  const sortedSteps = stepOrder.filter((step) => grouped.has(step))

  return (
    <section data-testid="ticket-project-forms-section">
      <Card className="border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-expanded={!collapsed}
          aria-controls="ticket-project-forms-content"
          data-testid="ticket-project-forms-toggle"
          className="flex w-full items-center justify-between rounded px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
        >
          <div className="flex items-center gap-2">
            <FileText
              size={15}
              style={{ color: 'var(--color-text-tertiary)' }}
              aria-hidden="true"
            />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              PIPS Forms
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {projectTitle}
            </span>
            <Badge variant="secondary" className="text-xs">
              {forms.length}
            </Badge>
          </div>
          {collapsed ? (
            <ChevronDown
              size={14}
              className="text-[var(--color-text-tertiary)]"
              aria-hidden="true"
            />
          ) : (
            <ChevronUp size={14} className="text-[var(--color-text-tertiary)]" aria-hidden="true" />
          )}
        </button>

        {!collapsed && (
          <CardContent id="ticket-project-forms-content" className="px-4 pb-4 pt-0">
            {forms.length === 0 ? (
              <p
                className="py-2 text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
                data-testid="ticket-project-forms-empty"
              >
                No forms have been filled out for this project yet.
              </p>
            ) : (
              <div className="space-y-4">
                {sortedSteps.map((step) => (
                  <StepGroup
                    key={step}
                    step={step}
                    forms={grouped.get(step) ?? []}
                    projectId={projectId}
                  />
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </section>
  )
}

/* ============================================================
   StepGroup
   ============================================================ */

type StepGroupProps = {
  step: string
  forms: ProjectForm[]
  projectId: string
}

const StepGroup = ({ step, forms, projectId }: StepGroupProps) => {
  const stepNumber = pipsStepEnumToNumber(step)
  const stepColor = STEP_COLORS[step] ?? 'var(--color-primary)'
  const stepLabel = STEP_LABELS[step] ?? `Step ${stepNumber}`

  return (
    <div data-testid={`step-group-${step}`}>
      <div className="mb-2 flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: stepColor }}
          aria-hidden="true"
        />
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: stepColor }}
        >
          {stepLabel}
        </span>
      </div>
      <ul className="space-y-1.5 pl-4">
        {forms.map((form) => (
          <FormRow key={form.id} form={form} projectId={projectId} stepNumber={stepNumber} />
        ))}
      </ul>
    </div>
  )
}

/* ============================================================
   FormRow
   ============================================================ */

type FormRowProps = {
  form: ProjectForm
  projectId: string
  stepNumber: number
}

const FormRow = ({ form, projectId, stepNumber }: FormRowProps) => {
  const href = `/projects/${projectId}/steps/${stepNumber}/forms/${form.form_type}`
  const displayTitle = form.title ?? formatFormType(form.form_type)

  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2.5 rounded-md border px-3 py-2 text-sm transition-colors hover:border-[var(--color-primary-light)]"
        style={{ borderColor: 'var(--color-border)' }}
        data-testid={`form-link-${form.id}`}
      >
        <FileText
          size={13}
          style={{ color: 'var(--color-text-tertiary)' }}
          aria-hidden="true"
          className="shrink-0"
        />
        <span className="min-w-0 flex-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
          {displayTitle}
        </span>
        <Badge variant="secondary" className="shrink-0 text-xs">
          {formatFormType(form.form_type)}
        </Badge>
      </Link>
    </li>
  )
}
