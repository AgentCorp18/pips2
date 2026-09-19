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
 * - sig          — full hex HMAC-SHA256 over the first four parts
 *
 * Tokens expire after 7 days by default.
 *
 * SECURITY: this module fails closed. In production, if no signing secret is
 * configured, generateShareToken() throws and validateShareToken() rejects every
 * token. It must never sign or verify with an empty key, because an empty key is
 * a key the attacker also has.
 */

import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Fallback used only outside production so local dev and tests work without
 * configuration. It is a fixed, publicly known value and is deliberately never
 * reachable when NODE_ENV === 'production'.
 */
const DEV_ONLY_SECRET = 'pips-development-share-token-secret-do-not-use-in-production'

export class ShareTokenSecretMissingError extends Error {
  constructor() {
    super('SHARE_TOKEN_SECRET must be set in production to sign share links')
    this.name = 'ShareTokenSecretMissingError'
  }
}

/**
 * Resolve the signing secret at call time (not module load) so that a missing
 * secret degrades to a runtime rejection rather than a build/prerender crash.
 *
 * SHARE_TOKEN_SECRET is the dedicated key for report links.
 * NOTIFICATION_EMAIL_SECRET is accepted only as a legacy fallback so existing
 * deployments keep working; report signing should not share a trust domain with
 * email dispatch, so set SHARE_TOKEN_SECRET and drop the fallback.
 */
const resolveSecret = (): string | null => {
  const secret = process.env.SHARE_TOKEN_SECRET || process.env.NOTIFICATION_EMAIL_SECRET || ''
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[SECURITY] SHARE_TOKEN_SECRET is not set — share-link signing and validation are disabled',
    )
    return null
  }
  return DEV_ONLY_SECRET
}

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

const SEPARATOR = ':'

/** Compute the full hex HMAC signature over the canonical payload string. */
const sign = (payload: string, secret: string): string =>
  createHmac('sha256', secret).update(payload).digest('hex')

/** Constant-time comparison of two hex signatures. */
const signaturesMatch = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'))
  } catch {
    return false
  }
}

/**
 * Encode a token for use in a URL.
 * @throws ShareTokenSecretMissingError when no signing secret is configured in production.
 */
export const generateShareToken = (orgId: string, reportType: string, period: string): string => {
  const secret = resolveSecret()
  if (!secret) throw new ShareTokenSecretMissingError()

  const timestamp = String(Date.now())
  const payload = [orgId, reportType, period, timestamp].join(SEPARATOR)
  const sig = sign(payload, secret)
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
 * Returns null (never a payload) when no signing secret is configured.
 */
export const validateShareToken = (token: string): ShareTokenPayload | null => {
  const secret = resolveSecret()
  if (!secret) return null

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

  // Check signature (constant time, full digest)
  const payload = [orgId, reportType, period, timestamp].join(SEPARATOR)
  if (!signaturesMatch(sig, sign(payload, secret))) return null

  // Check expiry
  const age = Date.now() - Number(timestamp)
  if (!Number.isFinite(age) || age < 0 || age > TOKEN_TTL_MS) return null

  return { orgId, reportType, period }
}
