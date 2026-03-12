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

/* ============================================================
   Import after mocks
   ============================================================ */

import { getMyTickets } from '../actions'

/* ============================================================
   getMyTickets
   ============================================================ */

describe('getMyTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  it('returns empty groups when no tickets are found', async () => {
    fromResults = [{ data: null }]

    const result = await getMyTickets('org-1')

    expect(result).toEqual({
      overdue: [],
      dueToday: [],
      thisWeek: [],
      later: [],
    })
  })

  it('returns empty groups when tickets array is empty', async () => {
    fromResults = [{ data: [] }]

    const result = await getMyTickets('org-1')

    expect(result).toEqual({
      overdue: [],
      dueToday: [],
      thisWeek: [],
      later: [],
    })
  })

  it('groups overdue tickets correctly', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    fromResults = [
      {
        data: [
          {
            id: 't-1',
            title: 'Overdue task',
            status: 'todo',
            priority: 'high',
            due_date: yesterdayStr,
            sequence_number: 1,
            project: { id: 'p-1', title: 'Project A' },
          },
        ],
      },
    ]

    const result = await getMyTickets('org-1')

    expect(result.overdue).toHaveLength(1)
    expect(result.overdue[0]?.title).toBe('Overdue task')
    expect(result.dueToday).toHaveLength(0)
    expect(result.thisWeek).toHaveLength(0)
    expect(result.later).toHaveLength(0)
  })

  it('groups due-today tickets correctly', async () => {
    const todayStr = new Date().toISOString().split('T')[0]

    fromResults = [
      {
        data: [
          {
            id: 't-2',
            title: 'Today task',
            status: 'in_progress',
            priority: 'medium',
            due_date: todayStr,
            sequence_number: 2,
            project: { id: 'p-1', title: 'Project A' },
          },
        ],
      },
    ]

    const result = await getMyTickets('org-1')

    expect(result.dueToday).toHaveLength(1)
    expect(result.dueToday[0]?.title).toBe('Today task')
    expect(result.overdue).toHaveLength(0)
  })

  it('groups tickets with no due_date into later', async () => {
    fromResults = [
      {
        data: [
          {
            id: 't-3',
            title: 'No date task',
            status: 'backlog',
            priority: 'low',
            due_date: null,
            sequence_number: 3,
            project: null,
          },
        ],
      },
    ]

    const result = await getMyTickets('org-1')

    expect(result.later).toHaveLength(1)
    expect(result.later[0]?.title).toBe('No date task')
    expect(result.later[0]?.project).toBeNull()
  })

  it('groups far-future tickets into later', async () => {
    const farFuture = new Date()
    farFuture.setFullYear(farFuture.getFullYear() + 1)
    const farFutureStr = farFuture.toISOString().split('T')[0]

    fromResults = [
      {
        data: [
          {
            id: 't-4',
            title: 'Future task',
            status: 'todo',
            priority: 'low',
            due_date: farFutureStr,
            sequence_number: 4,
            project: { id: 'p-2', title: 'Project B' },
          },
        ],
      },
    ]

    const result = await getMyTickets('org-1')

    expect(result.later).toHaveLength(1)
    expect(result.later[0]?.title).toBe('Future task')
  })

  it('distributes multiple tickets into correct groups', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]

    fromResults = [
      {
        data: [
          {
            id: 't-1',
            title: 'Overdue',
            status: 'todo',
            priority: 'high',
            due_date: yesterdayStr,
            sequence_number: 1,
            project: null,
          },
          {
            id: 't-2',
            title: 'Due today',
            status: 'todo',
            priority: 'medium',
            due_date: todayStr,
            sequence_number: 2,
            project: null,
          },
          {
            id: 't-3',
            title: 'No date',
            status: 'backlog',
            priority: 'low',
            due_date: null,
            sequence_number: 3,
            project: null,
          },
        ],
      },
    ]

    const result = await getMyTickets('org-1')

    expect(result.overdue).toHaveLength(1)
    expect(result.dueToday).toHaveLength(1)
    expect(result.later).toHaveLength(1)
  })

  it('handles project returned as array (Supabase join quirk)', async () => {
    const todayStr = new Date().toISOString().split('T')[0]

    fromResults = [
      {
        data: [
          {
            id: 't-5',
            title: 'Array project',
            status: 'todo',
            priority: 'medium',
            due_date: todayStr,
            sequence_number: 5,
            // Supabase can return joins as arrays
            project: [{ id: 'p-1', title: 'Project A' }],
          },
        ],
      },
    ]

    const result = await getMyTickets('org-1')

    expect(result.dueToday).toHaveLength(1)
    expect(result.dueToday[0]?.project).toEqual({ id: 'p-1', title: 'Project A' })
  })

  it('handles project returned as empty array', async () => {
    const todayStr = new Date().toISOString().split('T')[0]

    fromResults = [
      {
        data: [
          {
            id: 't-6',
            title: 'Empty array project',
            status: 'todo',
            priority: 'medium',
            due_date: todayStr,
            sequence_number: 6,
            project: [],
          },
        ],
      },
    ]

    const result = await getMyTickets('org-1')

    expect(result.dueToday).toHaveLength(1)
    expect(result.dueToday[0]?.project).toBeNull()
  })

  it('maps ticket fields correctly', async () => {
    const todayStr = new Date().toISOString().split('T')[0]

    fromResults = [
      {
        data: [
          {
            id: 'ticket-abc',
            title: 'My mapped ticket',
            status: 'in_review',
            priority: 'urgent',
            due_date: todayStr,
            sequence_number: 42,
            project: { id: 'proj-xyz', title: 'Big Project' },
          },
        ],
      },
    ]

    const result = await getMyTickets('org-1')
    const ticket = result.dueToday[0]

    expect(ticket).toEqual({
      id: 'ticket-abc',
      title: 'My mapped ticket',
      status: 'in_review',
      priority: 'urgent',
      due_date: todayStr,
      sequence_number: 42,
      project: { id: 'proj-xyz', title: 'Big Project' },
    })
  })
})
