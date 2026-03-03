/**
 * Email sending helper — thin wrapper around Resend.
 *
 * Fails silently (logs a warning) when RESEND_API_KEY is not configured
 * so the rest of the app can function without an email provider.
 */

import { Resend } from 'resend'

export type SendEmailParams = {
  to: string | string[]
  subject: string
  html: string
}

export type SendEmailResult = {
  success: boolean
  id?: string
  error?: string
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailParams): Promise<SendEmailResult> => {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY is not set — skipping email send.')
    return { success: false, error: 'Email service not configured' }
  }

  const from = process.env.NOTIFICATION_FROM_EMAIL ?? 'PIPS <notifications@pips.com>'

  const recipients = Array.isArray(to) ? to : [to]

  try {
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from,
      to: recipients,
      subject,
      html,
    })

    if (error) {
      console.error('[email] Resend API error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[email] Unexpected error sending email:', message)
    return { success: false, error: message }
  }
}
