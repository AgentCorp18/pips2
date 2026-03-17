'use client'

import { useEffect, useReducer, useRef } from 'react'
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
 * Automatically appends new messages and handles edits/deletes.
 */
export const useChatRealtime = (channelId: string | null, currentUserId: string | null) => {
  const [state, dispatch] = useReducer(realtimeReducer, { isConnected: false })
  const supabaseRef = useRef(createClient())
  const { appendMessage, updateMessage, activeChannelId, incrementUnread } = useChatStore()

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
          appendMessage(channelId, newMessage)

          // Increment unread if this channel is not currently active
          // and the message is from someone else
          if (activeChannelId !== channelId && newMessage.author_id !== currentUserId) {
            incrementUnread(channelId)
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
          updateMessage(channelId, updated.id, {
            body: updated.body,
            edited_at: updated.edited_at,
            deleted_at: updated.deleted_at,
          })
        },
      )
      .subscribe((status, err) => {
        dispatch({ type: 'CONNECTION_CHANGE', isConnected: status === 'SUBSCRIBED' })
        if (err) {
          console.error(`[chat-realtime] Subscription error for channel ${channelId}:`, err)
        }
      })

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [channelId, activeChannelId, currentUserId, appendMessage, updateMessage, incrementUnread])

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
