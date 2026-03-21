'use client'

import { useCallback, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/stores/chat-store'

type Props = {
  channelId: string
  onSend: (body: string) => Promise<void>
  disabled?: boolean
}

export const ChatCompose = ({ channelId, onSend, disabled }: Props) => {
  const { drafts, setDraft } = useChatStore()
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const draft = drafts[channelId] ?? ''

  const handleSend = useCallback(async () => {
    const trimmed = draft.trim()
    if (!trimmed || isSending) return

    setIsSending(true)
    try {
      await onSend(trimmed)
      setDraft(channelId, '')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } finally {
      setIsSending(false)
    }

    // Refocus textarea after sending
    textareaRef.current?.focus()
  }, [draft, isSending, onSend, channelId, setDraft])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        void handleSend()
      }
    },
    [handleSend],
  )

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDraft(channelId, e.target.value)

      // Auto-resize textarea
      const el = e.target
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    },
    [channelId, setDraft],
  )

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          disabled={disabled || isSending}
          rows={1}
          className="min-h-[36px] max-h-[120px] flex-1 resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          aria-label="Message input"
          data-testid="chat-compose-input"
        />
        <Button
          size="sm"
          onClick={() => void handleSend()}
          disabled={!draft.trim() || isSending || disabled}
          className="h-11 w-11 shrink-0 p-0"
          aria-label="Send message"
          data-testid="chat-send-button"
        >
          <Send size={16} />
        </Button>
      </div>
      <p className="mt-1.5 text-[11px] text-[var(--color-text-tertiary)]">
        Tip: Type @username to mention someone
      </p>
    </div>
  )
}
