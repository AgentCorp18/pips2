'use server'

import { requireAuth } from '@/lib/action-utils'

/* ============================================================
   Types
   ============================================================ */

export type TicketChangeEntry = {
  id: string
  action: 'insert' | 'update' | 'delete'
  created_at: string
  user_display_name: string | null
  /** Human-readable description of what changed */
  description: string
}

/* ============================================================
   Helpers — derive human-readable descriptions from audit data
   ============================================================ */

type RawData = Record<string, unknown> | null

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  in_review: 'In Review',
  blocked: 'Blocked',
  done: 'Done',
  cancelled: 'Cancelled',
}

const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'None',
}

const labelStatus = (v: unknown): string =>
  typeof v === 'string' ? (STATUS_LABELS[v] ?? v) : String(v)

const labelPriority = (v: unknown): string =>
  typeof v === 'string' ? (PRIORITY_LABELS[v] ?? v) : String(v)

/** Detect changed scalar fields between old and new JSONB blobs and produce descriptions */
const describeUpdate = (oldData: RawData, newData: RawData, actorName: string): string => {
  if (!oldData || !newData) {
    return `${actorName} updated this ticket`
  }

  const changes: string[] = []

  if (oldData['status'] !== newData['status']) {
    changes.push(
      `Status changed from ${labelStatus(oldData['status'])} to ${labelStatus(newData['status'])}`,
    )
  }

  if (oldData['priority'] !== newData['priority']) {
    changes.push(
      `Priority changed from ${labelPriority(oldData['priority'])} to ${labelPriority(newData['priority'])}`,
    )
  }

  if (oldData['assignee_id'] !== newData['assignee_id']) {
    if (!newData['assignee_id']) {
      changes.push('Assignee removed')
    } else {
      // Assignee name resolved via profile lookup in the caller — use placeholder here
      changes.push('Assignee changed')
    }
  }

  if (oldData['title'] !== newData['title']) {
    changes.push('Title updated')
  }

  if (oldData['description'] !== newData['description']) {
    changes.push('Description updated')
  }

  if (oldData['due_date'] !== newData['due_date']) {
    if (!newData['due_date']) {
      changes.push('Due date removed')
    } else {
      changes.push(`Due date set to ${String(newData['due_date'])}`)
    }
  }

  if (changes.length === 0) {
    return `${actorName} updated this ticket`
  }

  return changes.join(' · ')
}

/* ============================================================
   getTicketAuditLog
   ============================================================ */

export const getTicketAuditLog = async (ticketId: string): Promise<TicketChangeEntry[]> => {
  const auth = await requireAuth()
  if (!auth.success) return []
  const { supabase } = auth.ctx

  const { data: logs, error } = await supabase
    .from('audit_log')
    .select('id, action, old_data, new_data, user_id, created_at')
    .eq('entity_type', 'tickets')
    .eq('entity_id', ticketId)
    .order('created_at', { ascending: true })

  if (error || !logs || logs.length === 0) {
    return []
  }

  // Resolve user display names in a single query
  const userIds = [...new Set(logs.map((l) => l.user_id).filter(Boolean))] as string[]
  const userMap = new Map<string, string>()

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, display_name')
      .in('id', userIds)

    for (const p of profiles ?? []) {
      const name = p.display_name || p.full_name || null
      if (name) {
        userMap.set(p.id, name)
      }
    }
  }

  return logs.map((log) => {
    const actorName = log.user_id ? (userMap.get(log.user_id as string) ?? 'Someone') : 'System'
    const oldData = log.old_data as RawData
    const newData = log.new_data as RawData

    let description: string
    switch (log.action) {
      case 'insert':
        description = `${actorName} created this ticket`
        break
      case 'update':
        description = describeUpdate(oldData, newData, actorName)
        break
      case 'delete':
        description = `${actorName} deleted this ticket`
        break
      default:
        description = `${actorName} performed an action`
    }

    return {
      id: log.id as string,
      action: log.action as 'insert' | 'update' | 'delete',
      created_at: log.created_at as string,
      user_display_name: log.user_id ? (userMap.get(log.user_id as string) ?? null) : null,
      description,
    }
  })
}
