/**
 * Vercel Cron handler — sends overdue ticket digest emails.
 *
 * Runs at 9am EST on weekdays (see vercel.json for schedule).
 * Queries all tickets where due_date < today AND status NOT IN
 * ('done', 'cancelled'), groups them by org → project → assignee,
 * then emails a digest to every owner/admin in each affected org.
 *
 * Auth: CRON_SECRET (Vercel standard).
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send'
import { overdueDigestTemplate } from '@/lib/email/overdue-digest'
import type { OverdueProject, OverdueTicket } from '@/lib/email/overdue-digest'
import { getBaseUrl } from '@/lib/base-url'

/* ============================================================
   Types
   ============================================================ */

type TicketRow = {
  id: string
  org_id: string
  title: string
  priority: string
  status: string
  due_date: string
  assignee_id: string | null
  project_id: string | null
  projects: { title: string } | null
  assignee: { display_name: string | null; full_name: string | null } | null
}

type AdminRow = {
  user_id: string
  role: string
  profiles: { email: string; display_name: string | null; full_name: string | null } | null
}

/* ============================================================
   Helpers
   ============================================================ */

const daysBetween = (dueDateStr: string): number => {
  const due = new Date(dueDateStr)
  const now = new Date()
  // Normalise both to midnight UTC to get whole-day difference
  due.setUTCHours(0, 0, 0, 0)
  now.setUTCHours(0, 0, 0, 0)
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
}

const assigneeName = (ticket: TicketRow): string | null => {
  if (!ticket.assignee) return null
  return ticket.assignee.display_name || ticket.assignee.full_name || null
}

/** Group ticket rows into the OverdueProject[] shape expected by the template */
const groupByProject = (tickets: TicketRow[], baseUrl: string): OverdueProject[] => {
  const projectMap = new Map<string, OverdueProject>()

  for (const t of tickets) {
    const projectName = t.projects?.title ?? 'No Project'
    const projectKey = t.project_id ?? '__none__'

    if (!projectMap.has(projectKey)) {
      projectMap.set(projectKey, { projectName, tickets: [] })
    }

    const overdueTicket: OverdueTicket = {
      id: t.id,
      title: t.title,
      priority: t.priority,
      assigneeName: assigneeName(t),
      daysOverdue: daysBetween(t.due_date),
      ticketUrl: `${baseUrl}/tickets/${t.id}`,
    }

    projectMap.get(projectKey)!.tickets.push(overdueTicket)
  }

  // Sort: projects with most overdue tickets first
  return Array.from(projectMap.values()).sort((a, b) => b.tickets.length - a.tickets.length)
}

/* ============================================================
   GET /api/cron/overdue-digest
   ============================================================ */

export const GET = async (request: Request) => {
  // Verify Vercel cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const baseUrl = getBaseUrl()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // -----------------------------------------------------------------
  // 1. Fetch all overdue tickets (due_date < today, not done/cancelled)
  // -----------------------------------------------------------------
  const { data: ticketRows, error: ticketsError } = await supabase
    .from('tickets')
    .select(
      `id, org_id, title, priority, status, due_date, assignee_id, project_id,
       projects:project_id ( title ),
       assignee:assignee_id ( display_name, full_name )`,
    )
    .lt('due_date', today)
    .not('status', 'in', '("done","cancelled")')
    .order('due_date', { ascending: true })

  if (ticketsError) {
    console.error('[cron/overdue-digest] Failed to fetch tickets:', ticketsError.message)
    return NextResponse.json({ error: 'Failed to fetch overdue tickets' }, { status: 500 })
  }

  const tickets = (ticketRows ?? []) as unknown as TicketRow[]

  if (tickets.length === 0) {
    return NextResponse.json({ orgsNotified: 0, emailsSent: 0, emailsFailed: 0 })
  }

  // -----------------------------------------------------------------
  // 2. Determine which orgs have overdue tickets
  // -----------------------------------------------------------------
  const affectedOrgIds = [...new Set(tickets.map((t) => t.org_id))]

  // -----------------------------------------------------------------
  // 3. Fetch org names
  // -----------------------------------------------------------------
  const { data: orgRows } = await supabase
    .from('organizations')
    .select('id, name')
    .in('id', affectedOrgIds)

  const orgNames = new Map<string, string>()
  for (const o of orgRows ?? []) {
    orgNames.set(o.id, o.name as string)
  }

  // -----------------------------------------------------------------
  // 4. Fetch owners + admins for those orgs (with their profile/email)
  // -----------------------------------------------------------------
  const { data: adminRows, error: adminsError } = await supabase
    .from('org_members')
    .select(
      `user_id, role, org_id,
       profiles:user_id ( email, display_name, full_name )`,
    )
    .in('org_id', affectedOrgIds)
    .in('role', ['owner', 'admin'])

  if (adminsError) {
    console.error('[cron/overdue-digest] Failed to fetch org admins:', adminsError.message)
    return NextResponse.json({ error: 'Failed to fetch org admins' }, { status: 500 })
  }

  // Key: org_id → list of admin rows
  const adminsByOrg = new Map<string, Array<AdminRow & { org_id: string }>>()
  for (const row of (adminRows ?? []) as unknown as Array<AdminRow & { org_id: string }>) {
    const existing = adminsByOrg.get(row.org_id) ?? []
    existing.push(row)
    adminsByOrg.set(row.org_id, existing)
  }

  // -----------------------------------------------------------------
  // 5. Send one digest per org
  // -----------------------------------------------------------------
  let emailsSent = 0
  let emailsFailed = 0
  let orgsNotified = 0

  for (const orgId of affectedOrgIds) {
    const orgTickets = tickets.filter((t) => t.org_id === orgId)
    const orgName = orgNames.get(orgId) ?? 'Your Organisation'
    const admins = adminsByOrg.get(orgId) ?? []

    if (admins.length === 0) {
      console.warn(`[cron/overdue-digest] No owners/admins found for org ${orgId} — skipping.`)
      continue
    }

    const projectGroups = groupByProject(orgTickets, baseUrl)
    const overdueListUrl = `${baseUrl}/tickets?status=overdue`

    const subject = `PIPS: ${orgTickets.length} overdue ${orgTickets.length === 1 ? 'ticket' : 'tickets'} need attention`

    for (const admin of admins) {
      const profile = admin.profiles
      if (!profile?.email) continue

      const recipientName = profile.display_name || profile.full_name || 'there'

      const html = overdueDigestTemplate({
        recipientName,
        orgName,
        totalOverdue: orgTickets.length,
        projects: projectGroups,
        overdueListUrl,
      })

      const result = await sendEmail({ to: profile.email, subject, html })

      if (result.success) {
        emailsSent++
      } else {
        emailsFailed++
        console.error(
          `[cron/overdue-digest] Failed to send to ${profile.email} (org ${orgId}):`,
          result.error,
        )
      }
    }

    orgsNotified++
  }

  return NextResponse.json({ orgsNotified, emailsSent, emailsFailed })
}
