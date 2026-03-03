import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

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

const buildEmailText = (title: string, body: string, entityUrl: string): string => {
  return [
    title,
    '',
    body,
    '',
    `View in PIPS: ${entityUrl}`,
    '',
    '---',
    'You received this email because you have notifications enabled in PIPS.',
    'To unsubscribe, update your notification preferences in Settings.',
  ].join('\n')
}

/* ============================================================
   POST /api/notifications/email
   Sends a notification email via Resend.
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

  const { user_id, type, title, body, entity_type, entity_id } = parsed.data

  // Fetch user profile to get email
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, display_name')
    .eq('id', user_id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Check if Resend API key is configured
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not configured')
    return NextResponse.json({ error: 'Email service not configured' }, { status: 503 })
  }

  // Build email content
  const subject = NOTIFICATION_SUBJECTS[type] ?? 'PIPS — Notification'
  const entityUrl = buildEntityUrl(entity_type, entity_id)
  const text = buildEmailText(title, body, entityUrl)

  // Send email via Resend
  const resend = new Resend(resendApiKey)

  const { error: sendError } = await resend.emails.send({
    from: process.env.NOTIFICATION_FROM_EMAIL ?? 'PIPS <notifications@pips.com>',
    to: [profile.email],
    subject,
    text,
  })

  if (sendError) {
    console.error('Failed to send notification email:', sendError)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  // Mark the notification as emailed
  await supabase
    .from('notifications')
    .update({ email_sent: true })
    .eq('user_id', user_id)
    .eq('entity_id', entity_id)
    .eq('type', type)
    .is('email_sent', false)

  return NextResponse.json({ success: true })
}
