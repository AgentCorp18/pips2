/**
 * Resolves quick filter keys into actual filter parameters
 * used by server actions. Shared between list and board pages.
 */

import type { QuickFilterKey } from './ticket-quick-filters'

type ResolvedFilters = {
  status?: string[]
  priority?: string[]
  assignee_id?: string
  reporter_id?: string
  unassigned?: boolean
  due_date_before?: string
}

/**
 * Convert an array of active quick filter keys + the current user ID
 * into concrete filter params for the getTickets / getTicketsForBoard actions.
 *
 * When multiple quick filters are active, their constraints are merged:
 * - Array fields (status, priority) are intersected when both set, unioned otherwise
 * - Boolean/string fields are combined with AND logic
 */
export const resolveQuickFilters = (keys: QuickFilterKey[], userId: string): ResolvedFilters => {
  if (keys.length === 0) return {}

  const result: ResolvedFilters = {}

  // Collect status exclusions — "not done/cancelled" means active statuses
  const activeStatuses = ['backlog', 'todo', 'in_progress', 'in_review', 'blocked']
  const needsActiveOnly = keys.some((k) => ['my_open', 'overdue'].includes(k))

  if (needsActiveOnly && !result.status) {
    result.status = activeStatuses
  }

  for (const key of keys) {
    switch (key) {
      case 'my_open':
        result.assignee_id = userId
        break
      case 'overdue': {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        result.due_date_before = today.toISOString().split('T')[0]
        break
      }
      case 'created_by_me':
        result.reporter_id = userId
        break
      case 'unassigned':
        result.unassigned = true
        // If my_open is also active, assignee_id wins conflict — skip unassigned
        if (keys.includes('my_open')) {
          result.unassigned = false
        }
        break
      case 'high_priority':
        result.priority = ['critical', 'high']
        break
    }
  }

  return result
}
