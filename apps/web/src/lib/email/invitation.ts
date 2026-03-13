/**
 * "You've been invited to join [org]" email template.
 */

import { baseTemplate, ctaButton, escapeHtml } from './base-template'

export type InvitationParams = {
  recipientEmail: string
  orgName: string
  role: string
  inviterName: string
  acceptUrl: string
}

export const invitationTemplate = ({
  recipientEmail,
  orgName,
  role,
  inviterName,
  acceptUrl,
}: InvitationParams): string => {
  const safeInviter = escapeHtml(inviterName)
  const safeOrg = escapeHtml(orgName)
  const safeRole = escapeHtml(role)
  const safeEmail = escapeHtml(recipientEmail)

  const body = `
    <p style="margin:0 0 16px;">Hi there,</p>

    <p style="margin:0 0 20px;">
      <strong>${safeInviter}</strong> has invited you to join
      <strong>${safeOrg}</strong> on PIPS as
      <strong>${safeRole}</strong>.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#F9FAFB;border-radius:10px;border:1px solid #E5E7EB;
                  margin-bottom:20px;">
      <tr>
        <td style="padding:20px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#6B7280;padding-bottom:8px;">
                Organization: <strong style="color:#1B1340;">${safeOrg}</strong>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6B7280;padding-bottom:8px;">
                Your role: <strong style="color:#1B1340;">${safeRole}</strong>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6B7280;">
                Invited by: <strong style="color:#1B1340;">${safeInviter}</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${ctaButton('Accept Invitation', acceptUrl)}

    <p style="margin:16px 0 0;font-size:13px;color:#6B7280;">
      This invitation was sent to <strong>${safeEmail}</strong>.
      If you weren&rsquo;t expecting this, you can safely ignore it.
    </p>
  `

  return baseTemplate({
    preheader: `${safeInviter} invited you to join ${safeOrg} on PIPS`,
    body,
  })
}
