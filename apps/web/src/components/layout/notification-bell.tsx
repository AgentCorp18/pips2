'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Ticket, FolderKanban, AtSign, Info, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '@/app/(app)/notifications/actions'
import { createClient } from '@/lib/supabase/client'
import { useNotificationRealtime } from '@/hooks/use-notification-realtime'
import type { Notification, NotificationType } from '@/types/notifications'

/* ============================================================
   Constants
   ============================================================ */

const NOTIFICATIONS_LIMIT = 10

const NOTIFICATION_ICONS: Record<NotificationType, typeof Bell> = {
  ticket_assigned: Ticket,
  ticket_updated: Ticket,
  ticket_commented: Ticket,
  project_updated: FolderKanban,
  mention: AtSign,
  invitation: Info,
  system: Info,
  chat_message: MessageSquare,
  chat_mention: MessageSquare,
}

/* ============================================================
   Helpers
   ============================================================ */

const getEntityUrl = (notification: Notification): string => {
  if (!notification.entity_type || !notification.entity_id) {
    return '/dashboard'
  }

  switch (notification.entity_type) {
    case 'ticket':
      return `/tickets/${notification.entity_id}`
    case 'project':
      return `/projects/${notification.entity_id}`
    case 'chat_channel':
      return `/chat/${notification.entity_id}`
    default:
      return '/dashboard'
  }
}

const formatTimeAgo = (dateStr: string): string => {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch {
    return 'just now'
  }
}

/* ============================================================
   Component
   ============================================================ */

export const NotificationBell = () => {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabaseRef = useRef(createClient())

  // Resolve the current user ID on mount (needed for realtime filter)
  useEffect(() => {
    void supabaseRef.current.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  // Keep a stable ref to the count-refresh function so the realtime callback
  // can call it without needing it as a reactive dependency.
  const refreshUnreadCount = useRef(async () => {
    const count = await getUnreadCount()
    setUnreadCount(count)
  })

  // Fetch unread count once on mount; realtime keeps it up-to-date after that
  useEffect(() => {
    const refresh = async () => {
      const count = await getUnreadCount()
      setUnreadCount(count)
    }
    void refresh()
  }, [])

  // Realtime subscription — replaces the 30-second polling interval
  useNotificationRealtime(userId, {
    onInsert: (notification) => {
      // Increment badge counter immediately
      setUnreadCount((prev) => prev + 1)

      // Prepend to the open dropdown list if it is currently visible
      setNotifications((prev) => [notification, ...prev].slice(0, NOTIFICATIONS_LIMIT))
    },
    onUpdate: (notification) => {
      // Sync read state if this notification was marked as read in another tab
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read_at: notification.read_at } : n)),
      )
      // Re-sync the count from server to stay accurate
      void refreshUnreadCount.current()
    },
  })

  // Fetch notifications when dropdown opens
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    const result = await getNotifications({
      limit: NOTIFICATIONS_LIMIT,
    })
    setNotifications(result.notifications)
    setIsLoading(false)
  }, [])

  // Fetch notifications when dropdown opens
  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      if (open) {
        void fetchNotifications()
      }
    },
    [fetchNotifications],
  )

  // Handle clicking a notification
  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      if (!notification.read_at) {
        await markAsRead(notification.id)
        setUnreadCount((prev) => Math.max(0, prev - 1))
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n,
          ),
        )
      }

      setIsOpen(false)
      const url = getEntityUrl(notification)
      router.push(url)
    },
    [router],
  )

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    const result = await markAllAsRead()
    if (!result.error) {
      setUnreadCount(0)
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at ?? new Date().toISOString(),
        })),
      )
    }
  }, [])

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] p-2 hover:bg-[var(--color-surface-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        >
          <Bell size={20} className="text-[var(--color-text-secondary)]" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(320px,calc(100vw-2rem))]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void handleMarkAllAsRead()
              }}
              aria-label="Mark all notifications as read"
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <CheckCheck size={12} aria-hidden="true" />
              Mark all read
            </button>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Notification list */}
        <DropdownMenuGroup>
          <div className="max-h-80 overflow-y-auto" aria-live="polite" aria-busy={isLoading}>
            {isLoading && notifications.length === 0 && (
              <div
                className="px-3 py-6 text-center text-sm text-[var(--color-text-tertiary)]"
                aria-busy="true"
              >
                Loading...
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-[var(--color-text-tertiary)]">
                No notifications yet
              </div>
            )}

            {notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type] ?? Info
              const isUnread = !notification.read_at

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className="cursor-pointer px-3 py-2.5 focus:bg-[var(--color-surface-secondary)]"
                  onSelect={() => void handleNotificationClick(notification)}
                >
                  <div className="flex w-full items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isUnread
                          ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
                          : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)]'
                      }`}
                    >
                      <Icon size={14} />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span
                        className={`truncate text-sm ${
                          isUnread
                            ? 'font-medium text-[var(--color-text-primary)]'
                            : 'text-[var(--color-text-secondary)]'
                        }`}
                      >
                        {notification.title}
                      </span>
                      {notification.body && (
                        <span className="line-clamp-2 text-xs text-[var(--color-text-tertiary)]">
                          {notification.body}
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--color-text-tertiary)]">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>

                    {isUnread && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]" />
                    )}
                  </div>
                </DropdownMenuItem>
              )
            })}
          </div>
        </DropdownMenuGroup>

        {/* Footer: View all notifications link */}
        <DropdownMenuSeparator />
        <div className="px-3 py-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              router.push('/notifications')
            }}
            className="w-full rounded px-2 py-1.5 text-center text-xs text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            View all notifications
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
