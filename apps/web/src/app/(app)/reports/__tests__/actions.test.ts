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

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(),
    },
    from: () => {
      const idx = fromCallIndex++
      return createChainForIndex(idx)
    },
  })),
}))

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue('admin'),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { requirePermission } from '@/lib/permissions'
import {
  getReportsHubStats,
  getProjectHealthKpis,
  getProjectsByStep,
  getProjectsTable,
  getTeamActivityKpis,
  getTeamContributions,
} from '../actions'

/* ============================================================
   getReportsHubStats
   ============================================================ */

describe('getReportsHubStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    vi.mocked(requirePermission).mockResolvedValue('admin')
  })

  it('throws when caller is not a member of the org', async () => {
    vi.mocked(requirePermission).mockRejectedValue(new Error('Not a member of this organization'))

    await expect(getReportsHubStats('org-1')).rejects.toThrow('Not a member of this organization')
    expect(requirePermission).toHaveBeenCalledWith('org-1', 'data.view')
  })

  it('returns hub stats with counts from parallel queries', async () => {
    // Promise.all calls 3 from() queries in parallel, then 1 more for orgProjects, then 1 for forms count
    fromResults = [
      // from('projects') — active projects count
      { data: null, count: 5 },
      // from('tickets') — open tickets count
      { data: null, count: 12 },
      // from('org_members') — members count
      { data: null, count: 3 },
      // from('projects').select('id') — orgProjects for forms lookup
      { data: [{ id: 'p-1' }, { id: 'p-2' }] },
      // from('project_forms') — forms count
      { data: null, count: 8 },
    ]

    const result = await getReportsHubStats('org-1')

    expect(result).toEqual({
      activeProjects: 5,
      openTickets: 12,
      totalMembers: 3,
      formsCompleted: 8,
    })
  })

  it('returns zeros when all queries return null counts', async () => {
    fromResults = [
      { data: null, count: null },
      { data: null, count: null },
      { data: null, count: null },
      // orgProjects returns empty
      { data: [] },
    ]

    const result = await getReportsHubStats('org-1')

    expect(result).toEqual({
      activeProjects: 0,
      openTickets: 0,
      totalMembers: 0,
      formsCompleted: 0,
    })
  })

  it('returns formsCompleted=0 when no org projects exist', async () => {
    fromResults = [
      { data: null, count: 2 },
      { data: null, count: 3 },
      { data: null, count: 1 },
      // orgProjects returns null
      { data: null },
    ]

    const result = await getReportsHubStats('org-1')

    expect(result.formsCompleted).toBe(0)
  })
})

/* ============================================================
   getProjectHealthKpis
   ============================================================ */

