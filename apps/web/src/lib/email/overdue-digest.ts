/**
 * Overdue ticket digest email template.
 *
 * Sent to org owners/admins on weekday mornings summarising all tickets
 * that are past their due date and not yet done or cancelled.
 * Tickets are grouped by project (with an "Unassigned" catch-all) so the
 * recipient can quickly see where attention is needed.
 */

import { baseTemplate, ctaButton, escapeHtml } from './base-template'

/* ============================================================
   Priority configuration
   ============================================================ */

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#F59E0B',
  low: '#6B7280',
  none: '#9CA3AF',
}

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
}

/* ============================================================
   Types
   ============================================================ */

export type OverdueTicket = {
  id: string
  title: string
  priority: string
  assigneeName: string | null
  daysOverdue: number
  ticketUrl: string
}

export type OverdueProject = {
  projectName: string
  tickets: OverdueTicket[]
}

export type OverdueDigestParams = {
  recipientName: string
  orgName: string
  totalOverdue: number
  projects: OverdueProject[]
  overdueListUrl: string
}

/* ============================================================
   Helpers
   ============================================================ */

const priorityBadge = (priority: string): string => {
  const color = PRIORITY_COLORS[priority.toLowerCase()] ?? PRIORITY_COLORS.none
  const label = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()
  return `<span style="display:inline-block;padding:1px 8px;border-radius:20px;
                       background-color:${color};color:#FFFFFF;font-weight:600;
                       font-size:11px;text-transform:uppercase;white-space:nowrap;">
    ${escapeHtml(label)}
  </span>`
}

const daysOverdueBadge = (days: number): string => {
  const color = days >= 7 ? '#DC2626' : days >= 3 ? '#EA580C' : '#F59E0B'
  const label = days === 1 ? '1 day overdue' : `${days} days overdue`
  return `<span style="font-size:12px;color:${color};font-weight:600;">${escapeHtml(label)}</span>`
}

const renderTicketRow = (ticket: OverdueTicket): string => `
  <tr>
    <td style="padding:12px 16px;border-bottom:1px solid #F3F4F6;vertical-align:top;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <a href="${ticket.ticketUrl}"
               style="font-size:14px;font-weight:600;color:#1B1340;text-decoration:none;
                      display:block;margin-bottom:4px;">
              ${escapeHtml(ticket.title)}
            </a>
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;">${priorityBadge(ticket.priority)}</td>
                <td style="padding-right:12px;">${daysOverdueBadge(ticket.daysOverdue)}</td>
                ${
                  ticket.assigneeName
                    ? `<td style="font-size:12px;color:#6B7280;">
                         Assigned to <strong>${escapeHtml(ticket.assigneeName)}</strong>
                       </td>`
                    : `<td style="font-size:12px;color:#9CA3AF;">Unassigned</td>`
                }
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
`

const renderProjectSection = (project: OverdueProject): string => {
  const sorted = [...project.tickets].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority.toLowerCase()] ?? 4) -
      (PRIORITY_ORDER[b.priority.toLowerCase()] ?? 4),
  )

  const rows = sorted.map(renderTicketRow).join('')

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="margin-bottom:24px;border:1px solid #E5E7EB;border-radius:10px;
                  overflow:hidden;">
      <!-- Project header -->
      <tr>
        <td style="background-color:#F0EDFA;padding:10px 16px;">
          <span style="font-size:13px;font-weight:700;color:#4F46E5;text-transform:uppercase;
                       letter-spacing:0.04em;">
            ${escapeHtml(project.projectName)}
          </span>
          <span style="font-size:12px;color:#6B7280;margin-left:8px;">
            (${project.tickets.length} ${project.tickets.length === 1 ? 'ticket' : 'tickets'})
          </span>
        </td>
      </tr>
      <!-- Ticket rows -->
      ${rows}
    </table>
  `
}

/* ============================================================
   Main template
   ============================================================ */

export const overdueDigestTemplate = ({
  recipientName,
  orgName,
  totalOverdue,
  projects,
  overdueListUrl,
}: OverdueDigestParams): string => {
  const safeName = escapeHtml(recipientName)
  const safeOrg = escapeHtml(orgName)

  const ticketWord = totalOverdue === 1 ? 'ticket' : 'tickets'

  const projectSections = projects.map(renderProjectSection).join('')

  const body = `
    <p style="margin:0 0 8px;">Hi ${safeName},</p>

    <p style="margin:0 0 24px;font-size:15px;color:#374151;">
      There ${totalOverdue === 1 ? 'is' : 'are'} <strong>${totalOverdue} overdue ${ticketWord}</strong>
      in <strong>${safeOrg}</strong> that need attention.
    </p>

    ${projectSections}

    ${ctaButton('View All Overdue Tickets', overdueListUrl)}

    <p style="margin:16px 0 0;font-size:13px;color:#6B7280;">
      This digest is sent on weekday mornings. Tickets with status
      <strong>Done</strong> or <strong>Cancelled</strong> are excluded.
    </p>
  `

  return baseTemplate({
    preheader: `${totalOverdue} overdue ${ticketWord} in ${escapeHtml(orgName)} need attention`,
    body,
  })
}
