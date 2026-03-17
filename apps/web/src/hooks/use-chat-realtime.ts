'use client'

import { useEffect, useReducer, useRef } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useChatStore } from '@/stores/chat-store'
import type { ChatMessage } from '@/stores/chat-store'

/* ============================================================
   Types
   ============================================================ */

type RealtimeState = {
  isConnected: boolean
}

type RealtimeAction = { type: 'CONNECTION_CHANGE'; isConnected: boolean }

const realtimeReducer = (state: RealtimeState, action: RealtimeAction): RealtimeState => {
  switch (action.type) {
    case 'CONNECTION_CHANGE':
      return { ...state, isConnected: action.isConnected }
  }
}

/* ============================================================
   Hook
   ============================================================ */

/**
 * Subscribe to real-time chat messages for a specific channel.
 * Routes thread replies to threadMessages store and top-level messages
 * to the main channel messages store.
 */
export const useChatRealtime = (channelId: string | null, currentUserId: string | null) => {
  const [state, dispatch] = useReducer(realtimeReducer, { isConnected: false })
  const supabaseRef = useRef(createClient())
  const wasConnectedRef = useRef(false)
  const {
    appendMessage,
    updateMessage,
    activeChannelId,
    incrementUnread,
    appendThreadMessage,
    updateThreadMessage,
    updateReplyCount,
  } = useChatStore()

  useEffect(() => {
    if (!channelId) return

    const supabase = supabaseRef.current

    const channel = supabase
      .channel(`chat:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage

          if (newMessage.reply_to_id) {
            // Thread reply: route to thread store and update parent reply_count
            appendThreadMessage(newMessage.reply_to_id, newMessage)
            updateReplyCount(channelId, newMessage.reply_to_id, 1)
          } else {
            // Top-level message: route to main channel store
            appendMessage(channelId, newMessage)

            // Increment unread if this channel is not currently active
            // and the message is from someone else
            if (activeChannelId !== channelId && newMessage.author_id !== currentUserId) {
              incrementUnread(channelId)
            }
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const updated = payload.new as ChatMessage
          const updates: Partial<ChatMessage> = {
            body: updated.body,
            edited_at: updated.edited_at,
            deleted_at: updated.deleted_at,
          }

          if (updated.reply_to_id) {
            // Thread reply update
            updateThreadMessage(updated.reply_to_id, updated.id, updates)
            // If soft-deleted, decrement reply_count on the parent
            const prev = payload.old as Partial<ChatMessage>
            if (prev.deleted_at == null && updated.deleted_at != null) {
              updateReplyCount(channelId, updated.reply_to_id, -1)
            }
          } else {
            // Top-level message update
            updateMessage(channelId, updated.id, updates)
          }
        },
      )
      .subscribe((status, err) => {
        const nowConnected = status === 'SUBSCRIBED'
        dispatch({ type: 'CONNECTION_CHANGE', isConnected: nowConnected })

        if (err) {
          console.error(`[chat-realtime] Subscription error for channel ${channelId}:`, err)
          toast.error('Chat connection lost. Reconnecting...', { id: 'chat-connection' })
        } else if (!nowConnected && wasConnectedRef.current) {
          toast.warning('Chat disconnected. Reconnecting...', { id: 'chat-connection' })
        } else if (nowConnected && wasConnectedRef.current === false) {
          // Dismiss any disconnect toast on reconnect (but don't toast on initial connect)
          toast.dismiss('chat-connection')
        }

        wasConnectedRef.current = nowConnected
      })

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [
    channelId,
    activeChannelId,
    currentUserId,
    appendMessage,
    updateMessage,
    incrementUnread,
    appendThreadMessage,
    updateThreadMessage,
    updateReplyCount,
  ])

  return { isConnected: state.isConnected }
}

/* ============================================================
   Membership Realtime Hook
   ============================================================ */

/**
 * Subscribe to real-time membership changes for the current user.
 * Fires onMembershipChange when the user is added to or removed from any channel.
 */
export const useMembershipRealtime = (
  currentUserId: string | null,
  onMembershipChange: () => void,
) => {
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    if (!currentUserId) return

    const supabase = supabaseRef.current

    const channel = supabase
      .channel(`membership:${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_channel_members',
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          onMembershipChange()
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_channel_members',
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          onMembershipChange()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [currentUserId, onMembershipChange])
}
