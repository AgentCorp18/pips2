'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Edit2, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ChatMessage as ChatMessageType } from '@/stores/chat-store'

type Props = {
  message: ChatMessageType
  currentUserId: string
  onEdit: (messageId: string, body: string) => Promise<void>
  onDelete: (messageId: string) => Promise<void>
}

export const ChatMessage = ({ message, currentUserId, onEdit, onDelete }: Props) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.body)
  const isOwn = message.author_id === currentUserId
  const isDeleted = !!message.deleted_at

  const handleSaveEdit = async () => {
    if (editText.trim() && editText.trim() !== message.body) {
      await onEdit(message.id, editText.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditText(message.body)
    setIsEditing(false)
  }

  if (isDeleted) {
    return (
      <div className="px-4 py-1.5">
        <p className="text-xs italic text-[var(--color-text-tertiary)]">This message was deleted</p>
      </div>
    )
  }

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(message.created_at), { addSuffix: true })
    } catch {
      return 'just now'
    }
  })()

  return (
    <div className="group flex gap-3 px-4 py-1.5 hover:bg-[var(--color-surface-secondary)]">
      {/* Avatar */}
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-subtle)] text-xs font-medium text-[var(--color-primary)]">
        {message.author?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {message.author?.display_name ?? 'Unknown'}
          </span>
          <span className="text-[10px] text-[var(--color-text-tertiary)]">{timeAgo}</span>
          {message.edited_at && (
            <span className="text-[10px] text-[var(--color-text-tertiary)]">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-1 flex items-center gap-2">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSaveEdit()
                if (e.key === 'Escape') handleCancelEdit()
              }}
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={() => void handleSaveEdit()}>
              <Check size={14} />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
              <X size={14} />
            </Button>
          </div>
        ) : (
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap break-words">
            {message.body}
          </p>
        )}
      </div>

      {/* Actions — only for own messages */}
      {isOwn && !isEditing && (
        <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            aria-label="Edit message"
          >
            <Edit2 size={12} />
          </button>
          <button
            type="button"
            onClick={() => void onDelete(message.id)}
            className="rounded p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-error)]"
            aria-label="Delete message"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
