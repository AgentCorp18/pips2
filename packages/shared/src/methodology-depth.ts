/**
 * Methodology Depth Score — measures how thoroughly a project
 * uses the PIPS methodology tools across all 6 steps.
 *
 * Score range: 0–100
 *   - Required forms completed → up to 60 points
 *   - Recommended optional forms → up to 25 points
 *   - Remaining optional forms → up to 15 points
 */

import type { PipsStepNumber } from './constants'
import { STEP_CONTENT } from './step-content'

/* ============================================================
   Types
   ============================================================ */

export type FormCategory = 'required' | 'recommended' | 'optional'

export type FormRecommendation = {
  formType: string
  formName: string
  category: FormCategory
  /** Why this form is recommended for the current context */
  rationale: string
  /** Weight used for score calculation (1–3) */
  weight: number
}

export type StepRecommendations = {
  stepNumber: PipsStepNumber
  forms: FormRecommendation[]
}

export type MethodologyDepthResult = {
  /** Overall score 0–100 */
  score: number
  /** Label: Minimal / Basic / Moderate / Thorough / Comprehensive */
  label: string
  /** Color for the label (CSS variable name) */
  color: string
  /** Per-step breakdown */
  steps: StepDepth[]
  /** Forms completed out of total available */
  completedCount: number
  totalCount: number
  /** Suggested next form to fill out (highest impact) */
  nextRecommendation: FormRecommendation | null
}

export type StepDepth = {
  stepNumber: PipsStepNumber
  stepName: string
  completedForms: string[]
  totalForms: number
  requiredComplete: boolean
}

/* ============================================================
   Form Recommendation Config
   ============================================================ */

/**
 * Per-step recommended optional forms — these are the tools that
 * add the most value beyond the required minimum.
 */
const RECOMMENDED_OPTIONAL: Record<PipsStepNumber, string[]> = {
  1: ['impact_assessment'],
  2: ['five_why', 'force_field'],
  3: ['brainwriting'],
  4: ['paired_comparisons', 'cost_benefit'],
  5: ['implementation_checklist'],
  6: ['evaluation'],
}

/**
 * Weight values for score calculation.
 * Higher weight = more contribution to depth score.
 */
const FORM_WEIGHTS: Record<FormCategory, number> = {
  required: 3,
  recommended: 2,
  optional: 1,
}

/* ============================================================
   Score Calculation
   ============================================================ */

const getFormCategory = (
  stepNumber: PipsStepNumber,
  formType: string,
  isRequired: boolean,
): FormCategory => {
  if (isRequired) return 'required'
  if (RECOMMENDED_OPTIONAL[stepNumber]?.includes(formType)) return 'recommended'
  return 'optional'
}

/**
 * Calculate methodology depth score for a project.
 *
 * @param completedFormTypes - Set of form_type strings the project has filled out
 * @returns MethodologyDepthResult with score, label, breakdown, and next recommendation
 */
export const calculateMethodologyDepth = (
  completedFormTypes: Set<string>,
): MethodologyDepthResult => {
  let earnedPoints = 0
  let maxPoints = 0
  const steps: StepDepth[] = []
  let bestNextRec: FormRecommendation | null = null
  let bestNextWeight = -1

  for (let s = 1; s <= 6; s++) {
    const stepNum = s as PipsStepNumber
    const content = STEP_CONTENT[stepNum]
    const completedInStep: string[] = []

    for (const form of content.forms) {
      const category = getFormCategory(stepNum, form.type, form.required)
      const weight = FORM_WEIGHTS[category]
      maxPoints += weight

      if (completedFormTypes.has(form.type)) {
        earnedPoints += weight
        completedInStep.push(form.type)
      } else if (weight > bestNextWeight) {
        // Track the highest-weight incomplete form as next recommendation
        bestNextWeight = weight
        bestNextRec = {
          formType: form.type,
          formName: form.name,
          category,
          rationale: getRationale(stepNum, form.type, category),
          weight,
        }
      }
    }

    const requiredForms = content.forms.filter((f) => f.required)
    steps.push({
      stepNumber: stepNum,
      stepName: content.title,
      completedForms: completedInStep,
      totalForms: content.forms.length,
      requiredComplete: requiredForms.every((f) => completedFormTypes.has(f.type)),
    })
  }

  const score = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0
  const completedCount = completedFormTypes.size
  const totalCount = Object.values(STEP_CONTENT).reduce((sum, s) => sum + s.forms.length, 0)

  return {
    score,
    label: getLabel(score),
    color: getColor(score),
    steps,
    completedCount,
    totalCount,
    nextRecommendation: bestNextRec,
  }
}

/* ============================================================
   Step Recommendations (for StepAdvisor component)
   ============================================================ */

