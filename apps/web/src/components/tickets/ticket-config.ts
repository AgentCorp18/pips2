/**
 * Shared ticket styling configuration.
 *
 * Used by TicketCard, TicketListTable, and BulkActionsBar
 * for consistent status/priority/type presentation.
 */

import type { TicketStatus, TicketPriority, TicketType } from '@/types/tickets'

/* ============================================================
   Status Config
   ============================================================ */

export type StatusConfig = { label: string; className: string }

export const STATUS_CONFIG: Record<TicketStatus, StatusConfig> = {
  backlog: { label: 'Backlog', className: 'bg-gray-100 text-gray-700' },
  todo: { label: 'Todo', className: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700' },
  in_review: { label: 'In Review', className: 'bg-purple-100 text-purple-700' },
  blocked: { label: 'Blocked', className: 'bg-red-100 text-red-700' },
  done: { label: 'Done', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600' },
}

/* ============================================================
   Priority Config
   ============================================================ */

export type PriorityConfig = { label: string; color: string }

export const PRIORITY_CONFIG: Record<TicketPriority, PriorityConfig> = {
  critical: { label: 'Critical', color: '#ef4444' },
  high: { label: 'High', color: '#f97316' },
  medium: { label: 'Medium', color: '#eab308' },
  low: { label: 'Low', color: '#3b82f6' },
  none: { label: 'None', color: '#9ca3af' },
}

/* ============================================================
   Type Config
   ============================================================ */

export type TypeConfig = { label: string }

export const TYPE_CONFIG: Record<TicketType, TypeConfig> = {
  task: { label: 'Task' },
  bug: { label: 'Bug' },
  feature: { label: 'Feature' },
  general: { label: 'General' },
  pips_project: { label: 'PIPS Project' },
  ceo_request: { label: 'CEO Request' },
}

/* ============================================================
   All statuses / priorities as ordered arrays
   ============================================================ */

export const ALL_STATUSES: TicketStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'blocked',
  'done',
  'cancelled',
]

export const ALL_PRIORITIES: TicketPriority[] = ['critical', 'high', 'medium', 'low', 'none']
