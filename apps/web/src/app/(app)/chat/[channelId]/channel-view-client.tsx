'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { ChatPageClient } from '../chat-page-client'
import { ChatChannelHeader } from '@/components/chat/chat-channel-header'
import { ChatThread } from '@/components/chat/chat-thread'
import { ChatSummaryPanel } from '@/components/chat/chat-summary-panel'
import { useChatRealtime } from '@/hooks/use-chat-realtime'
import { useChatStore } from '@/stores/chat-store'
import { useOrgStore } from '@/stores/org-store'
import { usePermissions } from '@/hooks/use-permissions'
import {
  sendMessage,
  editMessage,
  deleteMessage,
  getMessages,
  markChannelRead,
  generateSummary,
} from '../actions'
import type { ChatChannel, ChatMessage, ChatSummary } from '@/stores/chat-store'

type Props = {
  channel: ChatChannel
  members: { user_id: string; display_name: string; avatar_url: string | null }[]
  initialMessages: ChatMessage[]
  initialHasMore: boolean
  initialChannels: (ChatChannel & { unread_count?: number })[]
}

export const ChannelViewClient = ({
  channel,
  members,
  initialMessages,
  initialHasMore,
  initialChannels,
}: Props) => {
  const { messages, setMessages, setActiveChannel, clearUnread } = useChatStore()
  const org = useOrgStore((s) => s.org)
  const { can } = usePermissions(org?.role ?? null)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [summary, setSummary] = useState<ChatSummary | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Get current user ID from Supabase client
  useEffect(() => {
    const loadUser = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      setCurrentUserId(data.user?.id ?? null)
    }
    void loadUser()
  }, [])

  // Set active channel and hydrate messages
  useEffect(() => {
    setActiveChannel(channel.id)
    setMessages(channel.id, initialMessages)
    void markChannelRead(channel.id)
    clearUnread(channel.id)

    return () => setActiveChannel(null)
  }, [channel.id, initialMessages, setActiveChannel, setMessages, clearUnread])

  // Subscribe to realtime updates
  useChatRealtime(channel.id, currentUserId)

  const channelMessages = messages[channel.id] ?? initialMessages

  // Load more messages
  const handleLoadMore = useCallback(async () => {
    const firstMessage = channelMessages[0]
    if (!firstMessage) return

    const result = await getMessages(channel.id, firstMessage.created_at)
    if (result.data) {
      const { prependMessages } = useChatStore.getState()
      prependMessages(channel.id, result.data.messages)
      setHasMore(result.data.hasMore)
    }
  }, [channel.id, channelMessages])

  // Send message
  const handleSend = useCallback(
    async (body: string) => {
      const result = await sendMessage(channel.id, body)
      if (result.error) {
        toast.error(result.error)
      }
    },
    [channel.id],
  )

  // Edit message
  const handleEdit = useCallback(async (messageId: string, body: string) => {
    const result = await editMessage(messageId, body)
    if (result.error) {
      toast.error(result.error)
    }
  }, [])

  // Delete message
  const handleDelete = useCallback(async (messageId: string) => {
    const result = await deleteMessage(messageId)
    if (result.error) {
      toast.error(result.error)
    }
  }, [])

  // Generate AI summary
  const handleGenerateSummary = useCallback(async () => {
    const result = await generateSummary(channel.id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    if (result.data) {
      setSummary(result.data)
      toast.success('Summary generated')
    }
  }, [channel.id])

  const canSend = can('chat.send')

  return (
    <>
      <ChatPageClient initialChannels={initialChannels} />

      {/* Thread panel — full-width on mobile (sidebar is hidden), flex-1 on desktop */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile back button — navigates to channel list */}
        <div className="flex items-center border-b border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 md:hidden">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-2 py-1 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Back to channel list"
          >
            <ArrowLeft size={16} />
            <span>Channels</span>
          </Link>
        </div>

        <ChatChannelHeader
          channel={channel}
          memberCount={members.length}
          onGenerateSummary={handleGenerateSummary}
        />

        {summary && <ChatSummaryPanel summary={summary} onClose={() => setSummary(null)} />}

        {currentUserId && (
          <ChatThread
            channelId={channel.id}
            messages={channelMessages}
            currentUserId={currentUserId}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onSend={handleSend}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canSend={canSend}
          />
        )}
      </div>
    </>
  )
}
