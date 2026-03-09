import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

// Track results for each from() call in sequence
let fromCallIndex = 0
let fromResults: Array<{ data?: unknown; count?: number | null; error?: unknown }> = []

/**
 * Each .from() call creates a fresh chain that resolves
 * to fromResults[fromCallIndex++] at terminal positions.
 */
const createChainForIndex = (idx: number) => {
  const terminal = () => {
    const result = fromResults[idx] ?? { data: null, error: null }
    return Promise.resolve(result)
  }

  const chain: Record<string, unknown> = {}
  const proxy = new Proxy(chain, {
    get(_target, prop) {
      if (prop === 'then') {
        // Make the chain thenable at any point
        const p = terminal()
        return p.then.bind(p)
      }
      // Every method returns the proxy itself for chaining
      return (..._args: unknown[]) => proxy
    },
  })

  return proxy
}

const mockGetUser = vi.fn()

// adminCallIndex and adminResults track from() calls on the admin client
let adminCallIndex = 0
let adminResults: Array<{ data?: unknown; count?: number | null; error?: unknown }> = []

const createAdminChainForIndex = (idx: number) => {
  const terminal = () => {
    const result = adminResults[idx] ?? { data: null, error: null }
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

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: () => {
      const idx = adminCallIndex++
      return createAdminChainForIndex(idx)
    },
  })),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { getInvitation, acceptInvitation, declineInvitation } from '../actions'
import { redirect } from 'next/navigation'

/* ============================================================
   Helpers
   ============================================================ */

const futureDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString()
}

const pastDate = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString()
}

/* ============================================================
   getInvitation
   ============================================================ */

