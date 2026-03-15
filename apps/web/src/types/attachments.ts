/**
 * File attachment type definitions
 *
 * Maps to the file_attachments DB table.
 */

import type { ProfileSummary } from './tickets'

export type FileAttachment = {
  id: string
  org_id: string
  ticket_id: string | null
  project_id: string | null
  comment_id: string | null
  file_name: string
  file_size: number
  mime_type: string
  storage_path: string
  storage_bucket: string
  uploaded_by: string
  created_at: string
}

export type FileAttachmentWithUploader = FileAttachment & {
  uploader: ProfileSummary
}
