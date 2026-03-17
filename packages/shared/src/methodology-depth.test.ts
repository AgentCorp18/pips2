import { describe, it, expect } from 'vitest'
import {
  calculateMethodologyDepth,
  getStepRecommendations,
  getNextFormRecommendation,
} from './methodology-depth'
import { STEP_CONTENT } from './step-content'

/* ============================================================
   calculateMethodologyDepth
   ============================================================ */

describe('calculateMethodologyDepth', () => {
  it('returns 0 score when no forms are completed', () => {
    const result = calculateMethodologyDepth(new Set())
    expect(result.score).toBe(0)
    expect(result.label).toBe('Minimal')
    expect(result.completedCount).toBe(0)
    expect(result.totalCount).toBeGreaterThan(0)
  })

  it('returns 100 score when all forms are completed', () => {
    const allFormTypes = new Set<string>()
    for (let s = 1; s <= 6; s++) {
      for (const form of STEP_CONTENT[s as 1 | 2 | 3 | 4 | 5 | 6].forms) {
        allFormTypes.add(form.type)
      }
    }
    const result = calculateMethodologyDepth(allFormTypes)
    expect(result.score).toBe(100)
    expect(result.label).toBe('Comprehensive')
  })

  it('scores required forms higher than optional forms', () => {
    // Only the required problem_statement
    const requiredOnly = calculateMethodologyDepth(new Set(['problem_statement']))
    // Only an optional form (impact_assessment)
    const optionalOnly = calculateMethodologyDepth(new Set(['impact_assessment']))
    expect(requiredOnly.score).toBeGreaterThan(optionalOnly.score)
  })

  it('returns correct step breakdown', () => {
    const result = calculateMethodologyDepth(new Set(['problem_statement', 'fishbone']))
    expect(result.steps).toHaveLength(6)

    // Step 1 should have problem_statement completed
    const step1 = result.steps.find((s) => s.stepNumber === 1)
    expect(step1?.completedForms).toContain('problem_statement')
    expect(step1?.requiredComplete).toBe(true)

    // Step 2 should have fishbone completed
    const step2 = result.steps.find((s) => s.stepNumber === 2)
    expect(step2?.completedForms).toContain('fishbone')
  })

  it('provides a next recommendation when forms are incomplete', () => {
    const result = calculateMethodologyDepth(new Set())
    expect(result.nextRecommendation).not.toBeNull()
    // Should recommend a required form first (weight 3)
    expect(result.nextRecommendation?.category).toBe('required')
  })

  it('returns null next recommendation when all forms are complete', () => {
    const allFormTypes = new Set<string>()
    for (let s = 1; s <= 6; s++) {
      for (const form of STEP_CONTENT[s as 1 | 2 | 3 | 4 | 5 | 6].forms) {
        allFormTypes.add(form.type)
      }
    }
    const result = calculateMethodologyDepth(allFormTypes)
    expect(result.nextRecommendation).toBeNull()
  })

  it('assigns correct labels for different score ranges', () => {
    // We test by controlling exactly which forms are filled
    const empty = calculateMethodologyDepth(new Set())
    expect(empty.label).toBe('Minimal')

    // Just one required form should give Basic or Minimal
    const oneReq = calculateMethodologyDepth(new Set(['problem_statement']))
    expect(['Minimal', 'Basic']).toContain(oneReq.label)
  })

  it('tracks completedCount correctly', () => {
    const forms = new Set(['problem_statement', 'fishbone', 'brainstorming'])
    const result = calculateMethodologyDepth(forms)
    expect(result.completedCount).toBe(3)
  })

  it('ignores unknown form types in completedFormTypes', () => {
    const result = calculateMethodologyDepth(new Set(['nonexistent_form']))
    expect(result.score).toBe(0)
    expect(result.completedCount).toBe(1) // Set size, not matched
  })
})

/* ============================================================
   getStepRecommendations
   ============================================================ */

describe('getStepRecommendations', () => {
  it('returns all forms for a step with categories', () => {
    const result = getStepRecommendations(1)
    expect(result.stepNumber).toBe(1)
    expect(result.forms.length).toBe(STEP_CONTENT[1].forms.length)
  })

  it('categorizes required forms correctly', () => {
    const result = getStepRecommendations(1)
    const problemStatement = result.forms.find((f) => f.formType === 'problem_statement')
    expect(problemStatement?.category).toBe('required')
  })

  it('categorizes recommended optional forms correctly', () => {
    const result = getStepRecommendations(1)
    const impact = result.forms.find((f) => f.formType === 'impact_assessment')
    expect(impact?.category).toBe('recommended')
  })

  it('categorizes remaining optional forms correctly', () => {
    const result = getStepRecommendations(1)
    const listReduction = result.forms.find((f) => f.formType === 'list_reduction')
    expect(listReduction?.category).toBe('optional')
  })

  it('sorts forms: required first, then recommended, then optional', () => {
    const result = getStepRecommendations(1)
    const categories = result.forms.map((f) => f.category)
    const requiredIdx = categories.indexOf('required')
    const recommendedIdx = categories.indexOf('recommended')
    const optionalIdx = categories.indexOf('optional')

    if (requiredIdx >= 0 && recommendedIdx >= 0) {
      expect(requiredIdx).toBeLessThan(recommendedIdx)
    }
    if (recommendedIdx >= 0 && optionalIdx >= 0) {
      expect(recommendedIdx).toBeLessThan(optionalIdx)
    }
  })

  it('includes rationale for each form', () => {
    const result = getStepRecommendations(2)
    for (const form of result.forms) {
      expect(form.rationale).toBeTruthy()
    }
  })
})

/* ============================================================
   getNextFormRecommendation
   ============================================================ */

describe('getNextFormRecommendation', () => {
  it('recommends a form after completing one', () => {
    const result = getNextFormRecommendation(1, new Set(['problem_statement']), 'problem_statement')
    expect(result).not.toBeNull()
    expect(result?.formType).not.toBe('problem_statement')
  })

  it('returns null when all step forms are complete', () => {
    const allStep1Forms = new Set(STEP_CONTENT[1].forms.map((f) => f.type))
    const result = getNextFormRecommendation(1, allStep1Forms, 'problem_statement')
    expect(result).toBeNull()
  })

  it('prioritizes required forms over optional ones', () => {
    // For step 2, fishbone is required. If we complete five_why (optional), next should be fishbone
    const result = getNextFormRecommendation(2, new Set(['five_why']), 'five_why')
    expect(result).not.toBeNull()
    expect(result?.category).toBe('required')
  })

  it('excludes the just-completed form from recommendations', () => {
    const result = getNextFormRecommendation(1, new Set(), 'problem_statement')
    expect(result?.formType).not.toBe('problem_statement')
  })
})
