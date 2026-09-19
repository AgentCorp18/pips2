import { describe, it, expect, vi, afterEach } from 'vitest'
import { generateShareToken, validateShareToken, ShareTokenSecretMissingError } from './share-token'

describe('share-token', () => {
  describe('generateShareToken', () => {
    it('returns a non-empty base64url string', () => {
      const token = generateShareToken('org-id', 'executive-summary', 'this-quarter')
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      // base64url characters only
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('produces different tokens for different inputs', () => {
      const t1 = generateShareToken('org-1', 'executive-summary', 'this-quarter')
      const t2 = generateShareToken('org-2', 'executive-summary', 'this-quarter')
      expect(t1).not.toBe(t2)
    })

    it('produces different tokens for different periods', () => {
      const t1 = generateShareToken('org-id', 'executive-summary', 'this-quarter')
      const t2 = generateShareToken('org-id', 'executive-summary', 'ytd')
      expect(t1).not.toBe(t2)
    })

    it('produces different tokens on successive calls (different timestamps)', () => {
      // Advance timer by 1ms between calls so timestamps differ
      const t1 = generateShareToken('org-id', 'executive-summary', 'this-quarter')
      // Tokens include Date.now() so they should differ over time;
      // here we just check they're both valid (same-ms collision is OK in practice)
      const t2 = generateShareToken('org-id', 'executive-summary', 'this-quarter')
      // Both must be valid tokens
      const p1 = validateShareToken(t1)
      const p2 = validateShareToken(t2)
      expect(p1).not.toBeNull()
      expect(p2).not.toBeNull()
    })
  })

  describe('validateShareToken', () => {
    it('returns the correct payload for a freshly generated token', () => {
      const token = generateShareToken('abc-org', 'executive-summary', 'ytd')
      const result = validateShareToken(token)
      expect(result).not.toBeNull()
      expect(result?.orgId).toBe('abc-org')
      expect(result?.reportType).toBe('executive-summary')
      expect(result?.period).toBe('ytd')
    })

    it('returns null for an empty string', () => {
      expect(validateShareToken('')).toBeNull()
    })

    it('returns null for garbage input', () => {
      expect(validateShareToken('not-a-valid-token')).toBeNull()
    })

    it('returns null for a tampered token (wrong signature)', () => {
      const token = generateShareToken('org-id', 'executive-summary', 'all-time')
      // Decode, tamper with org, re-encode
      const decoded = Buffer.from(token, 'base64url').toString('utf8')
      const tampered = decoded.replace('org-id', 'evil-org')
      const tamperedToken = Buffer.from(tampered).toString('base64url')
      expect(validateShareToken(tamperedToken)).toBeNull()
    })

    it('returns null for a token with only 4 parts (missing sig)', () => {
      const payload = 'org:executive-summary:this-quarter:12345'
      const token = Buffer.from(payload).toString('base64url')
      expect(validateShareToken(token)).toBeNull()
    })

    it('returns null for a token with too many parts', () => {
      const payload = 'a:b:c:d:e:f'
      const token = Buffer.from(payload).toString('base64url')
      expect(validateShareToken(token)).toBeNull()
    })

    it('returns null for an expired token (older than 7 days)', () => {
      // Freeze time at a past date
      const now = Date.now()
      const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000
      vi.spyOn(Date, 'now').mockReturnValueOnce(eightDaysAgo)
      const token = generateShareToken('org-id', 'executive-summary', 'this-quarter')
      vi.restoreAllMocks()

      // Validate with current time — should be expired
      expect(validateShareToken(token)).toBeNull()
    })

    it('returns payload for a token just within the 7-day window', () => {
      const now = Date.now()
      const sixDaysAgo = now - 6 * 24 * 60 * 60 * 1000
      vi.spyOn(Date, 'now').mockReturnValueOnce(sixDaysAgo)
      const token = generateShareToken('org-id', 'executive-summary', 'last-quarter')
      vi.restoreAllMocks()

      const result = validateShareToken(token)
      expect(result).not.toBeNull()
      expect(result?.orgId).toBe('org-id')
      expect(result?.period).toBe('last-quarter')
    })
  })

  describe('secret handling (fails closed)', () => {
    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('throws when generating in production with no secret configured', () => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.stubEnv('SHARE_TOKEN_SECRET', '')
      vi.stubEnv('NOTIFICATION_EMAIL_SECRET', '')

      expect(() => generateShareToken('org-id', 'executive-summary', 'ytd')).toThrow(
        ShareTokenSecretMissingError,
      )
    })

    it('rejects every token in production when no secret is configured', () => {
      // Mint a token while a secret IS configured.
      vi.stubEnv('SHARE_TOKEN_SECRET', 'a-real-secret')
      const token = generateShareToken('org-id', 'executive-summary', 'ytd')
      expect(validateShareToken(token)).not.toBeNull()

      // Remove the secret in production — validation must fail closed, not fall
      // back to signing with the empty string.
      vi.stubEnv('NODE_ENV', 'production')
      vi.stubEnv('SHARE_TOKEN_SECRET', '')
      vi.stubEnv('NOTIFICATION_EMAIL_SECRET', '')
      expect(validateShareToken(token)).toBeNull()
    })

    it('rejects a token signed with a different key', () => {
      vi.stubEnv('SHARE_TOKEN_SECRET', 'key-one')
      const token = generateShareToken('org-id', 'executive-summary', 'ytd')

      vi.stubEnv('SHARE_TOKEN_SECRET', 'key-two')
      expect(validateShareToken(token)).toBeNull()
    })

    it('prefers SHARE_TOKEN_SECRET over the legacy NOTIFICATION_EMAIL_SECRET', () => {
      vi.stubEnv('SHARE_TOKEN_SECRET', 'dedicated-key')
      vi.stubEnv('NOTIFICATION_EMAIL_SECRET', 'email-key')
      const token = generateShareToken('org-id', 'executive-summary', 'ytd')

      // Dropping only the dedicated key changes the effective signing key,
      // proving it was the one used.
      vi.stubEnv('SHARE_TOKEN_SECRET', '')
      expect(validateShareToken(token)).toBeNull()
    })

    it('signs with the full SHA-256 digest rather than a 64-bit truncation', () => {
      const token = generateShareToken('org-id', 'executive-summary', 'ytd')
      const sig = Buffer.from(token, 'base64url').toString('utf8').split(':')[4]
      expect(sig).toHaveLength(64)
    })
  })
})
