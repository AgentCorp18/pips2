'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { createCommentSchema, updateCommentSchema } from '@/lib/validations'
import { hasPermission } from '@pips/shared'
import type { OrgRole } from '@pips/shared'

/* ============================================================
   Types
   ============================================================ */

export type CommentActionState = {
  error?: string
  fieldErrors?: Record<string, string>
}

/* ============================================================
   Helpers
   ============================================================ */

/** Extract @mentioned user IDs from comment body (matches UUIDs after @) */
const extractMentions = (body: string): string[] => {
  const uuidPattern = /@([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi
  const matches = body.matchAll(uuidPattern)
  return [...matches].map((m) => m[1] as string)
}

/* ============================================================
   addComment
   ============================================================ */

export const addComment = async (ticketId: string, body: string): Promise<CommentActionState> => {
  const result = createCommentSchema.safeParse({ body })
  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string') {
        fieldErrors[field] = issue.message
      }
    }
    return { fieldErrors }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  // Get ticket to verify access
  const { data: ticket } = await supabase
    .from('tickets')
    .select('org_id')
    .eq('id', ticketId)
    .single()

  if (!ticket) {
    return { error: 'Ticket not found' }
  }

  try {
    await requirePermission(ticket.org_id, 'ticket.comment')
  } catch {
    return { error: 'You do not have permission to comment on tickets' }
  }

  const mentions = extractMentions(result.data.body)

  const { error: insertError } = await supabase.from('comments').insert({
    org_id: ticket.org_id,
    ticket_id: ticketId,
    author_id: user.id,
    body: result.data.body,
    mentions,
  })

  if (insertError) {
    console.error('Failed to add comment:', insertError.message)
    return { error: 'Failed to add comment. Please try again.' }
  }

  revalidatePath(`/tickets/${ticketId}`)
  return {}
}

/* ============================================================
   updateComment
   ============================================================ */

export const updateComment = async (
  commentId: string,
  body: string,
): Promise<CommentActionState> => {
  const result = updateCommentSchema.safeParse({ body })
  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string') {
        fieldErrors[field] = issue.message
      }
    }
    return { fieldErrors }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  // Verify ownership
  const { data: comment } = await supabase
    .from('comments')
    .select('author_id, ticket_id, org_id')
    .eq('id', commentId)
    .single()

  if (!comment) {
    return { error: 'Comment not found' }
  }

  if (comment.author_id !== user.id) {
    // Allow admins and owners to edit any comment
    const { data: membership } = await supabase
      .from('org_members')
      .select('role')
      .eq('org_id', comment.org_id)
      .eq('user_id', user.id)
      .maybeSingle()

    const role = membership?.role as OrgRole | undefined
    if (!role || !hasPermission(role, 'ticket.delete')) {
      return { error: 'You can only edit your own comments' }
    }
  }

  const mentions = extractMentions(result.data.body)

  const { error: updateError } = await supabase
    .from('comments')
    .update({
      body: result.data.body,
      mentions,
      edited_at: new Date().toISOString(),
    })
    .eq('id', commentId)

  if (updateError) {
    console.error('Failed to update comment:', updateError.message)
    return { error: 'Failed to update comment. Please try again.' }
  }

  if (comment.ticket_id) {
    revalidatePath(`/tickets/${comment.ticket_id}`)
  }
  return {}
}

/* ============================================================
   deleteComment
   ============================================================ */

export const deleteComment = async (commentId: string): Promise<CommentActionState> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  const { data: comment } = await supabase
    .from('comments')
    .select('author_id, ticket_id, org_id')
    .eq('id', commentId)
    .single()

  if (!comment) {
    return { error: 'Comment not found' }
  }

  if (comment.author_id !== user.id) {
    // Allow admins and owners to delete any comment
    const { data: membership } = await supabase
      .from('org_members')
      .select('role')
      .eq('org_id', comment.org_id)
      .eq('user_id', user.id)
      .maybeSingle()

    const role = membership?.role as OrgRole | undefined
    if (!role || !hasPermission(role, 'ticket.delete')) {
      return { error: 'You can only delete your own comments' }
    }
  }

  const { error: deleteError } = await supabase.from('comments').delete().eq('id', commentId)

  if (deleteError) {
    console.error('Failed to delete comment:', deleteError.message)
    return { error: 'Failed to delete comment. Please try again.' }
  }

  if (comment.ticket_id) {
    revalidatePath(`/tickets/${comment.ticket_id}`)
  }
  return {}
}

/* ============================================================
   getComments
   ============================================================ */

export const getComments = async (ticketId: string) => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Defense-in-depth: verify user has access to the ticket's org
  const { data: ticket } = await supabase
    .from('tickets')
    .select('org_id')
    .eq('id', ticketId)
    .single()

  if (!ticket) return []

  try {
    await requirePermission(ticket.org_id, 'data.view')
  } catch {
    return []
  }

  const { data, error } = await supabase
    .from('comments')
    .select(
      `
      *,
      author:profiles!comments_author_id_fkey ( id, full_name, display_name, avatar_url )
    `,
    )
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch comments:', error.message)
    return []
  }

  return data ?? []
}
