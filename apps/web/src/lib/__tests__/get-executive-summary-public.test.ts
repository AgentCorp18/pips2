import { describe, it, expect, vi } from 'vitest'
import { isValidShareOrgId, getExecutiveSummaryPublic } from '../get-executive-summary-public'
import { validateShareToken, generateShareToken } from '../share-token'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => {
    throw new Error('admin client must not be constructed for an invalid org scope')
  },
}))

describe('share-report org scoping', () => {
  describe('isValidShareOrgId', () => {
    it('accepts a well-formed UUID', () => {
      expect(isValidShareOrgId('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02')).toBe(true)
    })

    it.each(['', 'org-id', '../../etc', 'bbbbbbbb-bbbb-bbbb-bbbb', '*'])('rejects %j', (value) => {
      expect(isValidShareOrgId(value)).toBe(false)
    })
  })

  describe('getExecutiveSummaryPublic', () => {
    it('rejects a non-UUID org id before constructing the admin client', async () => {
      await expect(getExecutiveSummaryPublic('not-a-uuid', 'all-time')).rejects.toThrow(
        'Invalid organization identifier',
      )
    })
  })

  describe('token forgery', () => {
    it('a token signed with the wrong key does not resolve to an org scope', () => {
      vi.stubEnv('SHARE_TOKEN_SECRET', 'the-real-key')
      const token = generateShareToken(
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
        'executive-summary',
        'ytd',
      )

      vi.stubEnv('SHARE_TOKEN_SECRET', 'an-attacker-key')
      // The share page calls notFound() on a null payload, i.e. a 404.
      expect(validateShareToken(token)).toBeNull()
      vi.unstubAllEnvs()
    })
  })
})
