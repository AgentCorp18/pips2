'use client'

import { useState, useRef, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  addComment,
  updateComment,
  deleteComment,
} from '@/app/(app)/tickets/[ticketId]/comment-actions'
import { uploadCommentAttachment } from '@/app/(app)/tickets/[ticketId]/attachment-actions'
import { MoreHorizontal, Pencil, Trash2, User } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { AiAssistButton } from '@/components/ui/ai-assist-button'
import { InlineMarkdown } from '@/components/ui/inline-markdown'
import { AttachmentsList } from '@/components/tickets/attachments-list'
import { CommentFileUpload } from '@/components/tickets/comment-file-upload'

/* ============================================================
   Types
   ============================================================ */

type CommentAttachment = {
  id: string
  file_name: string
  file_size: number
  mime_type: string
  uploaded_by: string
  created_at: string
  comment_id: string | null
  uploader: {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
}

type CommentData = {
  id: string
  body: string
  edited_at: string | null
  created_at: string
  author_id: string
  author: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

type MemberOption = {
  user_id: string
  display_name: string
}

type CommentSectionProps = {
  ticketId: string
  comments: CommentData[]
  currentUserId: string
  members: MemberOption[]
  commentAttachments?: CommentAttachment[]
}

/* ============================================================
   Component
   ============================================================ */

export const CommentSection = ({
  ticketId,
  comments,
  currentUserId,
  members,
  commentAttachments = [],
}: CommentSectionProps) => {
  const [newBody, setNewBody] = useState('')
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [stagedFiles, setStagedFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Group attachments by comment_id for efficient lookup
  const attachmentsByComment = commentAttachments.reduce<Record<string, CommentAttachment[]>>(
    (acc, att) => {
      if (att.comment_id) {
        const list = acc[att.comment_id] ?? []
        list.push(att)
        acc[att.comment_id] = list
      }
      return acc
    },
    {},
  )

  const handleSubmit = () => {
    if (!newBody.trim() && stagedFiles.length === 0) return
    startTransition(async () => {
      const result = await addComment(ticketId, newBody.trim())
      if (result.commentId && stagedFiles.length > 0) {
        // Upload staged files to the new comment
        for (const file of stagedFiles) {
          const formData = new FormData()
          formData.append('file', file)
          await uploadCommentAttachment(result.commentId, ticketId, formData)
        }
      }
      setNewBody('')
      setStagedFiles([])
    })
  }

  const handleUpdate = (commentId: string) => {
    if (!editBody.trim()) return
    startTransition(async () => {
      await updateComment(commentId, editBody.trim())
      setEditingId(null)
      setEditBody('')
    })
  }

  const handleDelete = (commentId: string) => {
    startTransition(async () => {
      await deleteComment(commentId)
    })
  }

  const handleMentionSelect = (member: MemberOption) => {
    // Replace the @... trigger text with @userId
    const textarea = textareaRef.current
    if (textarea) {
      const before = newBody.slice(0, textarea.selectionStart)
      const atIndex = before.lastIndexOf('@')
      const after = newBody.slice(textarea.selectionStart)
      const mention = `@${member.user_id} `
      setNewBody(before.slice(0, atIndex) + mention + after)
    }
    setShowMentions(false)
  }

  const handleBodyChange = (value: string) => {
    setNewBody(value)
    // Show mention popup when user types @
    const lastChar = value.slice(-1)
    if (lastChar === '@') {
      setShowMentions(true)
    } else if (showMentions && (lastChar === ' ' || value.length === 0)) {
      setShowMentions(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2
        className="text-lg font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
        data-testid="comments-heading"
      >
        Comments ({comments.length})
      </h2>

      {/* Comment list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isOwner={comment.author_id === currentUserId}
            isEditing={editingId === comment.id}
            editBody={editBody}
            isPending={isPending}
            attachments={attachmentsByComment[comment.id] ?? []}
            currentUserId={currentUserId}
            onStartEdit={() => {
              setEditingId(comment.id)
              setEditBody(comment.body)
            }}
            onCancelEdit={() => {
              setEditingId(null)
              setEditBody('')
            }}
            onSaveEdit={() => handleUpdate(comment.id)}
            onEditBodyChange={setEditBody}
            onDelete={() => handleDelete(comment.id)}
          />
        ))}

        {comments.length === 0 && (
          <p className="py-6 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            No comments yet. Be the first to comment.
          </p>
        )}
      </div>

      {/* New comment form */}
      <div className="relative space-y-2">
        <div className="flex items-center gap-1">
          <Label>New comment</Label>
          <AiAssistButton
            fieldRef={textareaRef}
            fieldType="comment"
            onAccept={(text) => setNewBody(text)}
          />
        </div>
        <Textarea
          ref={textareaRef}
          value={newBody}
          onChange={(e) => handleBodyChange(e.target.value)}
          data-testid="comment-textarea"
          placeholder="Write a comment... Use @ to mention someone"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />

        {/* @mention dropdown */}
        {showMentions && members.length > 0 && (
          <div
            className="absolute bottom-full z-10 mb-1 max-h-40 w-60 overflow-y-auto rounded-md border shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface-primary)',
              borderColor: 'var(--color-border)',
            }}
          >
            {members.map((m) => (
              <button
                key={m.user_id}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => handleMentionSelect(m)}
              >
                <User size={14} />
                {m.display_name}
              </button>
            ))}
          </div>
        )}

        <CommentFileUpload
          stagedFiles={stagedFiles}
          onFilesChange={setStagedFiles}
          disabled={isPending}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Ctrl+Enter to submit
          </p>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || (!newBody.trim() && stagedFiles.length === 0)}
            data-testid="comment-submit-button"
          >
            {isPending ? 'Posting...' : 'Comment'}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   CommentItem sub-component
   ============================================================ */

type CommentItemProps = {
  comment: CommentData
  isOwner: boolean
  isEditing: boolean
  editBody: string
  isPending: boolean
  attachments: CommentAttachment[]
  currentUserId: string
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onEditBodyChange: (value: string) => void
  onDelete: () => void
}

const CommentItem = ({
  comment,
  isOwner,
  isEditing,
  editBody,
  isPending,
  attachments,
  currentUserId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditBodyChange,
  onDelete,
}: CommentItemProps) => {
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
  })

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {comment.author.avatar_url ? (
            <Image
              src={comment.author.avatar_url}
              alt={comment.author.display_name}
              width={24}
              height={24}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {comment.author.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {comment.author.display_name}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {timeAgo}
            {comment.edited_at && ' (edited)'}
          </span>
        </div>

        {isOwner && !isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" aria-label="Comment actions">
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onStartEdit}>
                <Pencil size={14} />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 size={14} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Body */}
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editBody}
            onChange={(e) => onEditBodyChange(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onSaveEdit} disabled={isPending}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <InlineMarkdown content={comment.body} />
      )}

      {attachments.length > 0 && (
        <div className="mt-3">
          <AttachmentsList attachments={attachments} currentUserId={currentUserId} />
        </div>
      )}
    </div>
  )
}
