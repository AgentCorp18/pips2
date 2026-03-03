/**
 * "You were mentioned in a comment" email template.
 */

import { baseTemplate, ctaButton, escapeHtml } from './base-template'

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
  const safeName = escapeHtml(recipientName)
  const safeCommenter = escapeHtml(commenterName)
  const safeSnippet = escapeHtml(commentSnippet)
  const safeEntity = escapeHtml(entityLabel)

  const body = `
    <p style="margin:0 0 16px;">Hi ${safeName},</p>

    <p style="margin:0 0 20px;">
      <strong>${safeCommenter}</strong> mentioned you in a comment on
      <strong>${safeEntity}</strong>:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#F9FAFB;border-radius:10px;
                  border-left:4px solid #4F46E5;margin-bottom:20px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#374151;font-style:italic;line-height:1.5;">
            &ldquo;${safeSnippet}&rdquo;
          </p>
          <p style="margin:8px 0 0;font-size:12px;color:#6B7280;">
            &mdash; ${safeCommenter}
          </p>
        </td>
      </tr>
    </table>

    ${ctaButton('View in PIPS', mentionUrl)}
  `

  return baseTemplate({
    preheader: `${safeCommenter} mentioned you: "${escapeHtml(commentSnippet.slice(0, 60))}..."`,
    body,
  })
}
