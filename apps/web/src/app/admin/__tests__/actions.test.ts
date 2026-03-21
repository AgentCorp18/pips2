import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

const { mockRequireSystemAdmin } = vi.hoisted(() => ({
  mockRequireSystemAdmin: vi.fn(),
}))

vi.mock('@/lib/permissions', () => ({
  requireSystemAdmin: (...args: unknown[]) => mockRequireSystemAdmin(...args),
}))

// Track results for each from() call in sequence
let fromCallIndex = 0
let fromResults: Array<{ data?: unknown; count?: number | null; error?: unknown }> = []

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

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: () => {
      const idx = fromCallIndex++
      return createChainForIndex(idx)
    },
  })),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
    from: () => {
      const idx = fromCallIndex++
      return createChainForIndex(idx)
    },
  })),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { listAllUsers, toggleSystemAdmin, deactivateUser } from '../actions'

/* ============================================================
   Helpers
   ============================================================ */

const ADMIN_ID = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'
const TARGET_ID = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb'

const asAdmin = () => mockRequireSystemAdmin.mockResolvedValue({ userId: ADMIN_ID, supabase: {} })

const asNonAdmin = () =>
  mockRequireSystemAdmin.mockRejectedValue(new Error('System admin access required'))

/* ============================================================
   listAllUsers
   ============================================================ */

describe('listAllUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('throws when caller is not a system admin', async () => {
    asNonAdmin()

    await expect(listAllUsers()).rejects.toThrow('System admin access required')
  })

  it('returns empty array when profile query fails', async () => {
    asAdmin()
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await listAllUsers()
    expect(result).toEqual([])
  })

  it('returns users when caller is a system admin', async () => {
    asAdmin()
    fromResults = [
      // profiles query
      {
        data: [
          {
            id: TARGET_ID,
            email: 'user@example.com',
            full_name: 'Test User',
            is_system_admin: false,
            deactivated_at: null,
            created_at: '2026-01-01T00:00:00Z',
          },
        ],
        error: null,
      },
      // org_members query
      { data: [], error: null },
    ]

    const result = await listAllUsers()
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ id: TARGET_ID, email: 'user@example.com' })
  })
})

/* ============================================================
   toggleSystemAdmin
   ============================================================ */

describe('toggleSystemAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('throws when caller is not a system admin', async () => {
    asNonAdmin()

    await expect(toggleSystemAdmin(TARGET_ID)).rejects.toThrow('System admin access required')
  })

  it('returns error when targetUserId is not a valid UUID', async () => {
    asAdmin()

    const result = await toggleSystemAdmin('not-a-uuid')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('returns error when admin tries to change their own status', async () => {
    asAdmin()

    const result = await toggleSystemAdmin(ADMIN_ID)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/own/i)
  })

  it('returns error when target user is not found', async () => {
    asAdmin()
    fromResults = [
      // profiles fetch
      { data: null, error: { message: 'Not found' } },
    ]

    const result = await toggleSystemAdmin(TARGET_ID)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/user not found/i)
  })

  it('returns success when system admin toggles another user', async () => {
    asAdmin()
    fromResults = [
      // profiles fetch — current state
      { data: { is_system_admin: false }, error: null },
      // profiles update
      { data: null, error: null },
      // system_admin_log insert
      { data: null, error: null },
    ]

    const result = await toggleSystemAdmin(TARGET_ID)
    expect(result.success).toBe(true)
  })
})

/* ============================================================
   deactivateUser
   ============================================================ */

describe('deactivateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('throws when caller is not a system admin', async () => {
    asNonAdmin()

    await expect(deactivateUser(TARGET_ID)).rejects.toThrow('System admin access required')
  })

  it('returns error when targetUserId is not a valid UUID', async () => {
    asAdmin()

    const result = await deactivateUser('not-a-uuid')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('returns error when admin tries to deactivate themselves', async () => {
    asAdmin()

    const result = await deactivateUser(ADMIN_ID)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/own/i)
  })

  it('returns success when system admin deactivates another user', async () => {
    asAdmin()
    fromResults = [
      // profiles update
      { data: null, error: null },
      // system_admin_log insert
      { data: null, error: null },
    ]

    const result = await deactivateUser(TARGET_ID)
    expect(result.success).toBe(true)
  })

  it('returns error when DB update fails', async () => {
    asAdmin()
    fromResults = [
      // profiles update — failure
      { data: null, error: { message: 'DB error' } },
    ]

    const result = await deactivateUser(TARGET_ID)
    expect(result.success).toBe(false)
    expect(result.error).toBe('DB error')
  })
})
