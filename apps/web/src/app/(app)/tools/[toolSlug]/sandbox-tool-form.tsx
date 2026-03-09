'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { SANDBOX_PROJECT_ID } from '@/components/pips/form-shell'

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Dynamically import form components to avoid loading all 18 at once */
const FORM_COMPONENTS: Record<string, React.ComponentType<any>> = {
  problem_statement: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/problem_statement/problem-statement-form').then(
      (m) => m.ProblemStatementForm,
    ),
  ),
  impact_assessment: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/impact_assessment/impact-assessment-form').then(
      (m) => m.ImpactAssessmentForm,
    ),
  ),
  fishbone: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/fishbone/fishbone-form').then(
      (m) => m.FishboneForm,
    ),
  ),
  five_why: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/five_why/five-why-form').then(
      (m) => m.FiveWhyForm,
    ),
  ),
  force_field: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/force_field/force-field-form').then(
      (m) => m.ForceFieldForm,
    ),
  ),
  checksheet: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/checksheet/checksheet-form').then(
      (m) => m.ChecksheetForm,
    ),
  ),
  brainstorming: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/brainstorming/brainstorming-form').then(
      (m) => m.BrainstormingForm,
    ),
  ),
  brainwriting: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/brainwriting/brainwriting-form').then(
      (m) => m.BrainwritingForm,
    ),
  ),
  paired_comparisons: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/paired_comparisons/paired-comparisons-form').then(
      (m) => m.PairedComparisonsForm,
    ),
  ),
  criteria_matrix: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/criteria-matrix/criteria-matrix-form').then(
      (m) => m.CriteriaMatrixForm,
    ),
  ),
  balance_sheet: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/balance_sheet/balance-sheet-form').then(
      (m) => m.BalanceSheetForm,
    ),
  ),
  raci: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/raci/raci-form').then(
      (m) => m.RaciForm,
    ),
  ),
  implementation_plan: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/implementation-plan/implementation-plan-form').then(
      (m) => m.ImplementationPlanForm,
    ),
  ),
  implementation_checklist: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/implementation-checklist/implementation-checklist-form').then(
      (m) => m.ImplementationChecklistForm,
    ),
  ),
  milestone_tracker: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/milestone-tracker/milestone-tracker-form').then(
      (m) => m.MilestoneTrackerForm,
    ),
  ),
  before_after: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/before-after/before-after-form').then(
      (m) => m.BeforeAfterForm,
    ),
  ),
  evaluation: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/evaluation/evaluation-form').then(
      (m) => m.EvaluationForm,
    ),
  ),
  lessons_learned: dynamic(() =>
    import('@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/lessons-learned/lessons-learned-form').then(
      (m) => m.LessonsLearnedForm,
    ),
  ),
}
/* eslint-enable @typescript-eslint/no-explicit-any */

type SandboxToolFormProps = {
  toolSlug: string
  formType: string
  stepNumber: number
  name: string
  description: string
}

export const SandboxToolForm = ({ formType, stepNumber }: SandboxToolFormProps) => {
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Load saved sandbox data from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`pips-sandbox-${formType}`)
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage on mount
        setInitialData(JSON.parse(saved) as Record<string, unknown>)
      }
    } catch {
      // Ignore parse errors
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage on mount
    setLoaded(true)
  }, [formType])

  const FormComponent = FORM_COMPONENTS[formType]

  if (!FormComponent) {
    return (
      <div className="py-12 text-center">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          This tool is not yet available in sandbox mode.
        </p>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="py-12 text-center">
        <p style={{ color: 'var(--color-text-tertiary)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <FormComponent
      projectId={SANDBOX_PROJECT_ID}
      stepNumber={stepNumber}
      initialData={initialData}
    />
  )
}
