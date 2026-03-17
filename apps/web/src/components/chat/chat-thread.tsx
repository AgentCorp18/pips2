'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatMessage } from './chat-message'
import { ChatCompose } from './chat-compose'
import type { ChatMessage as ChatMessageType } from '@/stores/chat-store'

type Props = {
  channelId: string
  messages: ChatMessageType[]
  currentUserId: string
  hasMore: boolean
  onLoadMore: () => Promise<void>
  onSend: (body: string) => Promise<void>
  onEdit: (messageId: string, body: string) => Promise<void>
  onDelete: (messageId: string) => Promise<void>
  canSend: boolean
  /** Callback to open thread panel for a given message */
  onReply?: (messageId: string) => void
}

export const ChatThread = ({
  channelId,
  messages,
  currentUserId,
  hasMore,
  onLoadMore,
  onSend,
  onEdit,
  onDelete,
  canSend,
  onReply,
}: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const prevMessageCountRef = useRef(messages.length)

  // Scroll to bottom on new messages (unless loading older ones)
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current && !isLoadingMore) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessageCountRef.current = messages.length
  }, [messages.length, isLoadingMore])

  // Scroll to bottom on initial load
  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [channelId])

  const handleLoadMore = useCallback(async () => {
    setIsLoadingMore(true)
    try {
      await onLoadMore()
    } finally {
      setIsLoadingMore(false)
    }
  }, [onLoadMore])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {/* Load more button */}
        {hasMore && (
          <div className="flex justify-center py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleLoadMore()}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Loading...
                </>
              ) : (
                'Load earlier messages'
              )}
            </Button>
          </div>
        )}

        {/* Message list */}
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="py-2">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                currentUserId={currentUserId}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
              />
            ))}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Compose area */}
      {canSend ? (
        <ChatCompose channelId={channelId} onSend={onSend} />
      ) : (
        <div className="border-t border-[var(--color-border)] p-3 text-center text-sm text-[var(--color-text-tertiary)]">
          You don&apos;t have permission to send messages
        </div>
      )}
    </div>
  )
}
