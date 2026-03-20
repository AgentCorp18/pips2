import { describe, it, expect } from 'vitest'
import {
  PIPS_STEPS,
  PIPS_STEP_NAMES,
  PIPS_STEP_COLORS,
  BRAND,
  APP_NAME,
  APP_DESCRIPTION,
  STEP_CONTENT,
  getStepForms,
  getRequiredForms,
  ALL_FORM_TYPES,
} from '@pips/shared'
import type { PipsStepNumber } from '@pips/shared'

/* ============================================================
   PIPS_STEPS
   ============================================================ */

describe('PIPS_STEPS', () => {
  it('has exactly 6 steps', () => {
    expect(PIPS_STEPS).toHaveLength(6)
  })

  it('each step has required fields: number, name, description, color, icon', () => {
    for (const step of PIPS_STEPS) {
      expect(step).toHaveProperty('number')
      expect(step).toHaveProperty('name')
      expect(step).toHaveProperty('description')
      expect(step).toHaveProperty('color')
      expect(step).toHaveProperty('icon')
    }
  })

  it('step numbers are 1 through 6 in order', () => {
    const numbers = PIPS_STEPS.map((s) => s.number)
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('has correct step names', () => {
    const names = PIPS_STEPS.map((s) => s.name)
    expect(names).toEqual([
      'Identify',
      'Analyze',
      'Generate',
      'Select & Plan',
      'Implement',
      'Evaluate',
    ])
  })

  it('each step has a valid hex color', () => {
    for (const step of PIPS_STEPS) {
      expect(step.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('each step has a colorSubtle with rgba format', () => {
    for (const step of PIPS_STEPS) {
      expect(step.colorSubtle).toMatch(/^rgba\(/)
    }
  })
})

describe('PIPS_STEP_NAMES', () => {
  it('has 6 names derived from PIPS_STEPS', () => {
    expect(PIPS_STEP_NAMES).toHaveLength(6)
    expect(PIPS_STEP_NAMES[0]).toBe('Identify')
    expect(PIPS_STEP_NAMES[5]).toBe('Evaluate')
  })
})

describe('PIPS_STEP_COLORS', () => {
  it('has 6 colors derived from PIPS_STEPS', () => {
    expect(PIPS_STEP_COLORS).toHaveLength(6)
    for (const color of PIPS_STEP_COLORS) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})

/* ============================================================
   BRAND constants
   ============================================================ */

describe('BRAND', () => {
  it('has primary color', () => {
    expect(BRAND.primary).toBe('#4F46E5')
  })

  it('has deep color', () => {
    expect(BRAND.deep).toBe('#1B1340')
  })

  it('has all expected keys', () => {
    expect(BRAND).toHaveProperty('primary')
    expect(BRAND).toHaveProperty('primaryHover')
    expect(BRAND).toHaveProperty('primaryActive')
    expect(BRAND).toHaveProperty('primaryLight')
    expect(BRAND).toHaveProperty('deep')
    expect(BRAND).toHaveProperty('accent')
    expect(BRAND).toHaveProperty('cloud')
    expect(BRAND).toHaveProperty('amber')
    expect(BRAND).toHaveProperty('ink')
  })
})

/* ============================================================
   APP metadata
   ============================================================ */

describe('APP_NAME and APP_DESCRIPTION', () => {
  it('APP_NAME is PIPS', () => {
    expect(APP_NAME).toBe('PIPS')
  })

  it('APP_DESCRIPTION is a non-empty string', () => {
    expect(typeof APP_DESCRIPTION).toBe('string')
    expect(APP_DESCRIPTION.length).toBeGreaterThan(0)
  })
})

/* ============================================================
   STEP_CONTENT
   ============================================================ */

describe('STEP_CONTENT', () => {
  const stepNumbers: PipsStepNumber[] = [1, 2, 3, 4, 5, 6]

  it('has content for all 6 steps', () => {
    for (const num of stepNumbers) {
      expect(STEP_CONTENT[num]).toBeDefined()
    }
  })

  it('each step content has required fields', () => {
    for (const num of stepNumbers) {
      const content = STEP_CONTENT[num]
      expect(content).toHaveProperty('title')
      expect(content).toHaveProperty('objective')
      expect(content).toHaveProperty('prompts')
      expect(content).toHaveProperty('forms')
      expect(content).toHaveProperty('completionCriteria')
      expect(content).toHaveProperty('methodology')
    }
  })

  it('each step methodology has tips, bestPractices, and facilitationGuide', () => {
    for (const num of stepNumbers) {
      const methodology = STEP_CONTENT[num].methodology
      expect(Array.isArray(methodology.tips)).toBe(true)
      expect(methodology.tips.length).toBeGreaterThan(0)
      expect(Array.isArray(methodology.bestPractices)).toBe(true)
      expect(methodology.bestPractices.length).toBeGreaterThan(0)
      expect(typeof methodology.facilitationGuide).toBe('string')
      expect(methodology.facilitationGuide.length).toBeGreaterThan(0)
    }
  })

  it('each step has at least one form', () => {
    for (const num of stepNumbers) {
      expect(STEP_CONTENT[num].forms.length).toBeGreaterThan(0)
    }
  })

  it('each form definition has type, name, description, required fields', () => {
    for (const num of stepNumbers) {
      for (const form of STEP_CONTENT[num].forms) {
        expect(form).toHaveProperty('type')
        expect(form).toHaveProperty('name')
        expect(form).toHaveProperty('description')
        expect(form).toHaveProperty('required')
        expect(typeof form.type).toBe('string')
        expect(typeof form.required).toBe('boolean')
      }
    }
  })
})

/* ============================================================
   Helper functions
   ============================================================ */

describe('getStepForms', () => {
  it('returns forms for step 1 (Identify)', () => {
    const forms = getStepForms(1)
    expect(forms.length).toBeGreaterThanOrEqual(1)
    const types = forms.map((f) => f.type)
    expect(types).toContain('problem_statement')
  })

  it('returns forms for step 4 (Select & Plan)', () => {
    const forms = getStepForms(4)
    const types = forms.map((f) => f.type)
    expect(types).toContain('criteria_matrix')
    expect(types).toContain('implementation_plan')
  })
})

describe('getRequiredForms', () => {
  it('returns only required forms', () => {
    const forms = getRequiredForms(1)
    for (const form of forms) {
      expect(form.required).toBe(true)
    }
  })

  it('step 1 requires problem_statement', () => {
    const forms = getRequiredForms(1)
    const types = forms.map((f) => f.type)
    expect(types).toContain('problem_statement')
  })
})

describe('ALL_FORM_TYPES', () => {
  it('contains all 27 form types', () => {
    expect(ALL_FORM_TYPES).toHaveLength(27)
  })

  it('includes form types from all steps', () => {
    expect(ALL_FORM_TYPES).toContain('problem_statement')
    expect(ALL_FORM_TYPES).toContain('fishbone')
    expect(ALL_FORM_TYPES).toContain('checksheet')
    expect(ALL_FORM_TYPES).toContain('brainstorming')
    expect(ALL_FORM_TYPES).toContain('paired_comparisons')
    expect(ALL_FORM_TYPES).toContain('criteria_matrix')
    expect(ALL_FORM_TYPES).toContain('milestone_tracker')
    expect(ALL_FORM_TYPES).toContain('before_after')
    expect(ALL_FORM_TYPES).toContain('lessons_learned')
    expect(ALL_FORM_TYPES).toContain('balance_sheet')
  })
})
