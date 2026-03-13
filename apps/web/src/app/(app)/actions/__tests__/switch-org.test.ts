import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

const mockCookieSet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    set: mockCookieSet,
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

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

const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: () => {
      const idx = fromCallIndex++
      return createChainForIndex(idx)
    },
  })),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { switchOrg } from '../switch-org'
import { revalidatePath } from 'next/cache'

/* ============================================================
   Tests
   ============================================================ */

describe('switchOrg', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await switchOrg('org-1')

    expect(result).toEqual({ success: false, error: 'Not authenticated' })
    expect(mockCookieSet).not.toHaveBeenCalled()
  })

  it('returns error when user is not a member of the target org', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    // org_members query returns no membership
    fromResults[0] = { data: null }

    const result = await switchOrg('org-nonexistent')

    expect(result).toEqual({ success: false, error: 'Not a member of this organization' })
    expect(mockCookieSet).not.toHaveBeenCalled()
  })

  it('sets cookie and revalidates on successful switch', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    // org_members query returns membership
    fromResults[0] = {
      data: { org_id: 'org-2', role: 'admin' },
    }

    const result = await switchOrg('org-2')

    expect(result).toEqual({ success: true })
    expect(mockCookieSet).toHaveBeenCalledWith('pips-org-id', 'org-2', {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false,
    })
    expect(revalidatePath).toHaveBeenCalledWith('/(app)', 'layout')
  })

  it('passes the correct orgId to the membership query', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    fromResults[0] = {
      data: { org_id: 'org-specific', role: 'owner' },
    }

    const result = await switchOrg('org-specific')

    expect(result).toEqual({ success: true })
    expect(mockCookieSet).toHaveBeenCalledWith(
      'pips-org-id',
      'org-specific',
      expect.objectContaining({ path: '/' }),
    )
  })
})
