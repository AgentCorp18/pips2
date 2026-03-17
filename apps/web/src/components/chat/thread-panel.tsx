'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ChatMessage } from './chat-message'
import { ChatCompose } from './chat-compose'
import { getThreadReplies, sendMessage, editMessage, deleteMessage } from '@/app/(app)/chat/actions'
import { useChatStore } from '@/stores/chat-store'
import type { ChatMessage as ChatMessageType } from '@/stores/chat-store'

type Props = {
  /** The parent message being replied to */
  parentMessage: ChatMessageType
  channelId: string
  currentUserId: string
  onClose: () => void
  canSend: boolean
}

export const ThreadPanel = ({
  parentMessage,
  channelId,
  currentUserId,
  onClose,
  canSend,
}: Props) => {
  const { threadMessages, setThreadMessages } = useChatStore()
  // Start as loaded=false so the loading indicator shows until data arrives
  const [loaded, setLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevReplyCountRef = useRef(0)

  const replies = threadMessages[parentMessage.id] ?? []

  // Load thread replies on mount / when parent changes
  useEffect(() => {
    let cancelled = false
    void getThreadReplies(channelId, parentMessage.id).then((result) => {
      if (cancelled) return
      if (result.data) {
        setThreadMessages(parentMessage.id, result.data.messages)
      } else if (result.error) {
        toast.error(result.error)
      }
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [channelId, parentMessage.id, setThreadMessages])

  // Scroll to bottom when new replies arrive via realtime
  useEffect(() => {
    if (replies.length > prevReplyCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevReplyCountRef.current = replies.length
  }, [replies.length])

  // Scroll to bottom when thread finishes loading
  useEffect(() => {
    if (loaded) {
      bottomRef.current?.scrollIntoView()
    }
  }, [loaded])

  const handleSend = useCallback(
    async (body: string) => {
      const result = await sendMessage(channelId, body, parentMessage.id)
      if (result.error) {
        toast.error(result.error)
      }
    },
    [channelId, parentMessage.id],
  )

  const handleEdit = useCallback(async (messageId: string, body: string) => {
    const result = await editMessage(messageId, body)
    if (result.error) {
      toast.error(result.error)
    }
  }, [])

  const handleDelete = useCallback(async (messageId: string) => {
    const result = await deleteMessage(messageId)
    if (result.error) {
      toast.error(result.error)
    }
  }, [])

  return (
    <div
      className="flex w-full flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] md:w-[350px] md:shrink-0"
      data-testid="thread-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Thread</h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7"
          aria-label="Close thread"
          data-testid="thread-panel-close"
        >
          <X size={14} />
        </Button>
      </div>

      {/* Scrollable content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Parent message */}
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
            <ChatMessage
              message={parentMessage}
              currentUserId={currentUserId}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* Thread replies */}
          {!loaded ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-[var(--color-text-tertiary)]" />
            </div>
          ) : replies.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-[var(--color-text-tertiary)]">
                No replies yet. Start the thread!
              </p>
            </div>
          ) : (
            <div className="py-2">
              {replies.map((reply) => (
                <ChatMessage
                  key={reply.id}
                  message={reply}
                  currentUserId={currentUserId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* Compose area */}
        {canSend ? (
          <ChatCompose channelId={`thread:${parentMessage.id}`} onSend={handleSend} />
        ) : (
          <div className="border-t border-[var(--color-border)] p-3 text-center text-sm text-[var(--color-text-tertiary)]">
            You don&apos;t have permission to send messages
          </div>
        )}
      </div>
    </div>
  )
}
