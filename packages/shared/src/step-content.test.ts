import { describe, it, expect } from 'vitest'
import { STEP_CONTENT, getStepForms, getRequiredForms, ALL_FORM_TYPES } from './step-content'
import type { PipsStepNumber } from './constants'

describe('STEP_CONTENT', () => {
  const stepNumbers: PipsStepNumber[] = [1, 2, 3, 4, 5, 6]

  it('has content for all 6 steps', () => {
    for (const n of stepNumbers) {
      expect(STEP_CONTENT[n]).toBeDefined()
    }
  })

  it('every step has title, objective, prompts, forms, completionCriteria, methodology', () => {
    for (const n of stepNumbers) {
      const step = STEP_CONTENT[n]
      expect(step.title).toBeTruthy()
      expect(step.objective).toBeTruthy()
      expect(step.prompts.length).toBeGreaterThan(0)
      expect(step.forms.length).toBeGreaterThan(0)
      expect(step.completionCriteria.length).toBeGreaterThan(0)
      expect(step.methodology.tips.length).toBeGreaterThan(0)
      expect(step.methodology.bestPractices.length).toBeGreaterThan(0)
      expect(step.methodology.facilitationGuide).toBeTruthy()
    }
  })

  it('every form has type, name, description, and required flag', () => {
    for (const n of stepNumbers) {
      for (const form of STEP_CONTENT[n].forms) {
        expect(form.type).toBeTruthy()
        expect(form.name).toBeTruthy()
        expect(form.description).toBeTruthy()
        expect(typeof form.required).toBe('boolean')
      }
    }
  })

  it('each step has at least one required form', () => {
    for (const n of stepNumbers) {
      const required = STEP_CONTENT[n].forms.filter((f) => f.required)
      expect(required.length).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('getStepForms', () => {
  it('returns forms for step 1', () => {
    const forms = getStepForms(1)
    expect(forms.length).toBeGreaterThanOrEqual(1)
    expect(forms[0]?.type).toBe('problem_statement')
  })

  it('returns forms for step 2', () => {
    const forms = getStepForms(2)
    expect(forms.some((f) => f.type === 'fishbone')).toBe(true)
  })
})

describe('getRequiredForms', () => {
  it('returns only required forms', () => {
    const required = getRequiredForms(1)
    expect(required.every((f) => f.required)).toBe(true)
  })

  it('returns fewer forms than getStepForms when optional forms exist', () => {
    const all = getStepForms(2)
    const required = getRequiredForms(2)
    expect(required.length).toBeLessThanOrEqual(all.length)
  })
})

describe('ALL_FORM_TYPES', () => {
  it('contains all form types from all steps', () => {
    expect(ALL_FORM_TYPES.length).toBeGreaterThan(0)
    expect(ALL_FORM_TYPES).toContain('problem_statement')
    expect(ALL_FORM_TYPES).toContain('fishbone')
    expect(ALL_FORM_TYPES).toContain('lessons_learned')
  })

  it('has no duplicates within a step but may across steps', () => {
    // Each step's forms should have unique types
    for (const n of [1, 2, 3, 4, 5, 6] as const) {
      const types = STEP_CONTENT[n].forms.map((f) => f.type)
      expect(new Set(types).size).toBe(types.length)
    }
  })
})
