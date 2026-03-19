'use client'

import { useMemo } from 'react'
import { NotificationItem } from './notification-item'
import { NotificationGroup } from './notification-group'
import { NOTIFICATION_FILTERS } from './notification-filter-bar'
import type { NotificationFilterKey } from './notification-filter-bar'
import type { Notification, NotificationType } from '@/types/notifications'

/* ============================================================
   Urgency grouping — applied when filter is 'all'
   ============================================================ */

/** Notification types that require immediate action from the user. */
const ACTION_NEEDED_TYPES = new Set<NotificationType>(['ticket_assigned', 'invitation'])

/** Notification types that represent a direct mention. */
const MENTION_TYPES = new Set<NotificationType>(['mention', 'chat_mention'])

type GroupedNotifications = {
  actionNeeded: Notification[]
  mentions: Notification[]
  updates: Notification[]
}

const groupByUrgency = (notifications: Notification[]): GroupedNotifications => {
  const actionNeeded: Notification[] = []
  const mentions: Notification[] = []
  const updates: Notification[] = []

  for (const n of notifications) {
    if (ACTION_NEEDED_TYPES.has(n.type) && !n.read_at) {
      actionNeeded.push(n)
    } else if (MENTION_TYPES.has(n.type)) {
      mentions.push(n)
    } else {
      updates.push(n)
    }
  }

  return { actionNeeded, mentions, updates }
}

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

  // Grouped view for 'all' filter
  if (activeFilter === 'all') {
    const { actionNeeded, mentions, updates } = groupByUrgency(filteredNotifications)

    return (
      <div className="space-y-6" data-testid="notification-grouped-view">
        <NotificationGroup
          label="Action Needed"
          badgeColor="red"
          notifications={actionNeeded}
          emptyMessage="No action items — you're all caught up!"
        />
        <NotificationGroup
          label="Mentions"
          badgeColor="blue"
          notifications={mentions}
          emptyMessage="No new mentions."
        />
        <NotificationGroup
          label="Updates"
          badgeColor="gray"
          notifications={updates}
          emptyMessage="No recent updates."
        />
      </div>
    )
  }

  // Flat list for specific filters
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