describe('getProjectHealthKpis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns health KPIs with calculated avg step progress', async () => {
    // Promise.all: 4 parallel queries
    fromResults = [
      // from('projects') — active projects with current_step
      { data: [{ id: 'p-1', current_step: 'analyze' }], count: 1 },
      // from('tickets') — overdue tickets
      { data: null, count: 2 },
      // from('projects') — completed this month
      { data: null, count: 1 },
      // from('projects') — step progress data
      { data: [{ current_step: 'analyze' }, { current_step: 'implement' }] },
    ]

    const result = await getProjectHealthKpis('org-1')

    expect(result.activeProjects).toBe(1)
    expect(result.overdueTickets).toBe(2)
    expect(result.completedThisMonth).toBe(1)
    // analyze = index 1 -> (2/6)*100 = 33.33 -> 33
    // implement = index 4 -> (5/6)*100 = 83.33 -> 83
    // avg = (33.33 + 83.33) / 2 = 58.33 -> 58
    expect(result.avgStepProgress).toBe(58)
  })

  it('returns zero avg progress when no step data', async () => {
    fromResults = [
      { data: null, count: 0 },
      { data: null, count: 0 },
      { data: null, count: 0 },
      { data: null },
    ]

    const result = await getProjectHealthKpis('org-1')

    expect(result.avgStepProgress).toBe(0)
  })

  it('returns zero avg progress when step data is empty array', async () => {
    fromResults = [
      { data: [], count: 0 },
      { data: null, count: 0 },
      { data: null, count: 0 },
      { data: [] },
    ]

    const result = await getProjectHealthKpis('org-1')

    expect(result.avgStepProgress).toBe(0)
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

  it('returns step counts when projects exist', async () => {
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
    expect(result[0]?.count).toBe(2) // identify
    expect(result[1]?.count).toBe(1) // analyze
    expect(result[2]?.count).toBe(0) // generate
    expect(result[4]?.count).toBe(1) // implement
  })

  it('returns all zeros when no projects exist', async () => {
    fromResults = [{ data: null }]

    const result = await getProjectsByStep('org-1')

    expect(result).toHaveLength(6)
    for (const step of result) {
      expect(step.count).toBe(0)
    }
  })

  it('includes step name and color for each entry', async () => {
    fromResults = [{ data: [] }]

    const result = await getProjectsByStep('org-1')

    expect(result[0]?.name).toBe('Identify')
    expect(result[0]?.color).toBeDefined()
    expect(result[5]?.name).toBe('Evaluate')
    expect(result[5]?.color).toBeDefined()
  })
})

/* ============================================================
   getProjectsTable
   ============================================================ */

describe('getProjectsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns project table rows with ticket info', async () => {
    fromResults = [
      // from('projects') — project list
      {
        data: [
          {
            id: 'p-1',
            title: 'Alpha',
            current_step: 'analyze',
            updated_at: '2026-03-01T00:00:00Z',
          },
          {
            id: 'p-2',
            title: 'Beta',
            current_step: 'evaluate',
            updated_at: '2026-03-02T00:00:00Z',
          },
        ],
      },
      // from('tickets') — tickets for those projects
      {
        data: [
          { project_id: 'p-1', status: 'todo', due_date: '2020-01-01' },
          { project_id: 'p-1', status: 'in_progress', due_date: '2030-12-31' },
          { project_id: 'p-2', status: 'blocked', due_date: '2020-06-01' },
        ],
      },
    ]

    const result = await getProjectsTable('org-1')

    expect(result).toHaveLength(2)

    // p-1: analyze=index 1, progress=(2/6)*100=33
    expect(result[0]).toEqual({
      id: 'p-1',
      name: 'Alpha',
      currentStep: 'Analyze',
      progressPercent: 33,
      openTickets: 2,
      overdueCount: 1,
      lastActivity: '2026-03-01T00:00:00Z',
    })

    // p-2: evaluate=index 5, progress=(6/6)*100=100
    expect(result[1]).toEqual({
      id: 'p-2',
      name: 'Beta',
      currentStep: 'Evaluate',
      progressPercent: 100,
      openTickets: 1,
      overdueCount: 1,
      lastActivity: '2026-03-02T00:00:00Z',
    })
  })

  it('returns empty array when no projects exist', async () => {
    fromResults = [{ data: null }]

    const result = await getProjectsTable('org-1')

    expect(result).toEqual([])
  })

  it('returns empty array when projects is empty', async () => {
    fromResults = [{ data: [] }]

    const result = await getProjectsTable('org-1')

    expect(result).toEqual([])
  })

  it('handles projects with no associated tickets', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'p-1',
            title: 'Solo',
            current_step: 'identify',
            updated_at: '2026-03-01T00:00:00Z',
          },
        ],
      },
      // No tickets
      { data: [] },
    ]

    const result = await getProjectsTable('org-1')

    expect(result).toHaveLength(1)
    expect(result[0]?.openTickets).toBe(0)
    expect(result[0]?.overdueCount).toBe(0)
  })
})

/* ============================================================
   getTeamActivityKpis
   ============================================================ */