describe('getInvitation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    adminCallIndex = 0
    adminResults = []
  })

  it('returns not_found for empty token', async () => {
    const result = await getInvitation('')

    expect(result).toEqual({ status: 'not_found' })
  })

  it('returns not_found when invitation does not exist in DB', async () => {
    adminResults = [
      // from('org_invitations').select().eq().single() -> null
      { data: null },
    ]

    const result = await getInvitation('valid-token-123')

    expect(result).toEqual({ status: 'not_found' })
  })

  it('returns already_accepted when invitation status is accepted', async () => {
    adminResults = [
      {
        data: {
          id: 'inv-1',
          email: 'user@example.com',
          role: 'member',
          status: 'accepted',
          expires_at: futureDate(),
          org_id: 'org-1',
          invited_by: 'u-admin',
        },
      },
    ]

    const result = await getInvitation('token-abc')

    expect(result).toEqual({ status: 'already_accepted' })
  })

  it('returns revoked when invitation status is revoked', async () => {
    adminResults = [
      {
        data: {
          id: 'inv-1',
          email: 'user@example.com',
          role: 'member',
          status: 'revoked',
          expires_at: futureDate(),
          org_id: 'org-1',
          invited_by: 'u-admin',
        },
      },
    ]

    const result = await getInvitation('token-abc')

    expect(result).toEqual({ status: 'revoked' })
  })

  it('returns expired when invitation is past expiry', async () => {
    adminResults = [
      {
        data: {
          id: 'inv-1',
          email: 'user@example.com',
          role: 'member',
          status: 'pending',
          expires_at: pastDate(),
          org_id: 'org-1',
          invited_by: 'u-admin',
        },
      },
    ]

    const result = await getInvitation('token-abc')

    expect(result).toEqual({ status: 'expired' })
  })

  it('returns not_found when status is neither pending, accepted, nor revoked', async () => {
    adminResults = [
      {
        data: {
          id: 'inv-1',
          email: 'user@example.com',
          role: 'member',
          status: 'unknown_status',
          expires_at: futureDate(),
          org_id: 'org-1',
          invited_by: 'u-admin',
        },
      },
    ]

    const result = await getInvitation('token-abc')

    expect(result).toEqual({ status: 'not_found' })
  })

  it('returns valid invitation with org name and inviter name (logged-in user)', async () => {
    const expires = futureDate()

    adminResults = [
      // from('org_invitations') -> invitation
      {
        data: {
          id: 'inv-1',
          email: 'user@example.com',
          role: 'member',
          status: 'pending',
          expires_at: expires,
          org_id: 'org-1',
          invited_by: 'u-admin',
        },
      },
      // from('organizations') -> org name
      { data: { name: 'Acme Corp' } },
      // from('profiles') -> inviter name
      { data: { full_name: 'Jane Admin' } },
    ]

    // supabase.auth.getUser() — logged-in user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'user@example.com' } },
    })

    const result = await getInvitation('token-abc')

    expect(result).toEqual({
      status: 'valid',
      invitation: {
        id: 'inv-1',
        email: 'user@example.com',
        role: 'member',
        status: 'pending',
        expires_at: expires,
        org_name: 'Acme Corp',
        inviter_name: 'Jane Admin',
      },
      isLoggedIn: true,
      userEmail: 'user@example.com',
    })
  })

  it('returns valid invitation for not-logged-in user', async () => {
    const expires = futureDate()

    adminResults = [
      {
        data: {
          id: 'inv-1',
          email: 'new@example.com',
          role: 'admin',
          status: 'pending',
          expires_at: expires,
          org_id: 'org-1',
          invited_by: 'u-admin',
        },
      },
      { data: { name: 'Startup Inc' } },
      { data: { full_name: 'Bob Inviter' } },
    ]

    mockGetUser.mockResolvedValue({
      data: { user: null },
    })

    const result = await getInvitation('token-xyz')

    expect(result).toEqual({
      status: 'valid',
      invitation: {
        id: 'inv-1',
        email: 'new@example.com',
        role: 'admin',
        status: 'pending',
        expires_at: expires,
        org_name: 'Startup Inc',
        inviter_name: 'Bob Inviter',
      },
      isLoggedIn: false,
      userEmail: null,
    })
  })

  it('falls back to defaults when org name and inviter name are missing', async () => {
    const expires = futureDate()

    adminResults = [
      {
        data: {
          id: 'inv-1',
          email: 'user@example.com',
          role: 'member',
          status: 'pending',
          expires_at: expires,
          org_id: 'org-1',
          invited_by: 'u-admin',
        },
      },
      // org not found
      { data: null },
      // profile not found
      { data: null },
    ]

    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getInvitation('token-abc')

    expect(result).toEqual({
      status: 'valid',
      invitation: expect.objectContaining({
        org_name: 'Unknown Organization',
        inviter_name: 'A team member',
      }),
      isLoggedIn: false,
      userEmail: null,
    })
  })
})

/* ============================================================
   acceptInvitation
   ============================================================ */

