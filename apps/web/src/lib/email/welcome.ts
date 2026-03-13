/**
 * "Welcome to PIPS" email template with a getting-started guide.
 */

import { baseTemplate, ctaButton, escapeHtml } from './base-template'

export type WelcomeParams = {
  recipientName: string
  dashboardUrl: string
}

export const welcomeTemplate = ({ recipientName, dashboardUrl }: WelcomeParams): string => {
  const safeName = escapeHtml(recipientName)
  const stepRow = (number: string, color: string, title: string, description: string): string => `
    <tr>
      <td style="padding:8px 0;vertical-align:top;width:36px;">
        <span style="display:inline-block;width:28px;height:28px;border-radius:50%;
                     background-color:${color};color:#FFFFFF;font-weight:700;
                     font-size:13px;text-align:center;line-height:28px;">
          ${number}
        </span>
      </td>
      <td style="padding:8px 0 8px 12px;vertical-align:top;">
        <p style="margin:0;font-weight:600;font-size:14px;color:#1B1340;">${title}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">${description}</p>
      </td>
    </tr>
  `

  const body = `
    <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1B1340;">
      Welcome to PIPS, ${safeName}!
    </p>

    <p style="margin:0 0 24px;">
      PIPS helps your team drive continuous improvement through a proven
      6-step methodology. Here&rsquo;s how to get started:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="margin-bottom:24px;">
      ${stepRow('1', '#3B82F6', 'Create a project', 'Define a problem statement and set measurable goals.')}
      ${stepRow('2', '#F59E0B', 'Invite your team', 'Add members to collaborate on analysis and solutions.')}
      ${stepRow('3', '#10B981', 'Work through the steps', 'Use built-in tools for root cause analysis, brainstorming, and planning.')}
      ${stepRow('4', '#6366F1', 'Track with tickets', 'Break work into actionable tickets with priorities and deadlines.')}
      ${stepRow('5', '#CA8A04', 'Implement and measure', 'Execute your plan and track progress against goals.')}
      ${stepRow('6', '#0891B2', 'Evaluate and improve', 'Review results, capture lessons learned, and start the next cycle.')}
    </table>

    ${ctaButton('Go to Your Dashboard', dashboardUrl)}

    <p style="margin:16px 0 0;font-size:13px;color:#6B7280;">
      Questions? Reply to this email or visit our help center.
    </p>
  `

  return baseTemplate({
    preheader: 'Welcome to PIPS — Process Improvement Made Simple',
    body,
  })
}