describe('getTeamActivityKpis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns team activity KPIs', async () => {
    const now = new Date()
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)

    fromResults = [
      // from('org_members') — total members
      {
        data: [
          { id: 'm-1', user_id: 'u-1' },
          { id: 'm-2', user_id: 'u-2' },
        ],
        count: 2,
      },
      // from('tickets') — completed this week
      {
        data: [
          {
            id: 't-1',
            resolved_at: oneDayAgo.toISOString(),
            created_at: twoDaysAgo.toISOString(),
          },
        ],
      },
      // from('audit_log') — active users
      {
        data: [{ user_id: 'u-1' }, { user_id: 'u-1' }, { user_id: 'u-2' }],
      },
    ]

    const result = await getTeamActivityKpis('org-1')

    expect(result.totalMembers).toBe(2)
    expect(result.activeThisWeek).toBe(2)
    expect(result.ticketsCompletedThisWeek).toBe(1)
    expect(result.avgResponseTimeDays).toBeGreaterThan(0)
  })

  it('returns zeros when no data', async () => {
    fromResults = [{ data: null, count: 0 }, { data: null }, { data: null }]

    const result = await getTeamActivityKpis('org-1')

    expect(result).toEqual({
      totalMembers: 0,
      activeThisWeek: 0,
      ticketsCompletedThisWeek: 0,
      avgResponseTimeDays: 0,
    })
  })

  it('returns avgResponseTimeDays=0 when no completed tickets', async () => {
    fromResults = [{ data: [], count: 3 }, { data: [] }, { data: [] }]

    const result = await getTeamActivityKpis('org-1')

    expect(result.avgResponseTimeDays).toBe(0)
    expect(result.ticketsCompletedThisWeek).toBe(0)
  })
})

/* ============================================================
   getTeamContributions
   ============================================================ */

describe('getTeamContributions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns team contributions sorted by completed count descending', async () => {
    fromResults = [
      // from('org_members') — members
      { data: [{ user_id: 'u-1' }, { user_id: 'u-2' }, { user_id: 'u-3' }] },
      // from('profiles') — names
      {
        data: [
          { id: 'u-1', full_name: 'Alice', display_name: null },
          { id: 'u-2', full_name: 'Bob', display_name: 'Bobby' },
          { id: 'u-3', full_name: 'Charlie', display_name: null },
        ],
      },
      // from('tickets') — completed tickets
      {
        data: [
          { assignee_id: 'u-2' },
          { assignee_id: 'u-2' },
          { assignee_id: 'u-2' },
          { assignee_id: 'u-1' },
        ],
      },
    ]

    const result = await getTeamContributions('org-1')

    expect(result).toHaveLength(3)
    // Sorted descending by completed
    expect(result[0]).toEqual({ name: 'Bobby', completed: 3 })
    expect(result[1]).toEqual({ name: 'Alice', completed: 1 })
    expect(result[2]).toEqual({ name: 'Charlie', completed: 0 })
  })

  it('returns empty array when no members', async () => {
    fromResults = [{ data: null }]

    const result = await getTeamContributions('org-1')

    expect(result).toEqual([])
  })

  it('returns empty array when members array is empty', async () => {
    fromResults = [{ data: [] }]

    const result = await getTeamContributions('org-1')

    expect(result).toEqual([])
  })

  it('uses "Unknown" when profile has no name', async () => {
    fromResults = [
      { data: [{ user_id: 'u-1' }] },
      { data: [{ id: 'u-1', full_name: null, display_name: null }] },
      { data: [] },
    ]

    const result = await getTeamContributions('org-1')

    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('Unknown')
  })

  it('uses "Unknown" when profile is missing', async () => {
    fromResults = [
      { data: [{ user_id: 'u-1' }] },
      // No matching profile
      { data: [] },
      { data: [] },
    ]

    const result = await getTeamContributions('org-1')

    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('Unknown')
  })
})
