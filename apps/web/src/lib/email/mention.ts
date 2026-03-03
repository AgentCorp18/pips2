/**
 * "You were mentioned in a comment" email template.
 */

import { baseTemplate, ctaButton } from './base-template'

export type MentionParams = {
  recipientName: string
  commenterName: string
  commentSnippet: string
  entityLabel: string
  mentionUrl: string
}

export const mentionTemplate = ({
  recipientName,
  commenterName,
  commentSnippet,
  entityLabel,
  mentionUrl,
}: MentionParams): string => {
  const body = `
    <p style="margin:0 0 16px;">Hi ${recipientName},</p>

    <p style="margin:0 0 20px;">
      <strong>${commenterName}</strong> mentioned you in a comment on
      <strong>${entityLabel}</strong>:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#F9FAFB;border-radius:10px;
                  border-left:4px solid #4F46E5;margin-bottom:20px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#374151;font-style:italic;line-height:1.5;">
            &ldquo;${commentSnippet}&rdquo;
          </p>
          <p style="margin:8px 0 0;font-size:12px;color:#6B7280;">
            &mdash; ${commenterName}
          </p>
        </td>
      </tr>
    </table>

    ${ctaButton('View in PIPS', mentionUrl)}
  `

  return baseTemplate({
    preheader: `${commenterName} mentioned you: "${commentSnippet.slice(0, 60)}..."`,
    body,
  })
}
