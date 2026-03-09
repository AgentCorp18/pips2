'use client'

import { useMemo } from 'react'
import { NotificationItem } from './notification-item'
import { NOTIFICATION_FILTERS } from './notification-filter-bar'
import type { NotificationFilterKey } from './notification-filter-bar'
import type { Notification } from '@/types/notifications'

/* ============================================================
   NotificationFilteredList
   ============================================================ */

type NotificationFilteredListProps = {
  notifications: Notification[]
  activeFilter: NotificationFilterKey
}

export const NotificationFilteredList = ({
  notifications,
  activeFilter,
}: NotificationFilteredListProps) => {
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications

    const filterDef = NOTIFICATION_FILTERS.find((f) => f.key === activeFilter)
    if (!filterDef || filterDef.types.length === 0) return notifications

    return notifications.filter((n) => filterDef.types.includes(n.type))
  }, [notifications, activeFilter])

  if (filteredNotifications.length === 0) {
    return (
      <p
        data-testid="notification-filter-empty"
        className="py-8 text-center text-sm text-[var(--color-text-tertiary)]"
      >
        No notifications match this filter.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {filteredNotifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  )
}
