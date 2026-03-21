/**
 * HMAC-signed share tokens for read-only public report links.
 *
 * Token format (base64url-encoded):
 *   `{orgId}:{reportType}:{period}:{timestamp}:{sig}`
 *
 * - orgId        — UUID of the organization
 * - reportType   — e.g. "executive-summary"
 * - period       — e.g. "this-quarter"
 * - timestamp    — ms since epoch when the token was created
 * - sig          — first 16 hex chars of HMAC-SHA256 over the first four parts
 *
 * Tokens expire after 7 days by default.
 */

import { createHmac } from 'crypto'

const SHARE_SECRET = process.env.NOTIFICATION_EMAIL_SECRET || process.env.SHARE_TOKEN_SECRET || ''
// In dev, empty string is acceptable. In production, env vars must be set.
if (!SHARE_SECRET && process.env.NODE_ENV === 'production') {
  console.error(
    '[SECURITY] SHARE_TOKEN_SECRET or NOTIFICATION_EMAIL_SECRET must be set in production',
  )
}

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

const SEPARATOR = ':'

/** Compute HMAC signature over the canonical payload string. */
const sign = (payload: string): string =>
  createHmac('sha256', SHARE_SECRET).update(payload).digest('hex').slice(0, 16)

/** Encode a token for use in a URL. */
export const generateShareToken = (orgId: string, reportType: string, period: string): string => {
  const timestamp = String(Date.now())
  const payload = [orgId, reportType, period, timestamp].join(SEPARATOR)
  const sig = sign(payload)
  return Buffer.from(`${payload}${SEPARATOR}${sig}`).toString('base64url')
}

export type ShareTokenPayload = {
  orgId: string
  reportType: string
  period: string
}

/**
 * Validate a share token.
 * Returns the decoded payload on success, or null on failure.
 */
export const validateShareToken = (token: string): ShareTokenPayload | null => {
  let decoded: string
  try {
    decoded = Buffer.from(token, 'base64url').toString('utf8')
  } catch {
    return null
  }

  const parts = decoded.split(SEPARATOR)
  if (parts.length !== 5) return null

  const [orgId, reportType, period, timestamp, sig] = parts as [
    string,
    string,
    string,
    string,
    string,
  ]

  // Validate all parts are non-empty
  if (!orgId || !reportType || !period || !timestamp || !sig) return null

  // Check signature
  const payload = [orgId, reportType, period, timestamp].join(SEPARATOR)
  const expected = sign(payload)
  if (sig !== expected) return null

  // Check expiry
  const age = Date.now() - Number(timestamp)
  if (!Number.isFinite(age) || age < 0 || age > TOKEN_TTL_MS) return null

  return { orgId, reportType, period }
}
