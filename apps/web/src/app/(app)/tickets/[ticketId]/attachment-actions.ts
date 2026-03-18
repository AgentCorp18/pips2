'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import type { FileAttachment } from '@/types/attachments'

/* ============================================================
   Constants
   ============================================================ */

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB (matches Supabase bucket config)
const BUCKET = 'attachments'

/** Dangerous executable file extensions that should be blocked */
const BLOCKED_EXTENSIONS = new Set([
  'exe',
  'bat',
  'cmd',
  'com',
  'msi',
  'scr',
  'pif',
  'vbs',
  'vbe',
  'js',
  'jse',
  'wsf',
  'wsh',
  'ps1',
  'ps2',
  'psc1',
  'psc2',
  'reg',
  'inf',
  'hta',
  'cpl',
  'msp',
  'mst',
])

/* ============================================================
   Types
   ============================================================ */

export type AttachmentActionState = {
  error?: string
  attachment?: FileAttachment
}

/* ============================================================
   getAttachments — list attachments for a ticket
   ============================================================ */

export const getAttachments = async (ticketId: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('file_attachments')
    .select(
      `
      *,
      uploader:profiles!file_attachments_uploaded_by_fkey ( id, display_name, avatar_url )
    `,
    )
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch attachments:', error.message)
    return []
  }

  return data ?? []
}

/* ============================================================
   uploadAttachment — upload a file to a ticket
   ============================================================ */

export const uploadAttachment = async (
  ticketId: string,
  formData: FormData,
): Promise<AttachmentActionState> => {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { error: 'No file provided' }
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File must be 50 MB or smaller' }
  }

  // Validate file extension
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { error: 'This file type is not allowed for security reasons' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to upload files' }
  }

  // Verify ticket exists and get org_id
  const { data: ticket } = await supabase
    .from('tickets')
    .select('org_id')
    .eq('id', ticketId)
    .single()

  if (!ticket) {
    return { error: 'Ticket not found' }
  }

  try {
    await requirePermission(ticket.org_id, 'ticket.update')
  } catch {
    return { error: 'You do not have permission to upload files' }
  }

  // Build storage path: {org_id}/{ticket_id}/{timestamp}-{sanitized_filename}
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${ticket.org_id}/${ticketId}/${timestamp}-${sanitizedName}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError) {
    console.error('Storage upload failed:', uploadError.message)
    return { error: 'Failed to upload file. Please try again.' }
  }

  // Insert metadata into file_attachments table
  const { data: attachment, error: insertError } = await supabase
    .from('file_attachments')
    .insert({
      org_id: ticket.org_id,
      ticket_id: ticketId,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || 'application/octet-stream',
      storage_path: storagePath,
      storage_bucket: BUCKET,
      uploaded_by: user.id,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Failed to save attachment metadata:', insertError.message)
    // Clean up the uploaded file since DB insert failed
    await supabase.storage.from(BUCKET).remove([storagePath])
    return { error: 'Failed to save attachment. Please try again.' }
  }

  revalidatePath(`/tickets/${ticketId}`)
  return { attachment }
}

/* ============================================================
   deleteAttachment — remove a file from a ticket
   ============================================================ */

export const deleteAttachment = async (attachmentId: string): Promise<AttachmentActionState> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  // Fetch attachment to get storage path and verify ownership
  const { data: attachment } = await supabase
    .from('file_attachments')
    .select('*')
    .eq('id', attachmentId)
    .single()

  if (!attachment) {
    return { error: 'Attachment not found' }
  }

  // RLS handles org-level access, but also check user is uploader or admin
  const isUploader = attachment.uploaded_by === user.id
  let isAdmin = false
  if (!isUploader) {
    try {
      await requirePermission(attachment.org_id, 'org.members.manage')
      isAdmin = true
    } catch {
      // Not an admin
    }
  }

  if (!isUploader && !isAdmin) {
    return { error: 'You can only delete your own attachments' }
  }

  // Delete from storage first
  const { error: storageError } = await supabase.storage
    .from(attachment.storage_bucket)
    .remove([attachment.storage_path])

  if (storageError) {
    console.error('Failed to delete file from storage:', storageError.message)
    // Continue to delete DB record anyway — orphaned storage is less bad than stuck UI
  }

  // Delete from database
  const { error: deleteError } = await supabase
    .from('file_attachments')
    .delete()
    .eq('id', attachmentId)

  if (deleteError) {
    console.error('Failed to delete attachment record:', deleteError.message)
    return { error: 'Failed to delete attachment. Please try again.' }
  }

  const ticketId = attachment.ticket_id
  if (ticketId) {
    revalidatePath(`/tickets/${ticketId}`)
  }

  return {}
}

