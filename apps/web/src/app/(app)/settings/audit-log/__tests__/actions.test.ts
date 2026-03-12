import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

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

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: () => {
      const idx = fromCallIndex++
      return createChainForIndex(idx)
    },
  })),
}))

vi.mock('@/lib/permissions', () => ({
  getUserOrg: vi.fn(),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { getAuditLog } from '../actions'
import { getUserOrg } from '@/lib/permissions'

/* ============================================================
   getAuditLog
   ============================================================ */

describe('getAuditLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when not authenticated', async () => {
    vi.mocked(getUserOrg).mockResolvedValue(null)

    const result = await getAuditLog()
    expect(result).toEqual({
      entries: [],
      total: 0,
      page: 1,
      limit: 25,
      error: 'Not authenticated',
    })
  })

  it('returns error when user has insufficient permissions (member role)', async () => {
    vi.mocked(getUserOrg).mockResolvedValue({
      org_id: 'org-1',
      role: 'member',
      organizations: [{ id: 'org-1', name: 'Test', slug: 'test' }],
    })

    const result = await getAuditLog()
    expect(result).toEqual({
      entries: [],
      total: 0,
      page: 1,
      limit: 25,
      error: 'Insufficient permissions',
    })
  })

  it('returns error when user has viewer role', async () => {
    vi.mocked(getUserOrg).mockResolvedValue({
      org_id: 'org-1',
      role: 'viewer',
      organizations: [{ id: 'org-1', name: 'Test', slug: 'test' }],
    })

    const result = await getAuditLog()
    expect(result).toEqual({
      entries: [],
      total: 0,
      page: 1,
      limit: 25,
      error: 'Insufficient permissions',
    })
  })

  it('returns audit log entries for owner', async () => {
    vi.mocked(getUserOrg).mockResolvedValue({
      org_id: 'org-1',
      role: 'owner',
      organizations: [{ id: 'org-1', name: 'Test', slug: 'test' }],
    })

    fromResults = [
      // count query
      { count: 2 },
      // entries query (no profiles join)
      {
        data: [
          {
            id: 'log-1',
            user_id: 'user-1',
            action: 'insert',
            entity_type: 'ticket',
            entity_id: 'tkt-1',
            old_data: null,
            new_data: { title: 'Test' },
            ip_address: '127.0.0.1',
            user_agent: 'Mozilla/5.0',
            created_at: '2026-03-01T00:00:00Z',
          },
        ],
        error: null,
      },
      // profiles query for user display names
      {
        data: [{ id: 'user-1', full_name: 'Alice' }],
      },
    ]

    const result = await getAuditLog()
    expect(result.entries).toHaveLength(1)
    expect(result.total).toBe(2)
    expect(result.entries[0]?.user_display_name).toBe('Alice')
    expect(result.entries[0]?.action).toBe('insert')
    expect(result.error).toBeUndefined()
  })

  it('returns audit log entries for admin', async () => {
    vi.mocked(getUserOrg).mockResolvedValue({
      org_id: 'org-1',
      role: 'admin',
      organizations: [{ id: 'org-1', name: 'Test', slug: 'test' }],
    })

    fromResults = [{ count: 0 }, { data: [], error: null }]

    const result = await getAuditLog()
    expect(result.entries).toEqual([])
    expect(result.total).toBe(0)
    expect(result.error).toBeUndefined()
  })

  it('handles profiles lookup for user display names', async () => {
    vi.mocked(getUserOrg).mockResolvedValue({
      org_id: 'org-1',
      role: 'owner',
      organizations: [{ id: 'org-1', name: 'Test', slug: 'test' }],
    })

    fromResults = [
      { count: 1 },
      {
        data: [
          {
            id: 'log-1',
            user_id: 'user-1',
            action: 'update',
            entity_type: 'project',
            entity_id: 'proj-1',
            old_data: null,
            new_data: null,
            ip_address: null,
            user_agent: null,
            created_at: '2026-03-01T00:00:00Z',
          },
        ],
        error: null,
      },
      // profiles query
      {
        data: [{ id: 'user-1', full_name: 'Bob' }],
      },
    ]

    const result = await getAuditLog()
    expect(result.entries[0]?.user_display_name).toBe('Bob')
  })

  it('handles null profiles gracefully', async () => {
    vi.mocked(getUserOrg).mockResolvedValue({
      org_id: 'org-1',
      role: 'owner',
      organizations: [{ id: 'org-1', name: 'Test', slug: 'test' }],
    })

    fromResults = [
      { count: 1 },
      {
        data: [
          {
            id: 'log-1',
            user_id: null,
            action: 'delete',
            entity_type: 'ticket',
            entity_id: 'tkt-1',
            old_data: null,
            new_data: null,
            ip_address: null,
            user_agent: null,
            created_at: '2026-03-01T00:00:00Z',
            profiles: null,
          },
        ],
        error: null,
      },
    ]

    const result = await getAuditLog()
    expect(result.entries[0]?.user_display_name).toBeNull()
  })

  it('returns error when query fails', async () => {
    vi.mocked(getUserOrg).mockResolvedValue({
      org_id: 'org-1',
      role: 'owner',
      organizations: [{ id: 'org-1', name: 'Test', slug: 'test' }],
    })

    fromResults = [{ count: 10 }, { data: null, error: { message: 'DB query failed' } }]

    const result = await getAuditLog()
    expect(result).toEqual({
      entries: [],
      total: 0,
      page: 1,
      limit: 25,
      error: 'Failed to fetch audit log',
    })
  })

  it('respects custom page and limit parameters', async () => {
    vi.mocked(getUserOrg).mockResolvedValue({
      org_id: 'org-1',
      role: 'owner',
      organizations: [{ id: 'org-1', name: 'Test', slug: 'test' }],
    })

    fromResults = [{ count: 100 }, { data: [], error: null }]

    const result = await getAuditLog(3, 10)
    expect(result.page).toBe(3)
    expect(result.limit).toBe(10)
    expect(result.total).toBe(100)
  })

  it('caps limit at 100 when an oversized limit is requested', async () => {
    vi.mocked(getUserOrg).mockResolvedValue({
      org_id: 'org-1',
      role: 'owner',
      organizations: [{ id: 'org-1', name: 'Test', slug: 'test' }],
    })

    fromResults = [{ count: 500 }, { data: [], error: null }]

    const result = await getAuditLog(1, 9999)
    expect(result.limit).toBe(100)
    expect(result.error).toBeUndefined()
  })
})
