/**
 * Cycle-time calculation utilities.
 * All calculations are client-safe (no DB queries).
 */

/** Calculate the number of days between two date strings (fractional) */
export const daysBetween = (start: string, end: string): number => {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return ms / (1000 * 60 * 60 * 24)
}

/** Format a duration in days to a human-readable string */
export const formatDuration = (days: number): string => {
  if (days < 0) return '--'
  if (days < 1) {
    const hours = Math.round(days * 24)
    return hours <= 1 ? '< 1 hour' : `${hours} hours`
  }
  const rounded = Math.round(days * 10) / 10
  return rounded === 1 ? '1 day' : `${rounded} days`
}

/** Get color classification for cycle time aging */
export type AgingLevel = 'green' | 'amber' | 'red'

export const getAgingLevel = (days: number): AgingLevel => {
  if (days <= 3) return 'green'
  if (days <= 7) return 'amber'
  return 'red'
}

export const AGING_COLORS: Record<AgingLevel, string> = {
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
}

/** Calculate cycle time (started_at → resolved_at) for a ticket */
export const getCycleTime = (ticket: {
  started_at: string | null
  resolved_at: string | null
}): number | null => {
  if (!ticket.started_at || !ticket.resolved_at) return null
  return daysBetween(ticket.started_at, ticket.resolved_at)
}

/** Calculate lead time (created_at → resolved_at) for a ticket */
export const getLeadTime = (ticket: {
  created_at: string
  resolved_at: string | null
}): number | null => {
  if (!ticket.resolved_at) return null
  return daysBetween(ticket.created_at, ticket.resolved_at)
}

/** Calculate elapsed time for an in-progress ticket (started_at → now) */
export const getElapsedTime = (ticket: { started_at: string | null }): number | null => {
  if (!ticket.started_at) return null
  return daysBetween(ticket.started_at, new Date().toISOString())
}
