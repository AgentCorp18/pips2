'use client'

import { useState, useCallback } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { NotificationItem } from './notification-item'
import type { Notification } from '@/types/notifications'

/* ============================================================
   NotificationGroup
   Renders a labelled group of notifications with an empty
   state when the group has no items (or all are archived).
   ============================================================ */

type NotificationGroupProps = {
  label: string
  badgeColor: 'red' | 'blue' | 'gray'
  notifications: Notification[]
  emptyMessage: string
}

const BADGE_STYLES: Record<NotificationGroupProps['badgeColor'], string> = {
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]',
}

export const NotificationGroup = ({
  label,
  badgeColor,
  notifications,
  emptyMessage,
}: NotificationGroupProps) => {
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set())

  const handleArchived = useCallback((id: string) => {
    setArchivedIds((prev) => new Set(prev).add(id))
  }, [])

  const visible = notifications.filter((n) => !archivedIds.has(n.id))

  return (
    <section
      data-testid={`notification-group-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className="space-y-3"
    >
      {/* Group header */}
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
          {label}
        </h2>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${BADGE_STYLES[badgeColor]}`}
          data-testid={`notification-group-count-${label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {visible.length}
        </span>
      </div>

      {/* Items or empty state */}
      {visible.length === 0 ? (
        <div
          className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--color-border)] px-4 py-4 text-sm text-[var(--color-text-tertiary)]"
          data-testid={`notification-group-empty-${label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <CheckCircle2 size={16} className="shrink-0 text-[var(--color-success)]" />
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onArchived={handleArchived}
            />
          ))}
        </div>
      )}
    </section>
  )
}
