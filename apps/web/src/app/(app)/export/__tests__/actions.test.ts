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

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue('admin'),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/lib/csv', () => ({
  generateCSV: vi.fn(() => 'mock-csv-content'),
}))

vi.mock('@/lib/get-current-org', () => ({
  getCurrentOrg: vi.fn().mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' }),
  ORG_COOKIE_NAME: 'pips-org-id',
}))

const mockSupabase = {
  auth: { getUser: () => mockGetUser() },
  from: () => {
    const idx = fromCallIndex++
    return createChainForIndex(idx)
  },
}

vi.mock('@/lib/auth-context', () => ({
  getAuthContext: vi.fn(async () => {
    const result = await mockGetUser()
    return {
      supabase: mockSupabase,
      user: result?.data?.user ?? null,
      orgId: 'org-1',
    }
  }),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { exportProjectsCSV, exportTicketsCSV } from '../actions'
import { generateCSV } from '@/lib/csv'
import { getAuthContext } from '@/lib/auth-context'

/* ============================================================
   exportProjectsCSV
   ============================================================ */

describe('exportProjectsCSV', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns CSV string on success', async () => {
    // Call 0: supabase.auth.getUser() — via mockGetUser
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    fromResults = [
      // Call 0: from('projects').select(...).eq(...).is(...).order(...)
      {
        data: [
          {
            id: 'proj-1',
            title: 'Project Alpha',
            status: 'active',
            current_step: 3,
            created_at: '2026-01-01',
            updated_at: '2026-02-01',
            profiles: { display_name: 'Marc' },
          },
        ],
        error: null,
      },
    ]

    const result = await exportProjectsCSV()
    expect(result).toEqual({ csv: 'mock-csv-content' })
    expect(generateCSV).toHaveBeenCalledWith(
      ['ID', 'Name', 'Status', 'Current Step', 'Owner', 'Created At', 'Updated At'],
      [['proj-1', 'Project Alpha', 'active', '3', 'Marc', '2026-01-01', '2026-02-01']],
    )
  })

  it('returns error when user has no org', async () => {
    // No user signed in
    mockGetUser.mockResolvedValue({ data: { user: null } })
    vi.mocked(getAuthContext).mockResolvedValueOnce({
      supabase: mockSupabase as never,
      user: null,
      orgId: null,
    })

    const result = await exportProjectsCSV()
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when user has no org membership', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(getAuthContext).mockResolvedValueOnce({
      supabase: mockSupabase as never,
      user: { id: 'user-1' } as never,
      orgId: null,
    })

    const result = await exportProjectsCSV()
    expect(result).toEqual({ error: 'No organization context' })
  })

  it('returns error on DB failure', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    fromResults = [
      // projects query fails
      { data: null, error: { message: 'connection refused' } },
    ]

    const result = await exportProjectsCSV()
    expect(result).toEqual({ error: 'Failed to export projects. Please try again.' })
  })
})

/* ============================================================
   exportTicketsCSV
   ============================================================ */

describe('exportTicketsCSV', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns CSV string on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    fromResults = [
      // Call 0: from('tickets').select(...).eq(...).order(...)
      {
        data: [
          {
            id: 'ticket-1',
            sequence_number: 42,
            title: 'Fix login bug',
            status: 'open',
            priority: 'high',
            type: 'bug',
            due_date: '2026-03-15',
            created_at: '2026-01-10',
            assignee: { display_name: 'Marc' },
            project: { title: 'Project Alpha' },
          },
        ],
        error: null,
      },
    ]

    const result = await exportTicketsCSV()
    expect(result).toEqual({ csv: 'mock-csv-content' })
    expect(generateCSV).toHaveBeenCalledWith(
      [
        'ID',
        'Sequence #',
        'Title',
        'Status',
        'Priority',
        'Type',
        'Assignee',
        'Project',
        'Created At',
        'Due Date',
      ],
      [
        [
          'ticket-1',
          '42',
          'Fix login bug',
          'open',
          'high',
          'bug',
          'Marc',
          'Project Alpha',
          '2026-01-10',
          '2026-03-15',
        ],
      ],
    )
  })

  it('returns CSV with projectId filter applied', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    fromResults = [
      // Call 0: from('tickets') — with projectId filter
      {
        data: [
          {
            id: 'ticket-2',
            sequence_number: 7,
            title: 'Add dashboard',
            status: 'in_progress',
            priority: 'medium',
            type: 'feature',
            due_date: null,
            created_at: '2026-02-01',
            assignee: null,
            project: { title: 'Project Beta' },
          },
        ],
        error: null,
      },
    ]

    const result = await exportTicketsCSV('proj-beta')
    expect(result).toEqual({ csv: 'mock-csv-content' })
    expect(generateCSV).toHaveBeenCalledWith(expect.any(Array), [
      [
        'ticket-2',
        '7',
        'Add dashboard',
        'in_progress',
        'medium',
        'feature',
        '',
        'Project Beta',
        '2026-02-01',
        '',
      ],
    ])
  })

  it('returns error when user has no org', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    vi.mocked(getAuthContext).mockResolvedValueOnce({
      supabase: mockSupabase as never,
      user: null,
      orgId: null,
    })

    const result = await exportTicketsCSV()
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error on DB failure', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    fromResults = [
      // tickets query fails
      { data: null, error: { message: 'timeout' } },
    ]

    const result = await exportTicketsCSV()
    expect(result).toEqual({ error: 'Failed to export tickets. Please try again.' })
  })
})
