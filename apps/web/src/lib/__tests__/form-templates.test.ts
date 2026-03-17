import { describe, it, expect } from 'vitest'
import { SYSTEM_TEMPLATES, VERTICALS } from '../form-templates'

const VALID_STEPS = new Set(['identify', 'analyze', 'generate', 'select_plan', 'implement', 'evaluate'])
const VALID_FORM_TYPES = new Set([
  'balance_sheet',
  'before_after',
  'brainstorming',
  'brainwriting',
  'checksheet',
  'cost_benefit',
  'criteria_matrix',
  'evaluation',
  'fishbone',
  'five_why',
  'force_field',
  'impact_assessment',
  'implementation_checklist',
  'implementation_plan',
  'interviewing',
  'lessons_learned',
  'list_reduction',
  'milestone_tracker',
  'paired_comparisons',
  'pareto',
  'problem_statement',
  'raci',
  'surveying',
  'weighted_voting',
])
const VALID_VERTICALS = new Set(['manufacturing', 'customer_service', 'it', 'hr', 'quality'])

describe('SYSTEM_TEMPLATES', () => {
  it('exports exactly 10 system templates', () => {
    expect(SYSTEM_TEMPLATES).toHaveLength(10)
  })

  it('all template IDs are unique', () => {
    const ids = SYSTEM_TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each template has required top-level fields', () => {
    for (const template of SYSTEM_TEMPLATES) {
      expect(template.id, `${template.id} must have id`).toBeTruthy()
      expect(template.name, `${template.id} must have name`).toBeTruthy()
      expect(template.description, `${template.id} must have description`).toBeTruthy()
      expect(template.icon, `${template.id} must have icon`).toBeTruthy()
      expect(Array.isArray(template.forms), `${template.id} must have forms array`).toBe(true)
    }
  })

  it('each template has a valid vertical', () => {
    for (const template of SYSTEM_TEMPLATES) {
      expect(
        VALID_VERTICALS.has(template.vertical),
        `${template.id} has invalid vertical "${template.vertical}"`,
      ).toBe(true)
    }
  })

  it('each template has at least 2 forms', () => {
    for (const template of SYSTEM_TEMPLATES) {
      expect(
        template.forms.length,
        `${template.id} must have at least 2 forms`,
      ).toBeGreaterThanOrEqual(2)
    }
  })

  it('each form has valid step value', () => {
    for (const template of SYSTEM_TEMPLATES) {
      for (const form of template.forms) {
        expect(
          VALID_STEPS.has(form.step),
          `Template "${template.id}" form "${form.formType}" has invalid step "${form.step}"`,
        ).toBe(true)
      }
    }
  })

  it('each form has valid formType', () => {
    for (const template of SYSTEM_TEMPLATES) {
      for (const form of template.forms) {
        expect(
          VALID_FORM_TYPES.has(form.formType),
          `Template "${template.id}" has invalid formType "${form.formType}"`,
        ).toBe(true)
      }
    }
  })

  it('each form has a title', () => {
    for (const template of SYSTEM_TEMPLATES) {
      for (const form of template.forms) {
        expect(
          form.title,
          `Template "${template.id}" form "${form.formType}" must have a title`,
        ).toBeTruthy()
      }
    }
  })

  it('each form has a non-empty data object', () => {
    for (const template of SYSTEM_TEMPLATES) {
      for (const form of template.forms) {
        expect(
          typeof form.data,
          `Template "${template.id}" form "${form.formType}" must have data object`,
        ).toBe('object')
        expect(
          Object.keys(form.data).length,
          `Template "${template.id}" form "${form.formType}" data must be non-empty`,
        ).toBeGreaterThan(0)
      }
    }
  })

  it('no duplicate formType per template', () => {
    for (const template of SYSTEM_TEMPLATES) {
      const seen = new Set<string>()
      for (const form of template.forms) {
        const key = `${form.step}::${form.formType}`
        expect(
          seen.has(key),
          `Template "${template.id}" has duplicate form "${form.formType}" in step "${form.step}"`,
        ).toBe(false)
        seen.add(key)
      }
    }
  })

  it('manufacturing-defect-reduction exists with correct forms', () => {
    const t = SYSTEM_TEMPLATES.find((t) => t.id === 'manufacturing-defect-reduction')
    expect(t).toBeDefined()
    expect(t!.vertical).toBe('manufacturing')
    expect(t!.forms.map((f) => f.formType)).toContain('problem_statement')
    expect(t!.forms.map((f) => f.formType)).toContain('fishbone')
    expect(t!.forms.map((f) => f.formType)).toContain('criteria_matrix')
  })

  it('customer-service-response-time exists with correct forms', () => {
    const t = SYSTEM_TEMPLATES.find((t) => t.id === 'customer-service-response-time')
    expect(t).toBeDefined()
    expect(t!.vertical).toBe('customer_service')
    expect(t!.forms.map((f) => f.formType)).toContain('five_why')
    expect(t!.forms.map((f) => f.formType)).toContain('brainstorming')
  })

  it('it-incident-reduction exists with correct forms', () => {
    const t = SYSTEM_TEMPLATES.find((t) => t.id === 'it-incident-reduction')
    expect(t).toBeDefined()
    expect(t!.vertical).toBe('it')
    expect(t!.forms.map((f) => f.formType)).toContain('implementation_plan')
  })

  it('employee-onboarding-improvement exists with correct forms', () => {
    const t = SYSTEM_TEMPLATES.find((t) => t.id === 'employee-onboarding-improvement')
    expect(t).toBeDefined()
    expect(t!.vertical).toBe('hr')
    expect(t!.forms.map((f) => f.formType)).toContain('force_field')
    expect(t!.forms.map((f) => f.formType)).toContain('raci')
  })

  it('quality-audit-remediation exists with correct forms', () => {
    const t = SYSTEM_TEMPLATES.find((t) => t.id === 'quality-audit-remediation')
    expect(t).toBeDefined()
    expect(t!.vertical).toBe('quality')
    expect(t!.forms.map((f) => f.formType)).toContain('checksheet')
    expect(t!.forms.map((f) => f.formType)).toContain('implementation_checklist')
  })

  it('process-cycle-time-reduction exists with correct forms', () => {
    const t = SYSTEM_TEMPLATES.find((t) => t.id === 'process-cycle-time-reduction')
    expect(t).toBeDefined()
    expect(t!.vertical).toBe('manufacturing')
    expect(t!.forms.map((f) => f.formType)).toContain('pareto')
    expect(t!.forms.map((f) => f.formType)).toContain('milestone_tracker')
  })

  it('cost-reduction-initiative exists with correct forms', () => {
    const t = SYSTEM_TEMPLATES.find((t) => t.id === 'cost-reduction-initiative')
    expect(t).toBeDefined()
    expect(t!.vertical).toBe('quality')
    expect(t!.forms.map((f) => f.formType)).toContain('cost_benefit')
    expect(t!.forms.map((f) => f.formType)).toContain('balance_sheet')
  })

  it('workplace-safety-improvement exists with correct forms', () => {
    const t = SYSTEM_TEMPLATES.find((t) => t.id === 'workplace-safety-improvement')
    expect(t).toBeDefined()
    expect(t!.vertical).toBe('manufacturing')
    expect(t!.forms.map((f) => f.formType)).toContain('evaluation')
  })

  it('compliance-gap-remediation exists with correct forms', () => {
    const t = SYSTEM_TEMPLATES.find((t) => t.id === 'compliance-gap-remediation')
    expect(t).toBeDefined()
    expect(t!.vertical).toBe('quality')
    expect(t!.forms.map((f) => f.formType)).toContain('checksheet')
    expect(t!.forms.map((f) => f.formType)).toContain('implementation_plan')
  })

  it('customer-satisfaction-nps-improvement exists with correct forms', () => {
    const t = SYSTEM_TEMPLATES.find((t) => t.id === 'customer-satisfaction-nps-improvement')
    expect(t).toBeDefined()
    expect(t!.vertical).toBe('customer_service')
    expect(t!.forms.map((f) => f.formType)).toContain('surveying')
    expect(t!.forms.map((f) => f.formType)).toContain('brainstorming')
  })

  it('fishbone templates have the expected category count', () => {
    const templates = SYSTEM_TEMPLATES.filter((t) =>
      t.forms.some((f) => f.formType === 'fishbone'),
    )
    for (const template of templates) {
      const fishbone = template.forms.find((f) => f.formType === 'fishbone')!
      const cats = fishbone.data['categories'] as unknown[]
      expect(
        cats.length,
        `${template.id} fishbone must have exactly 6 categories`,
      ).toBe(6)
    }
  })

  it('problem_statement forms have all required keys', () => {
    const REQUIRED_KEYS = ['asIs', 'desired', 'gap', 'problemStatement', 'teamMembers', 'problemArea', 'dataSources']
    const templates = SYSTEM_TEMPLATES.filter((t) =>
      t.forms.some((f) => f.formType === 'problem_statement'),
    )
    for (const template of templates) {
      const ps = template.forms.find((f) => f.formType === 'problem_statement')!
      for (const key of REQUIRED_KEYS) {
        expect(
          key in ps.data,
          `${template.id} problem_statement missing key "${key}"`,
        ).toBe(true)
      }
    }
  })
})

describe('VERTICALS', () => {
  it('has exactly 5 verticals', () => {
    expect(Object.keys(VERTICALS)).toHaveLength(5)
  })

  it('each vertical has label and color', () => {
    for (const [key, value] of Object.entries(VERTICALS)) {
      expect(value.label, `${key} must have label`).toBeTruthy()
      expect(value.color, `${key} must have color`).toBeTruthy()
      expect(value.color, `${key} color must start with #`).toMatch(/^#/)
    }
  })
})
