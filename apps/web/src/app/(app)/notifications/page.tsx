import type { Metadata } from 'next'
import { Bell } from 'lucide-react'
import { getNotifications, getUnreadCount } from './actions'
import { NotificationActionsBar } from './notification-actions-bar'
import { NotificationFilterBar } from './notification-filter-bar'
import { NotificationFilteredList } from './notification-filtered-list'
import { NotificationPagination } from './notification-pagination'
import { EmptyState } from '@/components/layout/empty-state'
import type { NotificationFilterKey } from './notification-filter-bar'

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'Your notifications and updates',
}

/* ============================================================
   Constants
   ============================================================ */

const PAGE_SIZE = 20

const VALID_FILTERS: NotificationFilterKey[] = ['all', 'assigned', 'mentions', 'updates']

/* ============================================================
   NotificationsPage
   ============================================================ */

type NotificationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const NotificationsPage = async ({ searchParams }: NotificationsPageProps) => {
  const params = await searchParams
  const offsetParam = typeof params.offset === 'string' ? params.offset : '0'
  const offset = Math.max(0, parseInt(offsetParam, 10) || 0)

  const filterParam = typeof params.filter === 'string' ? params.filter : 'all'
  const activeFilter: NotificationFilterKey = VALID_FILTERS.includes(
    filterParam as NotificationFilterKey,
  )
    ? (filterParam as NotificationFilterKey)
    : 'all'

  const [{ notifications, total }, unreadCount] = await Promise.all([
    getNotifications({ limit: PAGE_SIZE, offset }),
    getUnreadCount(),
  ])

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Notifications
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
              : 'You\u2019re all caught up'}
          </p>
        </div>
        <NotificationActionsBar hasUnread={unreadCount > 0} />
      </div>

      {/* Filter chips */}
      <NotificationFilterBar activeFilter={activeFilter} />

      {/* Notification list or empty state */}
      {notifications.length === 0 && offset === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When you receive notifications about tickets, projects, or mentions, they will appear here."
        />
      ) : (
        <>
          <NotificationFilteredList notifications={notifications} activeFilter={activeFilter} />

          <NotificationPagination total={total} offset={offset} limit={PAGE_SIZE} />
        </>
      )}
    </div>
  )
}

export default NotificationsPage
