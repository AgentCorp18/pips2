import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import { ticketAssignedTemplate } from '@/lib/email/ticket-assigned'
import { mentionTemplate } from '@/lib/email/mention'
import { projectUpdatedTemplate } from '@/lib/email/project-updated'
import { invitationTemplate } from '@/lib/email/invitation'
import { welcomeTemplate } from '@/lib/email/welcome'
import { baseTemplate, ctaButton, escapeHtml } from '@/lib/email/base-template'

/* ============================================================
   Validation
   ============================================================ */

const emailPayloadSchema = z.object({
  user_id: z.string().uuid(),
  type: z.string().min(1),
  title: z.string().min(1).max(500),
  body: z.string().min(1).max(5000),
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  /** Extra metadata used by branded templates */
  metadata: z.record(z.string(), z.unknown()).optional(),
})

/* ============================================================
   Helpers
   ============================================================ */

const NOTIFICATION_SUBJECTS: Record<string, string> = {
  ticket_assigned: 'PIPS — Ticket Assigned to You',
  mention: 'PIPS — You Were Mentioned',
  project_updated: 'PIPS — Project Step Advanced',
  ticket_updated: 'PIPS — Ticket Updated',
  ticket_commented: 'PIPS — New Comment on Ticket',
  invitation: 'PIPS — You Have Been Invited',
  welcome: 'PIPS — Welcome to PIPS',
  system: 'PIPS — System Notification',
}

const buildEntityUrl = (entityType?: string, entityId?: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.pips.com'

  if (!entityType || !entityId) {
    return `${baseUrl}/dashboard`
  }

  switch (entityType) {
    case 'ticket':
      return `${baseUrl}/tickets/${entityId}`
    case 'project':
      return `${baseUrl}/projects/${entityId}`
    default:
      return `${baseUrl}/dashboard`
  }
}

const str = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.length > 0 ? value : fallback

/* ============================================================
   Template renderer
   Selects the branded template based on notification type,
   falling back to a generic layout for unknown types.
   ============================================================ */

const renderTemplate = (
  type: string,
  title: string,
  body: string,
  entityUrl: string,
  recipientName: string,
  recipientEmail: string,
  meta: Record<string, unknown>,
): string => {
  switch (type) {
    case 'ticket_assigned':
      return ticketAssignedTemplate({
        recipientName,
        ticketTitle: str(meta.ticket_title, title),
        ticketId: str(meta.ticket_id, '—'),
        projectName: str(meta.project_name, 'Unknown project'),
        priority: str(meta.priority, 'medium'),
        ticketUrl: entityUrl,
      })

    case 'mention':
      return mentionTemplate({
        recipientName,
        commenterName: str(meta.commenter_name, 'Someone'),
        commentSnippet: str(meta.comment_snippet, body),
        entityLabel: str(meta.entity_label, 'a conversation'),
        mentionUrl: entityUrl,
      })

    case 'project_updated':
      return projectUpdatedTemplate({
        recipientName,
        projectName: str(meta.project_name, 'Your project'),
        newStep: str(meta.new_step, 'next step'),
        projectUrl: entityUrl,
      })

    case 'invitation':
      return invitationTemplate({
        recipientEmail,
        orgName: str(meta.org_name, 'an organization'),
        role: str(meta.role, 'Member'),
        inviterName: str(meta.inviter_name, 'A team member'),
        acceptUrl: str(meta.accept_url, entityUrl),
      })

    case 'welcome':
      return welcomeTemplate({
        recipientName,
        dashboardUrl: entityUrl,
      })

    default:
      return baseTemplate({
        preheader: escapeHtml(title),
        body: `
          <p style="margin:0 0 16px;">Hi ${escapeHtml(recipientName)},</p>
          <p style="margin:0 0 8px;font-weight:600;font-size:17px;color:#1B1340;">
            ${escapeHtml(title)}
          </p>
          <p style="margin:0 0 20px;">${escapeHtml(body)}</p>
          ${ctaButton('View in PIPS', entityUrl)}
        `,
      })
  }
}

/* ============================================================
   POST /api/notifications/email
   Sends a branded notification email via Resend.
   Guarded by a shared secret header.
   ============================================================ */

export const POST = async (request: Request) => {
  // Verify shared secret
  const secret = request.headers.get('x-notification-secret')
  const expectedSecret = process.env.NOTIFICATION_EMAIL_SECRET

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse and validate request body
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = emailPayloadSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { user_id, type, title, body, entity_type, entity_id, metadata } = parsed.data

  // Fetch user profile to get email
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, display_name')
    .eq('id', user_id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Build email content
  const subject = NOTIFICATION_SUBJECTS[type] ?? 'PIPS — Notification'
  const entityUrl = buildEntityUrl(entity_type, entity_id)
  const recipientName = profile.display_name || profile.full_name || 'there'
  const html = renderTemplate(
    type,
    title,
    body,
    entityUrl,
    recipientName,
    profile.email,
    metadata ?? {},
  )

  // Send email via the sendEmail helper
  const result = await sendEmail({ to: profile.email, subject, html })

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? 'Failed to send email' }, { status: 500 })
  }

  // Mark the notification as emailed
  if (entity_id) {
    await supabase
      .from('notifications')
      .update({ email_sent: true })
      .eq('user_id', user_id)
      .eq('entity_id', entity_id)
      .eq('type', type)
      .is('email_sent', false)
  }

  return NextResponse.json({ success: true, id: result.id })
}
