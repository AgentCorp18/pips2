/**
 * Base HTML email template with PIPS branding.
 *
 * All email templates wrap their content with this shell which provides
 * the indigo-violet header bar, DM Sans font stack, CTA button helper,
 * and a branded footer.
 */

/* ============================================================
   HTML escape helper — prevents XSS in email templates when
   interpolating user-controlled strings (names, titles, etc.)
   ============================================================ */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export const escapeHtml = (unsafe: string): string =>
  unsafe.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch)

const BRAND = {
  primary: '#4F46E5',
  deep: '#1B1340',
  surface: '#F0EDFA',
  text: '#374151',
  muted: '#6B7280',
  white: '#FFFFFF',
  fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
} as const

/* ============================================================
   CTA button helper
   ============================================================ */

export const ctaButton = (label: string, href: string): string => {
  // Sanitize href: only allow http/https URLs to prevent javascript: XSS
  const safeHref = /^https?:\/\//i.test(href) ? escapeHtml(href) : '#'
  const safeLabel = escapeHtml(label)

  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:10px;background-color:${BRAND.primary};">
        <a href="${safeHref}"
           target="_blank"
           style="display:inline-block;padding:12px 28px;font-family:${BRAND.fontFamily};
                  font-size:15px;font-weight:600;color:${BRAND.white};
                  text-decoration:none;border-radius:10px;">
          ${safeLabel}
        </a>
      </td>
    </tr>
  </table>
`
}

/* ============================================================
   Base email shell
   ============================================================ */

export type BaseTemplateParams = {
  preheader?: string
  body: string
  unsubscribeUrl?: string
}

export const baseTemplate = ({ preheader, body, unsubscribeUrl }: BaseTemplateParams): string => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>PIPS</title>
  <!--[if mso]>
  <style>body,table,td{font-family:Arial,sans-serif !important;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#F3F4F6;font-family:${BRAND.fontFamily};
             -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">

  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#F3F4F6;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;background-color:${BRAND.white};
                      border-radius:12px;overflow:hidden;
                      box-shadow:0 1px 3px rgba(27,19,64,0.08);">

          <!-- Header bar -->
          <tr>
            <td style="background-color:${BRAND.primary};padding:20px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:${BRAND.fontFamily};font-size:22px;
                             font-weight:700;color:${BRAND.white};letter-spacing:-0.02em;">
                    PIPS
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;font-family:${BRAND.fontFamily};font-size:15px;
                       line-height:1.6;color:${BRAND.text};">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:${BRAND.surface};
                       border-top:1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:${BRAND.fontFamily};font-size:12px;
                             color:${BRAND.muted};line-height:1.5;">
                    Sent by <strong>PIPS</strong> &mdash; Process Improvement Made Simple
                    <br />
                    You received this email because you have notifications enabled.
                    <br />
                    <a href="${unsubscribeUrl ?? '#'}"
                       style="color:${BRAND.muted};text-decoration:underline;">
                      Unsubscribe
                    </a>
                    &nbsp;&middot;&nbsp;
                    <a href="#" style="color:${BRAND.muted};text-decoration:underline;">
                      Notification settings
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
