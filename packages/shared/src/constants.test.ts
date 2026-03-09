import { describe, it, expect } from 'vitest'
import {
  PIPS_STEPS,
  PIPS_STEP_NAMES,
  PIPS_STEP_COLORS,
  PIPS_STEP_ENUMS,
  stepEnumToNumber,
  stepNumberToEnum,
  BRAND,
  APP_NAME,
} from './constants'

describe('PIPS_STEPS', () => {
  it('has exactly 6 steps', () => {
    expect(PIPS_STEPS).toHaveLength(6)
  })

  it('steps are numbered 1 through 6', () => {
    expect(PIPS_STEPS.map((s) => s.number)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('every step has name, description, color, and icon', () => {
    for (const step of PIPS_STEPS) {
      expect(step.name).toBeTruthy()
      expect(step.description).toBeTruthy()
      expect(step.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(step.icon).toBeTruthy()
    }
  })
})

describe('PIPS_STEP_NAMES', () => {
  it('matches step names from PIPS_STEPS', () => {
    expect(PIPS_STEP_NAMES).toEqual(PIPS_STEPS.map((s) => s.name))
  })
})

describe('PIPS_STEP_COLORS', () => {
  it('matches step colors from PIPS_STEPS', () => {
    expect(PIPS_STEP_COLORS).toEqual(PIPS_STEPS.map((s) => s.color))
  })
})

describe('PIPS_STEP_ENUMS', () => {
  it('has 6 enum values', () => {
    expect(PIPS_STEP_ENUMS).toHaveLength(6)
  })

  it('contains the expected enum values in order', () => {
    expect(PIPS_STEP_ENUMS).toEqual([
      'identify',
      'analyze',
      'generate',
      'select_plan',
      'implement',
      'evaluate',
    ])
  })
})

describe('stepEnumToNumber', () => {
  it('converts each enum to its correct step number', () => {
    expect(stepEnumToNumber('identify')).toBe(1)
    expect(stepEnumToNumber('analyze')).toBe(2)
    expect(stepEnumToNumber('generate')).toBe(3)
    expect(stepEnumToNumber('select_plan')).toBe(4)
    expect(stepEnumToNumber('implement')).toBe(5)
    expect(stepEnumToNumber('evaluate')).toBe(6)
  })

  it('returns 1 for unknown enum values', () => {
    expect(stepEnumToNumber('unknown')).toBe(1)
    expect(stepEnumToNumber('')).toBe(1)
  })
})

describe('stepNumberToEnum', () => {
  it('converts each step number to its correct enum', () => {
    expect(stepNumberToEnum(1)).toBe('identify')
    expect(stepNumberToEnum(2)).toBe('analyze')
    expect(stepNumberToEnum(3)).toBe('generate')
    expect(stepNumberToEnum(4)).toBe('select_plan')
    expect(stepNumberToEnum(5)).toBe('implement')
    expect(stepNumberToEnum(6)).toBe('evaluate')
  })

  it('returns identify for out-of-range numbers', () => {
    expect(stepNumberToEnum(0)).toBe('identify')
    expect(stepNumberToEnum(7)).toBe('identify')
    expect(stepNumberToEnum(-1)).toBe('identify')
  })
})

describe('BRAND', () => {
  it('has primary color', () => {
    expect(BRAND.primary).toBe('#4F46E5')
  })

  it('has all expected color keys', () => {
    expect(Object.keys(BRAND)).toEqual(
      expect.arrayContaining(['primary', 'deep', 'accent', 'cloud', 'amber', 'ink']),
    )
  })
})

describe('APP_NAME', () => {
  it('is PIPS', () => {
    expect(APP_NAME).toBe('PIPS')
  })
})
