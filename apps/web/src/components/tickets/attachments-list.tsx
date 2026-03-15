'use client'

import { useState, useTransition } from 'react'
import {
  Download,
  Trash2,
  FileText,
  Image,
  FileSpreadsheet,
  Film,
  Music,
  Archive,
  File,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormattedDate } from '@/components/ui/formatted-date'
import {
  deleteAttachment,
  getAttachmentUrl,
} from '@/app/(app)/tickets/[ticketId]/attachment-actions'

/* ============================================================
   Types
   ============================================================ */

type AttachmentItem = {
  id: string
  file_name: string
  file_size: number
  mime_type: string
  uploaded_by: string
  created_at: string
  uploader: {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
}

type AttachmentsListProps = {
  attachments: AttachmentItem[]
  currentUserId: string
  onDeleteComplete?: () => void
}

/* ============================================================
   Helpers
   ============================================================ */

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.startsWith('video/')) return Film
  if (mimeType.startsWith('audio/')) return Music
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel'))
    return FileSpreadsheet
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar'))
    return Archive
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text'))
    return FileText
  return File
}

/* ============================================================
   Component
   ============================================================ */

export const AttachmentsList = ({
  attachments,
  currentUserId,
  onDeleteComplete,
}: AttachmentsListProps) => {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  if (attachments.length === 0) return null

  const handleDownload = async (attachmentId: string) => {
    setDownloadingId(attachmentId)
    try {
      const result = await getAttachmentUrl(attachmentId)
      if (result.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer')
      }
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = (attachmentId: string) => {
    setDeletingId(attachmentId)
    startTransition(async () => {
      await deleteAttachment(attachmentId)
      setDeletingId(null)
      onDeleteComplete?.()
    })
  }

  return (
    <div className="space-y-2" data-testid="attachments-list">
      {attachments.map((attachment) => {
        const IconComponent = getFileIcon(attachment.mime_type)
        const canDelete = attachment.uploaded_by === currentUserId

        return (
          <div
            key={attachment.id}
            className="flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors hover:bg-[var(--color-surface)]"
            style={{ borderColor: 'var(--color-border)' }}
            data-testid={`attachment-${attachment.id}`}
          >
            <IconComponent
              size={20}
              className="shrink-0"
              style={{ color: 'var(--color-text-tertiary)' }}
            />

            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
                title={attachment.file_name}
              >
                {attachment.file_name}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {formatFileSize(attachment.file_size)}
                {attachment.uploader && (
                  <> &middot; {attachment.uploader.display_name}</>
                )} &middot; <FormattedDate date={attachment.created_at} />
              </p>
            </div>

            <div className="flex shrink-0 gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => void handleDownload(attachment.id)}
                disabled={isPending || downloadingId === attachment.id}
                aria-label={`Download ${attachment.file_name}`}
                data-testid={`download-attachment-${attachment.id}`}
              >
                <Download size={14} />
              </Button>

              {canDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(attachment.id)}
                  disabled={isPending || deletingId === attachment.id}
                  aria-label={`Delete ${attachment.file_name}`}
                  className="text-destructive hover:text-destructive"
                  data-testid={`delete-attachment-${attachment.id}`}
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