/**
 * Get form recommendations for a specific step, categorized and
 * annotated with completion status.
 */
export const getStepRecommendations = (stepNumber: PipsStepNumber): StepRecommendations => {
  const content = STEP_CONTENT[stepNumber]

  const forms: FormRecommendation[] = content.forms.map((form) => {
    const category = getFormCategory(stepNumber, form.type, form.required)
    return {
      formType: form.type,
      formName: form.name,
      category,
      rationale: getRationale(stepNumber, form.type, category),
      weight: FORM_WEIGHTS[category],
    }
  })

  // Sort: required first, then recommended, then optional
  const categoryOrder: Record<FormCategory, number> = {
    required: 0,
    recommended: 1,
    optional: 2,
  }
  forms.sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category])

  return { stepNumber, forms }
}

/**
 * Get the single best next form to recommend after completing a form.
 * Used by PostFormNudge component.
 */
export const getNextFormRecommendation = (
  stepNumber: PipsStepNumber,
  completedFormTypes: Set<string>,
  justCompletedType: string,
): FormRecommendation | null => {
  const content = STEP_CONTENT[stepNumber]
  let best: FormRecommendation | null = null
  let bestWeight = -1

  for (const form of content.forms) {
    if (form.type === justCompletedType) continue
    if (completedFormTypes.has(form.type)) continue

    const category = getFormCategory(stepNumber, form.type, form.required)
    const weight = FORM_WEIGHTS[category]

    if (weight > bestWeight) {
      bestWeight = weight
      best = {
        formType: form.type,
        formName: form.name,
        category,
        rationale: getRationale(stepNumber, form.type, category),
        weight,
      }
    }
  }

  return best
}

/* ============================================================
   Helpers
   ============================================================ */

const getLabel = (score: number): string => {
  if (score >= 90) return 'Comprehensive'
  if (score >= 70) return 'Thorough'
  if (score >= 50) return 'Moderate'
  if (score >= 25) return 'Basic'
  return 'Minimal'
}

const getColor = (score: number): string => {
  if (score >= 90) return 'var(--color-step-6)'
  if (score >= 70) return 'var(--color-step-3)'
  if (score >= 50) return 'var(--color-step-5)'
  if (score >= 25) return 'var(--color-step-2)'
  return 'var(--color-text-tertiary)'
}

const RATIONALE_MAP: Record<string, string> = {
  // Step 1
  problem_statement: 'Essential for defining a clear, measurable problem',
  impact_assessment: 'Quantifies the cost of the problem — helps prioritize and justify action',
  list_reduction: 'Useful when you have multiple candidate problems to narrow down',
  weighted_voting: 'Helps teams reach consensus on which problem to tackle first',
  // Step 2
  fishbone: 'Essential for structured root cause analysis across categories',
  five_why: 'Digs deeper into the root cause chain — reveals hidden causes',
  force_field: 'Maps driving and restraining forces — reveals what helps and hinders change',
  checksheet: 'Collects data to quantify where problems occur most frequently',
  pareto: 'Identifies the vital few causes that drive most of the impact',
  // Step 3
  brainstorming: 'Essential for generating multiple solution options before selecting one',
  brainwriting: 'Builds on ideas silently — great for introverts and avoiding groupthink',
  interviewing: 'Gathers qualitative insights from stakeholders about potential solutions',
  surveying: 'Quantifies preferences and opinions across a larger group',
  // Step 4
  criteria_matrix: 'Essential for evaluating options against weighted criteria',
  paired_comparisons: 'Validates the criteria matrix ranking through head-to-head comparison',
  raci: 'Clarifies who is responsible, accountable, consulted, and informed',
  implementation_plan: 'Essential for defining the implementation approach and timeline',
  balance_sheet: 'Weighs pros and cons to assess feasibility before committing',
  cost_benefit: 'Quantifies costs vs benefits to validate ROI of the selected solution',
  // Step 5
  milestone_tracker: 'Essential for tracking implementation progress against plan',
  implementation_checklist: 'Detailed task tracking ensures nothing is missed during execution',
  // Step 6
  before_after: 'Essential for comparing results against the original problem baseline',
  evaluation: 'Comprehensive assessment of whether targets were met',
  lessons_learned: 'Essential for capturing insights to improve future projects',
}

const getRationale = (
  _stepNumber: PipsStepNumber,
  formType: string,
  category: FormCategory,
): string => {
  if (RATIONALE_MAP[formType]) return RATIONALE_MAP[formType]
  if (category === 'required') return 'Required tool for this step'
  if (category === 'recommended') return 'Recommended for deeper analysis'
  return 'Optional tool for comprehensive analysis'
}
