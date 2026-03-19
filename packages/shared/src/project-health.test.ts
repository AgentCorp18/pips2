import { describe, it, expect } from 'vitest'
import { calculateProjectHealth } from './project-health'
import type { HealthFactors } from './project-health'

/* ============================================================
   Helpers
   ============================================================ */

const perfect: HealthFactors = {
  methodologyDepthPercent: 100,
  daysSinceLastActivity: 0,
  ticketCompletionPercent: 100,
  formsCompletedPercent: 100,
}

const empty: HealthFactors = {
  methodologyDepthPercent: 0,
  daysSinceLastActivity: 365,
  ticketCompletionPercent: 0,
  formsCompletedPercent: 0,
}

/* ============================================================
   calculateProjectHealth — score boundaries
   ============================================================ */

describe('calculateProjectHealth', () => {
  it('returns score 100 for a perfect project', () => {
    const result = calculateProjectHealth(perfect)
    expect(result.score).toBe(100)
    expect(result.label).toBe('Excellent')
    expect(result.color).toBe('#22C55E')
  })

  it('returns score 0 for a dormant project with no activity', () => {
    const result = calculateProjectHealth(empty)
    expect(result.score).toBe(0)
    expect(result.label).toBe('Critical')
    expect(result.color).toBe('#EF4444')
  })

  it('applies correct weights (30/25/25/20)', () => {
    // Only methodology depth filled at 100%, everything else 0
    const depthOnly = calculateProjectHealth({
      ...empty,
      methodologyDepthPercent: 100,
    })
    // Expected: 100*0.30 + 0*0.25 + 0*0.25 + 0*0.20 = 30
    expect(depthOnly.score).toBe(30)
  })

  it('freshness contributes 25 points when active within 3 days', () => {
    const freshOnly = calculateProjectHealth({
      ...empty,
      daysSinceLastActivity: 1,
    })
    // Expected: 0 + 100*0.25 + 0 + 0 = 25
    expect(freshOnly.score).toBe(25)
  })

  it('tickets contribute 25 points when fully complete', () => {
    const ticketsOnly = calculateProjectHealth({
      ...empty,
      ticketCompletionPercent: 100,
    })
    // Expected: 0 + 0 + 100*0.25 + 0 = 25
    expect(ticketsOnly.score).toBe(25)
  })

  it('forms contribute 20 points when fully complete', () => {
    const formsOnly = calculateProjectHealth({
      ...empty,
      formsCompletedPercent: 100,
    })
    // Expected: 0 + 0 + 0 + 100*0.20 = 20
    expect(formsOnly.score).toBe(20)
  })

  it('returns factors unchanged in the result', () => {
    const result = calculateProjectHealth(perfect)
    expect(result.factors).toEqual(perfect)
  })
})

/* ============================================================
   Labels and colors
   ============================================================ */

describe('calculateProjectHealth — labels', () => {
  const scoreAt = (targetScore: number) => {
    // Drive score via methodology depth (30%) + tickets (25%) + forms (20%)
    // Keep freshness at 3 days (100%) so we get +25 from freshness
    // Then tune depth to reach target
    const remainingFromFreshness = 25 // 100 * 0.25
    const needed = targetScore - remainingFromFreshness
    // needed = depth*0.30 + ticket*0.25 + form*0.20
    // Simplify: set tickets and forms to 0, vary depth
    const depthPct = Math.max(0, Math.min(100, (needed / 0.3) * 1))
    return calculateProjectHealth({
      methodologyDepthPercent: depthPct,
      daysSinceLastActivity: 3,
      ticketCompletionPercent: 0,
      formsCompletedPercent: 0,
    })
  }

  it('labels Excellent for score >= 80', () => {
    const result = calculateProjectHealth({
      methodologyDepthPercent: 100,
      daysSinceLastActivity: 1,
      ticketCompletionPercent: 100,
      formsCompletedPercent: 100,
    })
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.label).toBe('Excellent')
  })

  it('labels Critical for score < 20', () => {
    const result = calculateProjectHealth(empty)
    expect(result.score).toBeLessThan(20)
    expect(result.label).toBe('Critical')
  })

  it('labels At Risk for score in 20–39', () => {
    // freshness only: score = 25
    const result = calculateProjectHealth({
      ...empty,
      daysSinceLastActivity: 1,
    })
    expect(result.score).toBe(25)
    expect(result.label).toBe('At Risk')
  })

  it('unused scoreAt helper does not crash', () => {
    // just to confirm helper works at boundaries
    const r = scoreAt(50)
    expect(r.score).toBeGreaterThanOrEqual(0)
  })
})

/* ============================================================
   Freshness thresholds
   ============================================================ */

describe('calculateProjectHealth — freshness thresholds', () => {
  const freshScore = (days: number) =>
    calculateProjectHealth({
      methodologyDepthPercent: 0,
      daysSinceLastActivity: days,
      ticketCompletionPercent: 0,
      formsCompletedPercent: 0,
    }).score

  it('gives full freshness (25 pts) at 0 days', () => {
    expect(freshScore(0)).toBe(25)
  })

  it('gives full freshness (25 pts) at exactly 3 days', () => {
    expect(freshScore(3)).toBe(25)
  })

  it('gives 75% freshness (18.75 → 19 pts) at 4 days', () => {
    // 75 * 0.25 = 18.75 → rounded to 19
    expect(freshScore(4)).toBe(19)
  })

  it('gives 50% freshness at 8 days', () => {
    // 50 * 0.25 = 12.5 → rounded to 13
    expect(freshScore(8)).toBe(13)
  })

  it('gives 25% freshness at 15 days', () => {
    // 25 * 0.25 = 6.25 → rounded to 6
    expect(freshScore(15)).toBe(6)
  })

  it('gives 0 freshness at 31 days', () => {
    expect(freshScore(31)).toBe(0)
  })

  it('gives 0 freshness at very large day values', () => {
    expect(freshScore(999)).toBe(0)
  })
})