describe('acceptInvitation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    adminCallIndex = 0
    adminResults = []
  })

  it('returns error for empty/invalid token', async () => {
    const result = await acceptInvitation('')

    expect(result).toEqual({ success: false, error: 'Invalid token' })
  })

  it('returns error when user is not logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await acceptInvitation('valid-token')

    expect(result).toEqual({
      success: false,
      error: 'You must be logged in to accept an invitation',
    })
  })

  it('returns error when invitation is not found', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'user@example.com' } },
    })

    adminResults = [
      // from('org_invitations') -> not found
      { data: null },
    ]

    const result = await acceptInvitation('nonexistent-token')

    expect(result).toEqual({ success: false, error: 'Invitation not found' })
  })

  it('returns error when invitation is no longer pending', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'user@example.com' } },
    })

    adminResults = [
      {
        data: {
          id: 'inv-1',
          org_id: 'org-1',
          email: 'user@example.com',
          role: 'member',
          status: 'accepted',
          expires_at: futureDate(),
        },
      },
    ]

    const result = await acceptInvitation('token-abc')

    expect(result).toEqual({ success: false, error: 'Invitation is no longer valid' })
  })

  it('returns error when invitation has expired', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'user@example.com' } },
    })

    adminResults = [
      {
        data: {
          id: 'inv-1',
          org_id: 'org-1',
          email: 'user@example.com',
          role: 'member',
          status: 'pending',
          expires_at: pastDate(),
        },
      },
    ]

    const result = await acceptInvitation('token-abc')

    expect(result).toEqual({ success: false, error: 'This invitation has expired' })
  })

  it('returns error when email does not match', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'wrong@example.com' } },
    })

    adminResults = [
      {
        data: {
          id: 'inv-1',
          org_id: 'org-1',
          email: 'correct@example.com',
          role: 'member',
          status: 'pending',
          expires_at: futureDate(),
        },
      },
    ]

    const result = await acceptInvitation('token-abc')

    expect(result).toEqual({
      success: false,
      error:
        'This invitation was sent to correct@example.com. Please log in with that email address.',
    })
  })

  it('redirects to dashboard when user is already a member', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'user@example.com' } },
    })

    adminResults = [
      // from('org_invitations') -> invitation
      {
        data: {
          id: 'inv-1',
          org_id: 'org-1',
          email: 'user@example.com',
          role: 'member',
          status: 'pending',
          expires_at: futureDate(),
        },
      },
      // from('org_members') -> existing member found
      { data: { id: 'existing-member-1' } },
      // from('org_invitations').update() -> mark accepted
      { data: null, error: null },
    ]

    await acceptInvitation('token-abc')

    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('inserts new member and redirects on success', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'user@example.com' } },
    })

    adminResults = [
      // from('org_invitations') -> invitation
      {
        data: {
          id: 'inv-1',
          org_id: 'org-1',
          email: 'user@example.com',
          role: 'member',
          status: 'pending',
          expires_at: futureDate(),
        },
      },
      // from('org_members').select().eq().eq().single() -> no existing member
      { data: null },
      // from('org_members').insert() -> success
      { data: null, error: null },
      // from('org_invitations').update() -> mark accepted
      { data: null, error: null },
    ]

    await acceptInvitation('token-abc')

    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('returns error when member insert fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u-1', email: 'user@example.com' } },
    })

    adminResults = [
      {
        data: {
          id: 'inv-1',
          org_id: 'org-1',
          email: 'user@example.com',
          role: 'member',
          status: 'pending',
          expires_at: futureDate(),
        },
      },
      // no existing member
      { data: null },
      // insert fails
      { error: { message: 'DB constraint violation' } },
    ]

    const result = await acceptInvitation('token-abc')

    expect(result).toEqual({
      success: false,
      error: 'Failed to join the organization. Please try again.',
    })
  })
})

/* ============================================================
   declineInvitation
   ============================================================ */

describe('declineInvitation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    adminCallIndex = 0
    adminResults = []
  })

  it('returns error for empty/invalid token', async () => {
    const result = await declineInvitation('')

    expect(result).toEqual({ success: false, error: 'Invalid token' })
  })

  it('returns error when invitation is not found', async () => {
    adminResults = [{ data: null }]

    const result = await declineInvitation('nonexistent-token')

    expect(result).toEqual({ success: false, error: 'Invitation not found' })
  })

  it('returns error when invitation is no longer pending', async () => {
    adminResults = [
      {
        data: { id: 'inv-1', status: 'accepted' },
      },
    ]

    const result = await declineInvitation('token-abc')

    expect(result).toEqual({ success: false, error: 'Invitation is no longer valid' })
  })

  it('declines a pending invitation successfully', async () => {
    adminResults = [
      // from('org_invitations').select() -> pending invitation
      { data: { id: 'inv-1', status: 'pending' } },
      // from('org_invitations').update() -> success
      { data: null, error: null },
    ]

    const result = await declineInvitation('token-abc')

    expect(result).toEqual({ success: true })
  })

  it('returns error when update fails', async () => {
    adminResults = [
      { data: { id: 'inv-1', status: 'pending' } },
      // update fails
      { error: { message: 'DB error' } },
    ]

    const result = await declineInvitation('token-abc')

    expect(result).toEqual({
      success: false,
      error: 'Failed to decline invitation. Please try again.',
    })
  })
})
