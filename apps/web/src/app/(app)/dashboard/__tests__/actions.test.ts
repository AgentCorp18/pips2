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
  requirePermission: vi.fn(async () => 'member'),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { getDashboardStats, getProjectsByStep, getRecentActivity } from '../actions'

/* ============================================================
   getDashboardStats
   ============================================================ */

describe('getDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns all counts when queries succeed', async () => {
    fromResults = [
      // projects count
      { count: 5, error: null },
      // open tickets count
      { count: 12, error: null },
      // overdue tickets count
      { count: 3, error: null },
      // completed this month count
      { count: 8, error: null },
      // team members count
      { count: 4, error: null },
    ]

    const result = await getDashboardStats('org-1')
    expect(result).toEqual({
      activeProjects: 5,
      openTickets: 12,
      overdueTickets: 3,
      completedThisMonth: 8,
      teamMembers: 4,
    })
  })

  it('returns zeros when counts are null', async () => {
    fromResults = [
      { count: null, error: null },
      { count: null, error: null },
      { count: null, error: null },
      { count: null, error: null },
      { count: null, error: null },
    ]

    const result = await getDashboardStats('org-1')
    expect(result).toEqual({
      activeProjects: 0,
      openTickets: 0,
      overdueTickets: 0,
      completedThisMonth: 0,
      teamMembers: 0,
    })
  })

  it('returns zeros on query errors', async () => {
    fromResults = [
      { count: null, error: { message: 'error' } },
      { count: null, error: { message: 'error' } },
      { count: null, error: { message: 'error' } },
      { count: null, error: { message: 'error' } },
      { count: null, error: { message: 'error' } },
    ]

    const result = await getDashboardStats('org-1')
    expect(result).toEqual({
      activeProjects: 0,
      openTickets: 0,
      overdueTickets: 0,
      completedThisMonth: 0,
      teamMembers: 0,
    })
  })
})

/* ============================================================
   getProjectsByStep
   ============================================================ */

describe('getProjectsByStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns step distribution with project counts', async () => {
    fromResults = [
      {
        data: [
          { current_step: 'identify' },
          { current_step: 'identify' },
          { current_step: 'analyze' },
          { current_step: 'implement' },
        ],
      },
    ]

    const result = await getProjectsByStep('org-1')

    expect(result).toHaveLength(6)
    // Identify (index 0) should have count 2
    expect(result[0]?.count).toBe(2)
    // Analyze (index 1) should have count 1
    expect(result[1]?.count).toBe(1)
    // Generate (index 2) should have count 0
    expect(result[2]?.count).toBe(0)
    // Implement (index 4) should have count 1
    expect(result[4]?.count).toBe(1)
  })

  it('returns all zeros when no projects exist', async () => {
    fromResults = [{ data: [] }]

    const result = await getProjectsByStep('org-1')

    expect(result).toHaveLength(6)
    for (const step of result) {
      expect(step.count).toBe(0)
    }
  })

  it('returns all zeros when data is null', async () => {
    fromResults = [{ data: null }]

    const result = await getProjectsByStep('org-1')

    expect(result).toHaveLength(6)
    for (const step of result) {
      expect(step.count).toBe(0)
    }
  })

  it('each step has name and color properties', async () => {
    fromResults = [{ data: [] }]

    const result = await getProjectsByStep('org-1')

    for (const step of result) {
      expect(step.name).toBeDefined()
      expect(step.color).toBeDefined()
      expect(step.step).toBeDefined()
    }
  })
})

/* ============================================================
   getRecentActivity
   ============================================================ */

describe('getRecentActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns empty array when no logs exist', async () => {
    fromResults = [{ data: [] }]

    const result = await getRecentActivity('org-1')
    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    fromResults = [{ data: null }]

    const result = await getRecentActivity('org-1')
    expect(result).toEqual([])
  })

  it('maps insert actions with user display names', async () => {
    fromResults = [
      // from('audit_log') -> logs
      {
        data: [
          {
            id: 'log-1',
            action: 'insert',
            entity_type: 'ticket',
            entity_id: 'tkt-1',
            new_data: { title: 'New Ticket' },
            user_id: 'user-1',
            created_at: '2026-03-01T00:00:00Z',
          },
        ],
      },
      // from('profiles') -> user profiles
      {
        data: [{ id: 'user-1', display_name: 'Alice' }],
      },
    ]

    const result = await getRecentActivity('org-1')
    expect(result).toHaveLength(1)
    expect(result[0]?.description).toBe('Alice created ticket "New Ticket"')
    expect(result[0]?.userName).toBe('Alice')
    expect(result[0]?.action).toBe('insert')
  })

  it('maps update actions correctly', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'log-2',
            action: 'update',
            entity_type: 'project',
            entity_id: 'proj-1',
            new_data: { title: 'My Project' },
            user_id: 'user-2',
            created_at: '2026-03-01T01:00:00Z',
          },
        ],
      },
      {
        data: [{ id: 'user-2', display_name: 'Bob' }],
      },
    ]

    const result = await getRecentActivity('org-1')
    expect(result[0]?.description).toBe('Bob updated project "My Project"')
  })

  it('maps delete actions correctly', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'log-3',
            action: 'delete',
            entity_type: 'ticket',
            entity_id: 'tkt-2',
            new_data: { title: 'Deleted Ticket' },
            user_id: 'user-1',
            created_at: '2026-03-01T02:00:00Z',
          },
        ],
      },
      {
        data: [{ id: 'user-1', display_name: 'Alice' }],
      },
    ]

    const result = await getRecentActivity('org-1')
    expect(result[0]?.description).toBe('Alice deleted ticket "Deleted Ticket"')
  })

  it('shows "Unknown" for users not found in profiles', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'log-4',
            action: 'insert',
            entity_type: 'ticket',
            entity_id: 'tkt-3',
            new_data: { title: 'Orphan Ticket' },
            user_id: 'deleted-user',
            created_at: '2026-03-01T03:00:00Z',
          },
        ],
      },
      {
        data: [],
      },
    ]

    const result = await getRecentActivity('org-1')
    expect(result[0]?.userName).toBe('Unknown')
  })

  it('shows "System" when user_id is null', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'log-5',
            action: 'insert',
            entity_type: 'project',
            entity_id: 'proj-2',
            new_data: { title: 'Auto Project' },
            user_id: null,
            created_at: '2026-03-01T04:00:00Z',
          },
        ],
      },
    ]

    const result = await getRecentActivity('org-1')
    expect(result[0]?.userName).toBe('System')
  })

  it('handles unknown action types', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'log-6',
            action: 'archive',
            entity_type: 'ticket',
            entity_id: 'tkt-4',
            new_data: null,
            user_id: 'user-1',
            created_at: '2026-03-01T05:00:00Z',
          },
        ],
      },
      {
        data: [{ id: 'user-1', display_name: 'Alice' }],
      },
    ]

    const result = await getRecentActivity('org-1')
    expect(result[0]?.description).toBe('Alice performed archive on ticket')
  })

  it('respects custom limit parameter', async () => {
    fromResults = [{ data: [] }]

    const result = await getRecentActivity('org-1', 5)
    expect(result).toEqual([])
  })
})