/* ============================================================
   getCommentAttachments — list attachments for a comment
   ============================================================ */

export const getCommentAttachments = async (commentId: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('file_attachments')
    .select(
      `
      *,
      uploader:profiles!file_attachments_uploaded_by_fkey ( id, display_name, avatar_url )
    `,
    )
    .eq('comment_id', commentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch comment attachments:', error.message)
    return []
  }

  return data ?? []
}

/* ============================================================
   getTicketCommentAttachments — all comment attachments for a ticket (batch)
   ============================================================ */

export const getTicketCommentAttachments = async (ticketId: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('file_attachments')
    .select(
      `
      *,
      uploader:profiles!file_attachments_uploaded_by_fkey ( id, display_name, avatar_url )
    `,
    )
    .eq('ticket_id', ticketId)
    .not('comment_id', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch ticket comment attachments:', error.message)
    return []
  }

  return data ?? []
}

/* ============================================================
   uploadCommentAttachment — upload a file to a comment
   ============================================================ */

export const uploadCommentAttachment = async (
  commentId: string,
  ticketId: string,
  formData: FormData,
): Promise<AttachmentActionState> => {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { error: 'No file provided' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File must be 50 MB or smaller' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { error: 'This file type is not allowed for security reasons' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to upload files' }
  }

  // Verify comment exists and get org_id via the ticket
  const { data: comment } = await supabase
    .from('comments')
    .select('org_id, ticket_id')
    .eq('id', commentId)
    .single()

  if (!comment) {
    return { error: 'Comment not found' }
  }

  try {
    await requirePermission(comment.org_id, 'ticket.comment')
  } catch {
    return { error: 'You do not have permission to upload files' }
  }

  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${comment.org_id}/${ticketId}/comments/${commentId}/${timestamp}-${sanitizedName}`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError) {
    console.error('Storage upload failed:', uploadError.message)
    return { error: 'Failed to upload file. Please try again.' }
  }

  const { data: attachment, error: insertError } = await supabase
    .from('file_attachments')
    .insert({
      org_id: comment.org_id,
      ticket_id: ticketId,
      comment_id: commentId,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || 'application/octet-stream',
      storage_path: storagePath,
      storage_bucket: BUCKET,
      uploaded_by: user.id,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Failed to save attachment metadata:', insertError.message)
    await supabase.storage.from(BUCKET).remove([storagePath])
    return { error: 'Failed to save attachment. Please try again.' }
  }

  revalidatePath(`/tickets/${ticketId}`)
  return { attachment }
}

/* ============================================================
   getAttachmentUrl — create a signed URL for download
   ============================================================ */

export const getAttachmentUrl = async (
  attachmentId: string,
): Promise<{ url?: string; error?: string }> => {
  const supabase = await createClient()

  const { data: attachment } = await supabase
    .from('file_attachments')
    .select('storage_path, storage_bucket, file_name')
    .eq('id', attachmentId)
    .single()

  if (!attachment) {
    return { error: 'Attachment not found' }
  }

  // RLS on file_attachments ensures the user has access

  // Create a signed URL valid for 1 hour
  const { data, error } = await supabase.storage
    .from(attachment.storage_bucket)
    .createSignedUrl(attachment.storage_path, 3600, {
      download: attachment.file_name,
    })

  if (error || !data?.signedUrl) {
    console.error('Failed to create signed URL:', error?.message)
    return { error: 'Failed to generate download link' }
  }

  return { url: data.signedUrl }
}
