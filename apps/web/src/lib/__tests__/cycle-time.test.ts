import { describe, it, expect } from 'vitest'
import {
  daysBetween,
  formatDuration,
  getAgingLevel,
  getCycleTime,
  getLeadTime,
  getElapsedTime,
} from '../cycle-time'

describe('daysBetween', () => {
  it('returns 1 for exactly 24 hours apart', () => {
    expect(daysBetween('2026-03-01T00:00:00Z', '2026-03-02T00:00:00Z')).toBe(1)
  })

  it('returns 0.5 for 12 hours apart', () => {
    expect(daysBetween('2026-03-01T00:00:00Z', '2026-03-01T12:00:00Z')).toBe(0.5)
  })

  it('returns 0 for same timestamp', () => {
    expect(daysBetween('2026-03-01T00:00:00Z', '2026-03-01T00:00:00Z')).toBe(0)
  })

  it('returns negative for reversed dates', () => {
    expect(daysBetween('2026-03-02T00:00:00Z', '2026-03-01T00:00:00Z')).toBe(-1)
  })
})

describe('formatDuration', () => {
  it('formats negative as --', () => {
    expect(formatDuration(-1)).toBe('--')
  })

  it('formats < 1 hour', () => {
    expect(formatDuration(0.02)).toBe('< 1 hour')
  })

  it('formats hours', () => {
    expect(formatDuration(0.5)).toBe('12 hours')
  })

  it('formats 1 day', () => {
    expect(formatDuration(1)).toBe('1 day')
  })

  it('formats multi-day', () => {
    expect(formatDuration(3.5)).toBe('3.5 days')
  })

  it('formats whole days without decimal', () => {
    expect(formatDuration(7)).toBe('7 days')
  })
})

describe('getAgingLevel', () => {
  it('returns green for <= 3 days', () => {
    expect(getAgingLevel(0)).toBe('green')
    expect(getAgingLevel(3)).toBe('green')
  })

  it('returns amber for 3-7 days', () => {
    expect(getAgingLevel(3.1)).toBe('amber')
    expect(getAgingLevel(7)).toBe('amber')
  })

  it('returns red for > 7 days', () => {
    expect(getAgingLevel(7.1)).toBe('red')
    expect(getAgingLevel(30)).toBe('red')
  })
})

describe('getCycleTime', () => {
  it('returns days between started_at and resolved_at', () => {
    const result = getCycleTime({
      started_at: '2026-03-01T00:00:00Z',
      resolved_at: '2026-03-04T00:00:00Z',
    })
    expect(result).toBe(3)
  })

  it('returns null when started_at is null', () => {
    expect(getCycleTime({ started_at: null, resolved_at: '2026-03-04T00:00:00Z' })).toBeNull()
  })

  it('returns null when resolved_at is null', () => {
    expect(getCycleTime({ started_at: '2026-03-01T00:00:00Z', resolved_at: null })).toBeNull()
  })

  it('returns null when both are null', () => {
    expect(getCycleTime({ started_at: null, resolved_at: null })).toBeNull()
  })
})

describe('getLeadTime', () => {
  it('returns days between created_at and resolved_at', () => {
    const result = getLeadTime({
      created_at: '2026-03-01T00:00:00Z',
      resolved_at: '2026-03-06T00:00:00Z',
    })
    expect(result).toBe(5)
  })

  it('returns null when resolved_at is null', () => {
    expect(getLeadTime({ created_at: '2026-03-01T00:00:00Z', resolved_at: null })).toBeNull()
  })
})

describe('getElapsedTime', () => {
  it('returns null when started_at is null', () => {
    expect(getElapsedTime({ started_at: null })).toBeNull()
  })

  it('returns positive days for past started_at', () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const result = getElapsedTime({ started_at: twoDaysAgo.toISOString() })
    expect(result).toBeGreaterThan(1.9)
    expect(result).toBeLessThan(2.1)
  })
})
