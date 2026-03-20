'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/notifications'

/* ============================================================
   Types
   ============================================================ */

type NotificationRealtimeCallbacks = {
  /** Called when a new (INSERT) notification arrives for this user. */
  onInsert: (notification: Notification) => void
  /** Called when a notification is updated (e.g. marked as read). */
  onUpdate: (notification: Notification) => void
}

/* ============================================================
   Hook
   ============================================================ */

/**
 * Subscribe to real-time changes on the notifications table for a given user.
 *
 * On INSERT: fires onInsert callback + shows a toast for high-signal types.
 * On UPDATE: fires onUpdate callback (e.g. read_at was set by another tab).
 *
 * Mirrors the pattern established in use-chat-realtime.ts.
 */
export const useNotificationRealtime = (
  userId: string | null,
  callbacks: NotificationRealtimeCallbacks,
) => {
  const supabaseRef = useRef(createClient())
  const callbacksRef = useRef(callbacks)

  // Keep callbacks ref up-to-date without re-subscribing on every render
  useEffect(() => {
    callbacksRef.current = callbacks
  })

  useEffect(() => {
    if (!userId) return

    const supabase = supabaseRef.current

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification
          callbacksRef.current.onInsert(notification)

          // Show a toast for actionable notification types
          const TOAST_TYPES = new Set([
            'ticket_assigned',
            'ticket_commented',
            'mention',
            'chat_mention',
            'invitation',
          ])
          if (TOAST_TYPES.has(notification.type)) {
            toast.info(notification.title, {
              description: notification.body ?? undefined,
              duration: 4000,
            })
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification
          callbacksRef.current.onUpdate(notification)
        },
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('[notification-realtime] Subscription error:', err)
        }
        // Suppress status logging — notifications are non-critical infra
        void status
      })

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [userId])
}
