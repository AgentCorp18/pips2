import { describe, it, expect } from 'vitest'
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  TYPE_CONFIG,
  ALL_STATUSES,
  ALL_PRIORITIES,
} from '../ticket-config'

/* ============================================================
   STATUS_CONFIG
   ============================================================ */

describe('STATUS_CONFIG', () => {
  it('contains all 7 statuses', () => {
    const keys = Object.keys(STATUS_CONFIG)
    expect(keys).toHaveLength(7)
  })

  it('maps all expected statuses', () => {
    const expected = ['backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled']
    expected.forEach((status) => {
      expect(STATUS_CONFIG).toHaveProperty(status)
    })
  })

  it('has label and className for each status', () => {
    Object.values(STATUS_CONFIG).forEach((config) => {
      expect(config).toHaveProperty('label')
      expect(config).toHaveProperty('className')
      expect(config.label).toBeTruthy()
      expect(config.className).toBeTruthy()
    })
  })

  it('has correct labels', () => {
    expect(STATUS_CONFIG.backlog.label).toBe('Backlog')
    expect(STATUS_CONFIG.todo.label).toBe('Todo')
    expect(STATUS_CONFIG.in_progress.label).toBe('In Progress')
    expect(STATUS_CONFIG.in_review.label).toBe('In Review')
    expect(STATUS_CONFIG.blocked.label).toBe('Blocked')
    expect(STATUS_CONFIG.done.label).toBe('Done')
    expect(STATUS_CONFIG.cancelled.label).toBe('Cancelled')
  })
})

/* ============================================================
   PRIORITY_CONFIG
   ============================================================ */

describe('PRIORITY_CONFIG', () => {
  it('contains all 5 priorities', () => {
    const keys = Object.keys(PRIORITY_CONFIG)
    expect(keys).toHaveLength(5)
  })

  it('maps all expected priorities', () => {
    const expected = ['critical', 'high', 'medium', 'low', 'none']
    expected.forEach((priority) => {
      expect(PRIORITY_CONFIG).toHaveProperty(priority)
    })
  })

  it('has label and color for each priority', () => {
    Object.values(PRIORITY_CONFIG).forEach((config) => {
      expect(config).toHaveProperty('label')
      expect(config).toHaveProperty('color')
      expect(config.label).toBeTruthy()
      expect(config.color).toBeTruthy()
    })
  })

  it('has correct labels', () => {
    expect(PRIORITY_CONFIG.critical.label).toBe('Critical')
    expect(PRIORITY_CONFIG.high.label).toBe('High')
    expect(PRIORITY_CONFIG.medium.label).toBe('Medium')
    expect(PRIORITY_CONFIG.low.label).toBe('Low')
    expect(PRIORITY_CONFIG.none.label).toBe('None')
  })

  it('uses valid hex colors', () => {
    Object.values(PRIORITY_CONFIG).forEach((config) => {
      expect(config.color).toMatch(/^#[0-9a-fA-F]{6}$/)
    })
  })
})

/* ============================================================
   TYPE_CONFIG
   ============================================================ */

describe('TYPE_CONFIG', () => {
  it('contains all 6 types', () => {
    const keys = Object.keys(TYPE_CONFIG)
    expect(keys).toHaveLength(6)
  })

  it('maps all expected types', () => {
    const expected = ['task', 'bug', 'feature', 'general', 'pips_project', 'ceo_request']
    expected.forEach((type) => {
      expect(TYPE_CONFIG).toHaveProperty(type)
    })
  })

  it('has a label for each type', () => {
    Object.values(TYPE_CONFIG).forEach((config) => {
      expect(config).toHaveProperty('label')
      expect(config.label).toBeTruthy()
    })
  })

  it('has correct labels', () => {
    expect(TYPE_CONFIG.task.label).toBe('Task')
    expect(TYPE_CONFIG.bug.label).toBe('Bug')
    expect(TYPE_CONFIG.feature.label).toBe('Feature')
    expect(TYPE_CONFIG.general.label).toBe('General')
    expect(TYPE_CONFIG.pips_project.label).toBe('PIPS Project')
  })
})

/* ============================================================
   ALL_STATUSES & ALL_PRIORITIES arrays
   ============================================================ */

describe('ALL_STATUSES', () => {
  it('contains all 7 statuses', () => {
    expect(ALL_STATUSES).toHaveLength(7)
  })

  it('matches STATUS_CONFIG keys', () => {
    const configKeys = Object.keys(STATUS_CONFIG)
    ALL_STATUSES.forEach((status) => {
      expect(configKeys).toContain(status)
    })
  })

  it('is ordered correctly', () => {
    expect(ALL_STATUSES[0]).toBe('backlog')
    expect(ALL_STATUSES[ALL_STATUSES.length - 1]).toBe('cancelled')
  })
})

describe('ALL_PRIORITIES', () => {
  it('contains all 5 priorities', () => {
    expect(ALL_PRIORITIES).toHaveLength(5)
  })

  it('matches PRIORITY_CONFIG keys', () => {
    const configKeys = Object.keys(PRIORITY_CONFIG)
    ALL_PRIORITIES.forEach((priority) => {
      expect(configKeys).toContain(priority)
    })
  })

  it('is ordered from critical to none', () => {
    expect(ALL_PRIORITIES[0]).toBe('critical')
    expect(ALL_PRIORITIES[ALL_PRIORITIES.length - 1]).toBe('none')
  })
})
