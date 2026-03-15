'use client'

import { useRouter } from 'next/navigation'
import { Paperclip } from 'lucide-react'
import { FileUpload } from './file-upload'
import { AttachmentsList } from './attachments-list'

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

type TicketAttachmentsProps = {
  ticketId: string
  attachments: AttachmentItem[]
  currentUserId: string
}

/* ============================================================
   Component
   ============================================================ */

export const TicketAttachments = ({
  ticketId,
  attachments,
  currentUserId,
}: TicketAttachmentsProps) => {
  const router = useRouter()

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <section data-testid="ticket-attachments-section">
      <div className="mb-3 flex items-center gap-2">
        <Paperclip size={16} style={{ color: 'var(--color-text-tertiary)' }} />
        <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Attachments
          {attachments.length > 0 && (
            <span className="ml-1.5 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              ({attachments.length})
            </span>
          )}
        </h2>
      </div>

      <AttachmentsList
        attachments={attachments}
        currentUserId={currentUserId}
        onDeleteComplete={handleRefresh}
      />

      <div className={attachments.length > 0 ? 'mt-3' : ''}>
        <FileUpload ticketId={ticketId} onUploadComplete={handleRefresh} />
      </div>
    </section>
  )
}
