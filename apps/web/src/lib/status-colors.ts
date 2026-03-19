/**
 * Shared color maps for ticket status and priority.
 * Use these constants instead of hardcoding hex values in components.
 */

/** Maps ticket status values to their display colors. */
export const STATUS_COLORS: Record<string, string> = {
  backlog: 'var(--color-text-tertiary)',
  todo: '#6366F1',
  in_progress: '#3B82F6',
  in_review: '#8B5CF6',
  blocked: '#EF4444',
  done: '#22C55E',
  cancelled: 'var(--color-text-tertiary)',
}

/** Maps ticket priority values to their display colors. */
export const PRIORITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#3B82F6',
  none: 'var(--color-text-tertiary)',
}

/**
 * Maps step/project status values to icon colors used in summary views.
 * Separate from ticket STATUS_COLORS because the domain and values differ.
 */
export const STEP_STATUS_COLORS: Record<string, string> = {
  completed: '#22C55E',
  in_progress: '#3B82F6',
  not_started: 'var(--color-text-tertiary)',
}
