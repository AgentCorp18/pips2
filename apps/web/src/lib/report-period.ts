/**
 * Period utilities for report date-range filtering.
 * Extracted from roi-dashboard/actions.ts to avoid the 'use server'
 * requirement that all exports be async functions.
 */

export type Period = 'this-quarter' | 'last-quarter' | 'ytd' | 'last-12-months' | 'all-time'

export const VALID_PERIODS: Period[] = [
  'this-quarter',
  'last-quarter',
  'ytd',
  'last-12-months',
  'all-time',
]

export const PERIOD_LABELS: Record<Period, string> = {
  'this-quarter': 'This Quarter',
  'last-quarter': 'Last Quarter',
  ytd: 'Year to Date',
  'last-12-months': 'Last 12 Months',
  'all-time': 'All Time',
}

export const parsePeriod = (raw: string | undefined): Period =>
  VALID_PERIODS.includes(raw as Period) ? (raw as Period) : 'this-quarter'

/**
 * Returns { start, end } date boundaries for a given period.
 * Returns null for 'all-time' (no filtering).
 */
export const getPeriodBounds = (
  period: Period,
): { start: Date; end: Date; label: string } | null => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const quarter = Math.floor(month / 3)

  if (period === 'all-time') return null

  if (period === 'this-quarter') {
    const start = new Date(year, quarter * 3, 1)
    const end = new Date(year, quarter * 3 + 3, 0, 23, 59, 59)
    return { start, end, label: `Q${quarter + 1} ${year}` }
  }

  if (period === 'last-quarter') {
    const prevQ = quarter === 0 ? 3 : quarter - 1
    const prevYear = quarter === 0 ? year - 1 : year
    const start = new Date(prevYear, prevQ * 3, 1)
    const end = new Date(prevYear, prevQ * 3 + 3, 0, 23, 59, 59)
    return { start, end, label: `Q${prevQ + 1} ${prevYear}` }
  }

  if (period === 'ytd') {
    const start = new Date(year, 0, 1)
    const end = now
    return { start, end, label: `Year to Date ${year}` }
  }

  if (period === 'last-12-months') {
    const start = new Date(year, month - 12, 1)
    const end = now
    return { start, end, label: 'Last 12 Months' }
  }

  return null
}
