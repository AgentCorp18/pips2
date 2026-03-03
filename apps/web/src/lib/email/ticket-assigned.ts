/**
 * "You've been assigned a ticket" email template.
 */

import { baseTemplate, ctaButton } from './base-template'

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#F59E0B',
  low: '#6B7280',
}

export type TicketAssignedParams = {
  recipientName: string
  ticketTitle: string
  ticketId: string
  projectName: string
  priority: string
  ticketUrl: string
}

export const ticketAssignedTemplate = ({
  recipientName,
  ticketTitle,
  ticketId,
  projectName,
  priority,
  ticketUrl,
}: TicketAssignedParams): string => {
  const priorityColor = PRIORITY_COLORS[priority.toLowerCase()] ?? '#6B7280'
  const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()

  const body = `
    <p style="margin:0 0 16px;">Hi ${recipientName},</p>

    <p style="margin:0 0 20px;">
      A ticket has been assigned to you:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#F9FAFB;border-radius:10px;border:1px solid #E5E7EB;
                  margin-bottom:20px;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#1B1340;">
            ${ticketTitle}
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:16px;font-size:13px;color:#6B7280;">
                ID: <code style="font-family:'JetBrains Mono',monospace;font-size:12px;">${ticketId}</code>
              </td>
              <td style="padding-right:16px;font-size:13px;color:#6B7280;">
                Project: <strong>${projectName}</strong>
              </td>
              <td style="font-size:13px;">
                <span style="display:inline-block;padding:2px 10px;border-radius:20px;
                             background-color:${priorityColor};color:#FFFFFF;font-weight:600;
                             font-size:11px;text-transform:uppercase;">
                  ${priorityLabel}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${ctaButton('View Ticket in PIPS', ticketUrl)}
  `

  return baseTemplate({
    preheader: `Ticket assigned: ${ticketTitle}`,
    body,
  })
}
