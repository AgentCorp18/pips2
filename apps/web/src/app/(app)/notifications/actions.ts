'use server'

import { requireAuth } from '@/lib/action-utils'
import type {
  Notification,
  NotificationQueryOptions,
  NotificationListResult,
  NotificationActionResult,
} from '@/types/notifications'

/* ============================================================
   getNotifications
   Returns paginated notifications for a user.
   ============================================================ */

export const getNotifications = async (
  options?: NotificationQueryOptions,
): Promise<NotificationListResult> => {
  const limit = options?.limit ?? 20
  const offset = options?.offset ?? 0
  const unreadOnly = options?.unread_only ?? false

  const auth = await requireAuth()
  if (!auth.success) return { notifications: [], total: 0 }
  const { supabase, user } = auth.ctx

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (unreadOnly) {
    query = query.is('read_at', null)
  }

  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('Failed to fetch notifications:', error.message)
    return { notifications: [], total: 0 }
  }

  return {
    notifications: (data ?? []) as Notification[],
    total: count ?? 0,
  }
}

/* ============================================================
   markAsRead
   Marks a single notification as read.
   ============================================================ */

export const markAsRead = async (notificationId: string): Promise<NotificationActionResult> => {
  const auth = await requireAuth()
  if (!auth.success) return { error: auth.error }
  const { supabase, user } = auth.ctx

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to mark notification as read:', error.message)
    return { error: 'Failed to mark notification as read' }
  }

  return {}
}

/* ============================================================
   markAllAsRead
   Marks all of the current user's notifications as read.
   ============================================================ */

export const markAllAsRead = async (): Promise<NotificationActionResult> => {
  const auth = await requireAuth()
  if (!auth.success) return { error: auth.error }
  const { supabase, user } = auth.ctx

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('Failed to mark all notifications as read:', error.message)
    return { error: 'Failed to mark all notifications as read' }
  }

  return {}
}

/* ============================================================
   getUnreadCount
   Returns the count of unread notifications for a user.
   ============================================================ */

export const getUnreadCount = async (): Promise<number> => {
  const auth = await requireAuth()
  if (!auth.success) return 0
  const { supabase, user } = auth.ctx

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('Failed to get unread count:', error.message)
    return 0
  }

  return count ?? 0
}
