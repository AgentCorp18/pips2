/**
 * Project Health Score — composite measure of how well a project
 * is progressing across four dimensions:
 *   - Methodology depth (30%)
 *   - Activity recency (25%)
 *   - Ticket completion (25%)
 *   - Form coverage (20%)
 *
 * Score range: 0–100
 */

/* ============================================================
   Types
   ============================================================ */

export type HealthFactors = {
  /** 0–100: methodology depth percent (from calculateMethodologyDepth) */
  methodologyDepthPercent: number
  /** Days since any ticket or form was last updated */
  daysSinceLastActivity: number
  /** 0–100: done tickets / total tickets * 100 (0 if no tickets) */
  ticketCompletionPercent: number
  /** 0–100: distinct filled form types / 25 * 100 */
  formsCompletedPercent: number
}

export type HealthLabel = 'Excellent' | 'Good' | 'Needs Attention' | 'At Risk' | 'Critical'

export type HealthScore = {
  /** Composite score 0–100 */
  score: number
  /** Human-readable label */
  label: HealthLabel
  /** Hex color for the label/indicator */
  color: string
  /** Factor breakdown used to compute the score */
  factors: HealthFactors
}

/* ============================================================
   Score Calculation
   ============================================================ */

/**
 * Convert daysSinceLastActivity into a 0–100 freshness score.
 *
 * Thresholds (generous for project work):
 *   ≤ 3 days  → 100  (actively worked)
 *   ≤ 7 days  → 75   (recent activity)
 *   ≤ 14 days → 50   (some lag)
 *   ≤ 30 days → 25   (stale)
 *   > 30 days → 0    (dormant)
 */
const freshnessScore = (days: number): number => {
  if (days <= 3) return 100
  if (days <= 7) return 75
  if (days <= 14) return 50
  if (days <= 30) return 25
  return 0
}

const getLabel = (score: number): HealthLabel => {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Needs Attention'
  if (score >= 20) return 'At Risk'
  return 'Critical'
}

const getColor = (score: number): string => {
  if (score >= 80) return '#22C55E'
  if (score >= 60) return '#3B82F6'
  if (score >= 40) return '#F59E0B'
  if (score >= 20) return '#F97316'
  return '#EF4444'
}

/**
 * Calculate the composite health score for a project.
 *
 * Weights:
 *   - Methodology depth:   30%
 *   - Activity freshness:  25%
 *   - Ticket completion:   25%
 *   - Form coverage:       20%
 */
export const calculateProjectHealth = (factors: HealthFactors): HealthScore => {
  const depthScore = factors.methodologyDepthPercent * 0.3
  const freshness = freshnessScore(factors.daysSinceLastActivity) * 0.25
  const ticketScore = factors.ticketCompletionPercent * 0.25
  const formScore = factors.formsCompletedPercent * 0.2

  const score = Math.round(depthScore + freshness + ticketScore + formScore)

  return {
    score,
    label: getLabel(score),
    color: getColor(score),
    factors,
  }
}
