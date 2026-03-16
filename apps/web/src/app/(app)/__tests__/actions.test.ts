import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
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

const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: () => {
      const idx = fromCallIndex++
      return createChainForIndex(idx)
    },
  })),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    // next/navigation redirect throws internally — simulate that so code
    // after the call does not execute in tests.
    throw new Error('NEXT_REDIRECT')
  }),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { getUserOrgs } from '../actions'
import { redirect } from 'next/navigation'

/* ============================================================
   getUserOrgs
   ============================================================ */

describe('getUserOrgs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('redirects to /login when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    await expect(getUserOrgs()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('returns empty array when user has no memberships', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('org_members') -> empty
      { data: [] },
    ]

    const result = await getUserOrgs()
    expect(result).toEqual([])
  })

  it('returns empty array when memberships exist but org query returns null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('org_members') -> memberships
      { data: [{ org_id: 'org-1', role: 'member' }] },
      // from('organizations') -> null
      { data: null },
    ]

    const result = await getUserOrgs()
    expect(result).toEqual([])
  })

  it('returns mapped UserOrg array on happy path', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('org_members') -> memberships
      {
        data: [
          { org_id: 'org-1', role: 'owner' },
          { org_id: 'org-2', role: 'member' },
        ],
      },
      // from('organizations') -> orgs
      {
        data: [
          { id: 'org-1', name: 'Alpha Corp' },
          { id: 'org-2', name: 'Beta LLC' },
        ],
      },
    ]

    const result = await getUserOrgs()
    expect(result).toEqual([
      { orgId: 'org-1', orgName: 'Alpha Corp', role: 'owner' },
      { orgId: 'org-2', orgName: 'Beta LLC', role: 'member' },
    ])
  })

  it('filters out memberships whose org is not returned by the org query', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('org_members') -> 2 memberships
      {
        data: [
          { org_id: 'org-1', role: 'admin' },
          { org_id: 'org-missing', role: 'member' },
        ],
      },
      // from('organizations') -> only one org (the other was deleted/missing)
      { data: [{ id: 'org-1', name: 'Visible Org' }] },
    ]

    const result = await getUserOrgs()
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ orgId: 'org-1', orgName: 'Visible Org', role: 'admin' })
  })

  it('returns empty array when org_members query returns null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('org_members') -> null
      { data: null },
    ]

    const result = await getUserOrgs()
    expect(result).toEqual([])
  })

  it('preserves membership order from the org_members query', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      {
        data: [
          { org_id: 'org-2', role: 'member' },
          { org_id: 'org-1', role: 'owner' },
        ],
      },
      {
        data: [
          { id: 'org-1', name: 'First' },
          { id: 'org-2', name: 'Second' },
        ],
      },
    ]

    const result = await getUserOrgs()
    expect(result[0]!.orgId).toBe('org-2')
    expect(result[1]!.orgId).toBe('org-1')
  })
})
