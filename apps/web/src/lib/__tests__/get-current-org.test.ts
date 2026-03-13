import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

const mockCookieGet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
  })),
}))

/* ============================================================
   Supabase mock — tracks chained calls
   ============================================================ */

let fromCallIndex = 0
let fromResults: Array<{ data?: unknown; error?: unknown }> = []

const createChainForIndex = (idx: number) => {
  const terminal = () => {
    const result = fromResults[idx] ?? { data: null, error: null }
    return Promise.resolve(result)
  }

  const chain: Record<string, unknown> = {}
  const proxy = new Proxy(chain, {
    get(_target, prop) {
      if (prop === 'then') {
        const p = terminal()
        return p.then.bind(p)
      }
      return (..._args: unknown[]) => proxy
    },
  })

  return proxy
}

/* ============================================================
   Import after mocks
   ============================================================ */

import { getCurrentOrg, ORG_COOKIE_NAME } from '../get-current-org'
import type { SupabaseClient } from '@supabase/supabase-js'

/* ============================================================
   Helpers
   ============================================================ */

const createMockSupabase = () =>
  ({
    from: () => {
      const idx = fromCallIndex++
      return createChainForIndex(idx)
    },
  }) as unknown as SupabaseClient

/* ============================================================
   Tests
   ============================================================ */

describe('getCurrentOrg', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('exports the cookie name constant', () => {
    expect(ORG_COOKIE_NAME).toBe('pips-org-id')
  })

  it('returns org from cookie when user is a member of that org', async () => {
    mockCookieGet.mockReturnValue({ value: 'org-cookie' })

    // Call 0: org_members query (cookie verification)
    fromResults[0] = {
      data: { org_id: 'org-cookie', role: 'admin' },
    }
    // Call 1: organizations query (get org name)
    fromResults[1] = {
      data: { name: 'Cookie Org' },
    }

    const supabase = createMockSupabase()
    const result = await getCurrentOrg(supabase, 'user-1')

    expect(result).toEqual({
      orgId: 'org-cookie',
      orgName: 'Cookie Org',
      role: 'admin',
    })
  })

  it('falls back to first org when cookie org is invalid', async () => {
    mockCookieGet.mockReturnValue({ value: 'org-invalid' })

    // Call 0: org_members query for cookie org — no membership found
    fromResults[0] = { data: null }
    // Call 1: org_members fallback query (first org by joined_at)
    fromResults[1] = {
      data: { org_id: 'org-fallback', role: 'member' },
    }
    // Call 2: organizations query for fallback org
    fromResults[2] = {
      data: { name: 'Fallback Org' },
    }

    const supabase = createMockSupabase()
    const result = await getCurrentOrg(supabase, 'user-1')

    expect(result).toEqual({
      orgId: 'org-fallback',
      orgName: 'Fallback Org',
      role: 'member',
    })
  })

  it('falls back to first org when no cookie is set', async () => {
    mockCookieGet.mockReturnValue(undefined)

    // Call 0: org_members fallback query
    fromResults[0] = {
      data: { org_id: 'org-first', role: 'owner' },
    }
    // Call 1: organizations query
    fromResults[1] = {
      data: { name: 'First Org' },
    }

    const supabase = createMockSupabase()
    const result = await getCurrentOrg(supabase, 'user-1')

    expect(result).toEqual({
      orgId: 'org-first',
      orgName: 'First Org',
      role: 'owner',
    })
  })

  it('returns null when user has no org memberships and no cookie', async () => {
    mockCookieGet.mockReturnValue(undefined)

    // Call 0: org_members fallback query — no membership
    fromResults[0] = { data: null }

    const supabase = createMockSupabase()
    const result = await getCurrentOrg(supabase, 'user-1')

    expect(result).toBeNull()
  })

  it('returns null when user has no org memberships and cookie is invalid', async () => {
    mockCookieGet.mockReturnValue({ value: 'org-bad' })

    // Call 0: org_members for cookie — no match
    fromResults[0] = { data: null }
    // Call 1: org_members fallback — no match
    fromResults[1] = { data: null }

    const supabase = createMockSupabase()
    const result = await getCurrentOrg(supabase, 'user-1')

    expect(result).toBeNull()
  })

  it('returns null when cookie org membership exists but organization lookup fails', async () => {
    mockCookieGet.mockReturnValue({ value: 'org-1' })

    // Call 0: org_members for cookie — found
    fromResults[0] = {
      data: { org_id: 'org-1', role: 'admin' },
    }
    // Call 1: organizations lookup — null (deleted org)
    fromResults[1] = { data: null }
    // Call 2: org_members fallback
    fromResults[2] = {
      data: { org_id: 'org-2', role: 'member' },
    }
    // Call 3: organizations for fallback
    fromResults[3] = {
      data: { name: 'Second Org' },
    }

    const supabase = createMockSupabase()
    const result = await getCurrentOrg(supabase, 'user-1')

    expect(result).toEqual({
      orgId: 'org-2',
      orgName: 'Second Org',
      role: 'member',
    })
  })

  it('returns null when fallback org membership exists but organization lookup fails', async () => {
    mockCookieGet.mockReturnValue(undefined)

    // Call 0: org_members fallback — found
    fromResults[0] = {
      data: { org_id: 'org-1', role: 'owner' },
    }
    // Call 1: organizations lookup — null
    fromResults[1] = { data: null }

    const supabase = createMockSupabase()
    const result = await getCurrentOrg(supabase, 'user-1')

    expect(result).toBeNull()
  })

  it('handles empty string cookie value as no cookie', async () => {
    mockCookieGet.mockReturnValue({ value: '' })

    // Empty string is falsy, so goes to fallback
    // Call 0: org_members fallback
    fromResults[0] = {
      data: { org_id: 'org-1', role: 'viewer' },
    }
    // Call 1: organizations
    fromResults[1] = {
      data: { name: 'Only Org' },
    }

    const supabase = createMockSupabase()
    const result = await getCurrentOrg(supabase, 'user-1')

    expect(result).toEqual({
      orgId: 'org-1',
      orgName: 'Only Org',
      role: 'viewer',
    })
  })
})
