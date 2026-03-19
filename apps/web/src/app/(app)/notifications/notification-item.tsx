'use client'

import { useCallback, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Ticket,
  FolderKanban,
  AtSign,
  Info,
  Check,
  MessageSquare,
  Eye,
  Archive,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { markAsRead, archiveNotification } from './actions'
import type { Notification, NotificationType } from '@/types/notifications'

/* ============================================================
   Icon map (mirrors notification-bell.tsx)
   ============================================================ */

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
   NotificationItem
   ============================================================ */

type NotificationItemProps = {
  notification: Notification
  /** When true the item hides itself after being archived */
  onArchived?: (id: string) => void
}

export const NotificationItem = ({ notification, onArchived }: NotificationItemProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRead, setIsRead] = useState(!!notification.read_at)

  const Icon = NOTIFICATION_ICONS[notification.type] ?? Info
  const isUnread = !isRead

  const handleView = useCallback(() => {
    if (isUnread) {
      setIsRead(true)
      startTransition(async () => {
        await markAsRead(notification.id)
      })
    }
    const url = getEntityUrl(notification)
    router.push(url)
  }, [isUnread, notification, router])

  const handleMarkAsRead = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!isUnread) return
      setIsRead(true)
      startTransition(async () => {
        await markAsRead(notification.id)
      })
    },
    [isUnread, notification.id],
  )

  const handleArchive = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      startTransition(async () => {
        await archiveNotification(notification.id)
        onArchived?.(notification.id)
      })
    },
    [notification.id, onArchived],
  )

  return (
    <Card
      data-testid={`notification-item-${notification.id}`}
      className={`transition-shadow hover:shadow-md ${
        isUnread ? 'border-[var(--color-primary)]/30 bg-[var(--color-primary-subtle)]/30' : ''
      } ${isPending ? 'opacity-70' : ''}`}
    >
      <CardContent className="flex items-start gap-3 py-3">
        {/* Icon */}
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isUnread
              ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
              : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)]'
          }`}
        >
          <Icon size={16} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm ${
                isUnread
                  ? 'font-medium text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {notification.title}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <span className="whitespace-nowrap text-xs text-[var(--color-text-tertiary)]">
                {formatTimeAgo(notification.created_at)}
              </span>
              {isUnread && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]" />
              )}
            </div>
          </div>
          {notification.body && (
            <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-text-tertiary)]">
              {notification.body}
            </p>
          )}

          {/* Inline action buttons */}
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-6 gap-1 px-2 text-[10px]"
              onClick={handleView}
              disabled={isPending}
              aria-label="View notification"
              data-testid={`notification-view-${notification.id}`}
            >
              <Eye size={10} />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-[10px] text-[var(--color-text-tertiary)]"
              onClick={handleArchive}
              disabled={isPending}
              aria-label="Archive notification"
              data-testid={`notification-archive-${notification.id}`}
            >
              <Archive size={10} />
              Archive
            </Button>
          </div>
        </div>

        {/* Mark as read button (unread indicator) */}
        {isUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-0.5 h-7 w-7 shrink-0 p-0"
            onClick={handleMarkAsRead}
            disabled={isPending}
            aria-label="Mark as read"
          >
            <Check size={14} />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
