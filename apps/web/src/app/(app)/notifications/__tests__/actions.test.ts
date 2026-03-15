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

const mockGetUser = vi.fn()

const mockSupabase = {
  auth: {
    getUser: () => mockGetUser(),
  },
  from: () => {
    const idx = fromCallIndex++
    return createChainForIndex(idx)
  },
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}))

vi.mock('@/lib/auth-context', () => ({
  getAuthContext: vi.fn(async () => {
    const result = await mockGetUser()
    return {
      supabase: mockSupabase,
      user: result?.data?.user ?? null,
      orgId: result?.data?.user ? 'org-1' : null,
    }
  }),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../actions'

/* ============================================================
   getNotifications
   ============================================================ */

describe('getNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns empty result when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getNotifications()
    expect(result).toEqual({ notifications: [], total: 0 })
  })

  it('returns notifications with default pagination', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const notifs = [
      {
        id: 'n-1',
        type: 'ticket_assigned',
        title: 'Assigned to you',
        body: null,
        read_at: null,
        created_at: '2026-03-01T00:00:00Z',
      },
    ]
    fromResults = [{ data: notifs, count: 1, error: null }]

    const result = await getNotifications()
    expect(result.notifications).toHaveLength(1)
    expect(result.total).toBe(1)
  })

  it('supports unread_only filter', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: [], count: 0, error: null }]

    const result = await getNotifications({ unread_only: true })
    expect(result).toEqual({ notifications: [], total: 0 })
  })

  it('supports custom limit and offset', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: [], count: 50, error: null }]

    const result = await getNotifications({ limit: 10, offset: 20 })
    expect(result).toEqual({ notifications: [], total: 50 })
  })

  it('returns empty result on query error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, count: null, error: { message: 'DB error' } }]

    const result = await getNotifications()
    expect(result).toEqual({ notifications: [], total: 0 })
  })

  it('returns empty array when data is null but no error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, count: null, error: null }]

    const result = await getNotifications()
    expect(result).toEqual({ notifications: [], total: 0 })
  })
})

/* ============================================================
   markAsRead
   ============================================================ */

describe('markAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await markAsRead('notif-1')
    expect(result).toEqual({ error: 'You must be signed in' })
  })

  it('marks notification as read successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // from('notifications').update().eq().eq()
    fromResults = [{ error: null }]

    const result = await markAsRead('notif-1')
    expect(result).toEqual({})
  })

  it('returns error when update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: { message: 'DB error' } }]

    const result = await markAsRead('notif-1')
    expect(result).toEqual({ error: 'Failed to mark notification as read' })
  })
})

/* ============================================================
   markAllAsRead
   ============================================================ */

describe('markAllAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await markAllAsRead()
    expect(result).toEqual({ error: 'You must be signed in' })
  })

  it('marks all notifications as read successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // from('notifications').update().eq().is()
    fromResults = [{ error: null }]

    const result = await markAllAsRead()
    expect(result).toEqual({})
  })

  it('returns error when update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: { message: 'DB error' } }]

    const result = await markAllAsRead()
    expect(result).toEqual({ error: 'Failed to mark all notifications as read' })
  })
})

/* ============================================================
   getUnreadCount
   ============================================================ */

describe('getUnreadCount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns 0 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getUnreadCount()
    expect(result).toBe(0)
  })

  it('returns the unread count', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ count: 7, error: null }]

    const result = await getUnreadCount()
    expect(result).toBe(7)
  })

  it('returns 0 when count is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ count: null, error: null }]

    const result = await getUnreadCount()
    expect(result).toBe(0)
  })

  it('returns 0 on query error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ count: null, error: { message: 'DB error' } }]

    const result = await getUnreadCount()
    expect(result).toBe(0)
  })
})
