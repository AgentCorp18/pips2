/**
 * Vercel Cron handler — dispatches unsent notification emails.
 *
 * Runs daily (Hobby plan limit). Queries notifications with email_sent = false,
 * checks user notification preferences, sends branded emails via
 * Resend, and marks them as sent.
 *
 * Auth: CRON_SECRET (Vercel standard).
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { ticketAssignedTemplate } from '@/lib/email/ticket-assigned'
import { mentionTemplate } from '@/lib/email/mention'
import { projectUpdatedTemplate } from '@/lib/email/project-updated'
import { baseTemplate, ctaButton, escapeHtml } from '@/lib/email/base-template'
import { getBaseUrl } from '@/lib/base-url'

/* ============================================================
   Types
   ============================================================ */

type NotificationRow = {
  id: string
  org_id: string
  user_id: string
  type: string
  title: string
  body: string | null
  entity_type: string | null
  entity_id: string | null
  created_at: string
}

type UserProfile = {
  id: string
  email: string
  display_name: string | null
  full_name: string | null
}

type NotificationPrefs = {
  email_enabled: boolean
  ticket_assigned: boolean
  mention: boolean
  project_updated: boolean
  ticket_updated: boolean
  ticket_commented: boolean
}

/* ============================================================
   Constants
   ============================================================ */

const BATCH_SIZE = 20

const NOTIFICATION_SUBJECTS: Record<string, string> = {
  ticket_assigned: 'PIPS — Ticket Assigned to You',
  mention: 'PIPS — You Were Mentioned',
  project_updated: 'PIPS — Project Step Advanced',
  ticket_updated: 'PIPS — Ticket Updated',
  ticket_commented: 'PIPS — New Comment on Ticket',
  system: 'PIPS — System Notification',
  chat_message: 'PIPS — New Chat Message',
  chat_mention: 'PIPS — You Were Mentioned in Chat',
}

/** Maps notification type to the preference column name */
const TYPE_TO_PREF: Record<string, keyof NotificationPrefs> = {
  ticket_assigned: 'ticket_assigned',
  mention: 'mention',
  project_updated: 'project_updated',
  ticket_updated: 'ticket_updated',
  ticket_commented: 'ticket_commented',
}

/* ============================================================
   Helpers
   ============================================================ */

const buildEntityUrl = (entityType: string | null, entityId: string | null): string => {
  const baseUrl = getBaseUrl()
  if (!entityType || !entityId) return `${baseUrl}/dashboard`

  switch (entityType) {
    case 'ticket':
      return `${baseUrl}/tickets/${entityId}`
    case 'project':
      return `${baseUrl}/projects/${entityId}`
    case 'channel':
      return `${baseUrl}/chat/${entityId}`
    default:
      return `${baseUrl}/dashboard`
  }
}

const renderEmailHtml = (
  notification: NotificationRow,
  recipientName: string,
  entityUrl: string,
): string => {
  const name = recipientName

  switch (notification.type) {
    case 'ticket_assigned':
      return ticketAssignedTemplate({
        recipientName: name,
        ticketTitle: notification.title,
        ticketId: notification.entity_id ?? '—',
        projectName: 'Project',
        priority: 'medium',
        ticketUrl: entityUrl,
      })

    case 'mention':
    case 'chat_mention':
      return mentionTemplate({
        recipientName: name,
        commenterName: 'Someone',
        commentSnippet: notification.body ?? notification.title,
        entityLabel: 'a conversation',
        mentionUrl: entityUrl,
      })

    case 'project_updated':
      return projectUpdatedTemplate({
        recipientName: name,
        projectName: notification.title,
        newStep: 'next step',
        projectUrl: entityUrl,
      })

    default:
      return baseTemplate({
        preheader: escapeHtml(notification.title),
        body: `
          <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
          <p style="margin:0 0 8px;font-weight:600;font-size:17px;color:#1B1340;">
            ${escapeHtml(notification.title)}
          </p>
          <p style="margin:0 0 20px;">${escapeHtml(notification.body ?? '')}</p>
          ${ctaButton('View in PIPS', entityUrl)}
        `,
      })
  }
}

const isTypeEnabled = (type: string, prefs: NotificationPrefs | null): boolean => {
  // If no preferences row exists, default to all enabled
  if (!prefs) return true
  // Global email toggle
  if (!prefs.email_enabled) return false
  // Check type-specific preference (unknown types default to enabled)
  const prefKey = TYPE_TO_PREF[type]
  if (prefKey) return prefs[prefKey] as boolean
  return true
}

/* ============================================================
   GET /api/cron/dispatch-emails
   ============================================================ */

export const GET = async (request: Request) => {
  // Verify Vercel cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch unsent notifications (last 24h, oldest first)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: notifications, error: fetchError } = await supabase
    .from('notifications')
    .select('id, org_id, user_id, type, title, body, entity_type, entity_id, created_at')
    .eq('email_sent', false)
    .gte('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (fetchError) {
    console.error('[cron/dispatch-emails] Failed to fetch notifications:', fetchError.message)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }

  if (!notifications || notifications.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, failed: 0 })
  }

  // Collect unique user IDs
  const userIds = [...new Set(notifications.map((n: NotificationRow) => n.user_id))]

  // Fetch profiles for all users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, display_name, full_name')
    .in('id', userIds)

  const profileMap = new Map<string, UserProfile>()
  for (const p of profiles ?? []) {
    profileMap.set(p.id, p)
  }

  // Fetch notification preferences for all users (across all their orgs)
  const { data: prefRows } = await supabase
    .from('notification_preferences')
    .select(
      'user_id, org_id, email_enabled, ticket_assigned, mention, project_updated, ticket_updated, ticket_commented',
    )
    .in('user_id', userIds)

  // Key: "userId:orgId" → preferences
  const prefMap = new Map<string, NotificationPrefs>()
  for (const p of prefRows ?? []) {
    prefMap.set(`${p.user_id}:${p.org_id}`, p as NotificationPrefs)
  }

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const notification of notifications as NotificationRow[]) {
    const profile = profileMap.get(notification.user_id)
    if (!profile?.email) {
      skipped++
      // Mark as sent to avoid retrying users without email
      await supabase.from('notifications').update({ email_sent: true }).eq('id', notification.id)
      continue
    }

    // Check preferences
    const prefs = prefMap.get(`${notification.user_id}:${notification.org_id}`) ?? null
    if (!isTypeEnabled(notification.type, prefs)) {
      skipped++
      await supabase.from('notifications').update({ email_sent: true }).eq('id', notification.id)
      continue
    }

    // Build and send email
    const entityUrl = buildEntityUrl(notification.entity_type, notification.entity_id)
    const recipientName = profile.display_name || profile.full_name || 'there'
    const subject = NOTIFICATION_SUBJECTS[notification.type] ?? 'PIPS — Notification'
    const html = renderEmailHtml(notification, recipientName, entityUrl)

    const result = await sendEmail({ to: profile.email, subject, html })

    if (result.success) {
      sent++
      await supabase.from('notifications').update({ email_sent: true }).eq('id', notification.id)
    } else {
      failed++
      console.error(`[cron/dispatch-emails] Failed to send to ${profile.email}:`, result.error)
    }
  }

  console.log(`[cron/dispatch-emails] Processed: sent=${sent} skipped=${skipped} failed=${failed}`)

  return NextResponse.json({ sent, skipped, failed })
}
