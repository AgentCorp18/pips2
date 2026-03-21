/**
 * Shared number/currency formatting utilities.
 *
 * Use these instead of local formatCurrency helpers to keep display values
 * consistent across report pages, chart tooltips, and card summaries.
 */

/**
 * Format a dollar amount with compact K/M suffixes.
 *
 * - Under $1,000 → "$750"
 * - $1,000–$999,999 → "$45.2K"
 * - $1,000,000+ → "$2.4M"
 */
export const formatCurrency = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toLocaleString()}`
}

/**
 * Format hours with a compact k suffix for large values.
 *
 * - Under 1,000 → "750 hrs"
 * - 1,000+ → "1.2k hrs"
 */
export const formatHours = (value: number): string => {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k hrs`
  return `${value} hrs`
}
