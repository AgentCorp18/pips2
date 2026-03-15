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
        const p = terminal()
        return p.then.bind(p)
      }
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

vi.mock('@/lib/get-current-org', () => ({
  getCurrentOrg: vi.fn().mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' }),
  ORG_COOKIE_NAME: 'pips-org-id',
}))

vi.mock('@/lib/analytics', () => ({
  trackServerEvent: vi.fn(),
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

// getInitiativeProgress still uses createClient directly
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import {
  createInitiative,
  getInitiatives,
  getInitiativeDetail,
  getInitiativeProgress,
  updateInitiative,
  archiveInitiative,
  addProjectToInitiative,
  removeProjectFromInitiative,
} from '../actions'
import { requirePermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth-context'

/* ============================================================
   Helpers
   ============================================================ */

const makeFormData = (fields: Record<string, string>): FormData => {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value)
  }
  return fd
}

const validInitiativeFields = {
  title: 'Reduce Customer Churn',
  description: 'A strategic initiative to improve retention',
  objective: 'Lower churn rate by 15%',
  target_metric: 'Monthly churn rate',
  baseline_value: '8%',
  target_value: '5%',
  target_start: '2026-01-01',
  target_end: '2026-12-31',
  color: '#4F46E5',
  tags: 'retention, growth',
}

/* ============================================================
   createInitiative
   ============================================================ */

describe('createInitiative', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns fieldErrors when title is missing', async () => {
    const fd = makeFormData({ ...validInitiativeFields, title: '' })
    const result = await createInitiative({}, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.title).toBeDefined()
  })

  it('returns fieldErrors when title is too short', async () => {
    const fd = makeFormData({ ...validInitiativeFields, title: 'AB' })
    const result = await createInitiative({}, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.title).toBeDefined()
  })

  it('returns fieldErrors when title is too long', async () => {
    const fd = makeFormData({ ...validInitiativeFields, title: 'x'.repeat(201) })
    const result = await createInitiative({}, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.title).toBeDefined()
  })

  it('returns error when user is not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const fd = makeFormData(validInitiativeFields)
    const result = await createInitiative({}, fd)
    expect(result).toEqual({ error: 'You must be signed in' })
  })

  it('returns error when user has no organization', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(getAuthContext).mockResolvedValueOnce({
      supabase: mockSupabase as never,
      user: { id: 'user-1' } as never,
      orgId: null,
    })
    const fd = makeFormData(validInitiativeFields)
    const result = await createInitiative({}, fd)
    expect(result).toEqual({ error: 'You must belong to an organization' })
  })

  it('checks initiative.create permission', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { id: 'init-1' }, error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const fd = makeFormData(validInitiativeFields)
    await createInitiative({}, fd)
    expect(requirePermission).toHaveBeenCalledWith('org-1', 'initiative.create')
  })

  it('returns error when permission is denied', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))

    const fd = makeFormData(validInitiativeFields)
    const result = await createInitiative({}, fd)
    expect(result).toEqual({ error: 'You do not have permission to create initiatives' })
  })

  it('creates initiative successfully and returns redirect', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { id: 'init-123' }, error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const fd = makeFormData(validInitiativeFields)
    const result = await createInitiative({}, fd)
    expect(result).toEqual({ success: true, redirectTo: '/initiatives/init-123' })
    expect(revalidatePath).toHaveBeenCalledWith('/initiatives')
  })

  it('creates initiative with minimal required fields only', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { id: 'init-456' }, error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const fd = makeFormData({
      title: 'Minimal Initiative',
      description: '',
      objective: '',
      target_metric: '',
      baseline_value: '',
      target_value: '',
      target_start: '',
      target_end: '',
      color: '#4F46E5',
      tags: '',
    })
    const result = await createInitiative({}, fd)
    expect(result).toEqual({ success: true, redirectTo: '/initiatives/init-456' })
  })

  it('returns error when insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: { message: 'DB constraint violation' } }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const fd = makeFormData(validInitiativeFields)
    const result = await createInitiative({}, fd)
    expect(result).toEqual({ error: 'Failed to create initiative. Please try again.' })
  })

  it('returns error when insert returns null data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const fd = makeFormData(validInitiativeFields)
    const result = await createInitiative({}, fd)
    expect(result).toEqual({ error: 'Failed to create initiative. Please try again.' })
  })
})

/* ============================================================
   getInitiatives
   ============================================================ */

describe('getInitiatives', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getInitiatives()
    expect(result).toEqual({ initiatives: [], error: 'Not authenticated' })
  })

  it('returns error when user has no organization', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(getAuthContext).mockResolvedValueOnce({
      supabase: mockSupabase as never,
      user: { id: 'user-1' } as never,
      orgId: null,
    })

    const result = await getInitiatives()
    expect(result).toEqual({ initiatives: [], error: 'No organization' })
  })

  it('returns initiatives list with project_count', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      {
        data: [
          {
            id: 'init-1',
            title: 'Reduce Churn',
            status: 'active',
            owner_id: 'user-1',
            owner: { id: 'user-1', display_name: 'Alice' },
            initiative_projects: [{ id: 'ip-1' }, { id: 'ip-2' }],
          },
          {
            id: 'init-2',
            title: 'Grow Revenue',
            status: 'draft',
            owner_id: 'user-2',
            owner: { id: 'user-2', display_name: 'Bob' },
            initiative_projects: [],
          },
        ],
        error: null,
      },
    ]

    const result = await getInitiatives()
    expect(result.error).toBeUndefined()
    expect(result.initiatives).toHaveLength(2)
    expect(result.initiatives![0]!.project_count).toBe(2)
    expect(result.initiatives![1]!.project_count).toBe(0)
  })

  it('fills in fallback owner when owner is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      {
        data: [
          {
            id: 'init-1',
            title: 'Orphan Initiative',
            status: 'active',
            owner_id: 'user-99',
            owner: null,
            initiative_projects: [],
          },
        ],
        error: null,
      },
    ]

    const result = await getInitiatives()
    expect(result.initiatives![0]!.owner).toEqual({ id: 'user-99', display_name: 'Unknown' })
  })

  it('returns error message when query fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getInitiatives()
    expect(result).toEqual({ initiatives: [], error: 'DB error' })
  })

  it('handles null data as empty array', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: null }]

    const result = await getInitiatives()
    expect(result.initiatives).toEqual([])
  })
})

/* ============================================================
   getInitiativeDetail
   ============================================================ */

describe('getInitiativeDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getInitiativeDetail('init-1')
    expect(result).toEqual({ initiative: null, error: 'Not authenticated' })
  })

  it('returns initiative with relations when found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const initiativeData = {
      id: 'init-1',
      title: 'Reduce Churn',
      status: 'active',
      owner_id: 'user-1',
      owner: { id: 'user-1', display_name: 'Alice', avatar_url: null },
      initiative_projects: [
        {
          id: 'ip-1',
          initiative_id: 'init-1',
          project_id: 'proj-1',
          added_by: 'user-1',
          added_at: '2026-01-01',
          notes: null,
          project: {
            id: 'proj-1',
            title: 'Auth Revamp',
            status: 'active',
            current_step: '2',
            owner_id: 'user-1',
            priority: 'high',
          },
        },
      ],
    }
    fromResults = [{ data: initiativeData, error: null }]

    const result = await getInitiativeDetail('init-1')
    expect(result.error).toBeUndefined()
    expect(result.initiative?.id).toBe('init-1')
    expect(result.initiative?.project_count).toBe(1)
    expect(result.initiative?.projects).toHaveLength(1)
  })

  it('fills in fallback owner when owner is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      {
        data: {
          id: 'init-1',
          owner_id: 'user-99',
          owner: null,
          initiative_projects: [],
        },
        error: null,
      },
    ]

    const result = await getInitiativeDetail('init-1')
    expect(result.initiative?.owner).toEqual({
      id: 'user-99',
      display_name: 'Unknown',
      avatar_url: null,
    })
  })

  it('returns error when initiative is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: { message: 'Not found' } }]

    const result = await getInitiativeDetail('non-existent')
    expect(result).toEqual({ initiative: null, error: 'Not found' })
  })

  it('returns error when data is null but no DB error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: null }]

    const result = await getInitiativeDetail('init-1')
    expect(result.initiative).toBeNull()
    expect(result.error).toBe('Not found')
  })
})

/* ============================================================
   getInitiativeProgress
   ============================================================ */

describe('getInitiativeProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns zero progress when no projects are linked', async () => {
    fromResults = [{ data: [], error: null }]

    const result = await getInitiativeProgress('init-1')
    expect(result).toEqual({
      total_projects: 0,
      completed_projects: 0,
      in_progress_projects: 0,
      total_tickets: 0,
      completed_tickets: 0,
      weighted_progress: 0,
    })
  })

  it('returns zero progress when links data is null', async () => {
    fromResults = [{ data: null, error: null }]

    const result = await getInitiativeProgress('init-1')
    expect(result).toEqual({
      total_projects: 0,
      completed_projects: 0,
      in_progress_projects: 0,
      total_tickets: 0,
      completed_tickets: 0,
      weighted_progress: 0,
    })
  })

  it('calculates weighted progress from ticket completion', async () => {
    fromResults = [
      // initiative_projects links
      {
        data: [
          {
            project_id: 'proj-1',
            project: { id: 'proj-1', status: 'active', priority: 'high' },
          },
        ],
        error: null,
      },
      // tickets for proj-1: 2 done out of 4
      {
        data: [
          { project_id: 'proj-1', status: 'done' },
          { project_id: 'proj-1', status: 'done' },
          { project_id: 'proj-1', status: 'todo' },
          { project_id: 'proj-1', status: 'in_progress' },
        ],
        error: null,
      },
    ]

    const result = await getInitiativeProgress('init-1')
    expect(result.total_projects).toBe(1)
    expect(result.total_tickets).toBe(4)
    expect(result.completed_tickets).toBe(2)
    // 2/4 = 50%, weight=4 (high) -> weighted_progress = 50
    expect(result.weighted_progress).toBe(50)
  })

  it('counts completed and in_progress projects correctly', async () => {
    fromResults = [
      {
        data: [
          {
            project_id: 'proj-1',
            project: { id: 'proj-1', status: 'completed', priority: 'medium' },
          },
          {
            project_id: 'proj-2',
            project: { id: 'proj-2', status: 'active', priority: 'low' },
          },
          {
            project_id: 'proj-3',
            project: { id: 'proj-3', status: 'draft', priority: 'high' },
          },
        ],
        error: null,
      },
      // No tickets
      { data: [], error: null },
    ]

    const result = await getInitiativeProgress('init-1')
    expect(result.total_projects).toBe(3)
    expect(result.completed_projects).toBe(1)
    expect(result.in_progress_projects).toBe(1)
  })

  it('uses project status as proxy when project has no tickets', async () => {
    fromResults = [
      {
        data: [
          {
            project_id: 'proj-1',
            project: { id: 'proj-1', status: 'completed', priority: 'medium' },
          },
        ],
        error: null,
      },
      // No tickets for proj-1
      { data: [], error: null },
    ]

    const result = await getInitiativeProgress('init-1')
    // completed with no tickets -> progress = 1 (100%)
    expect(result.weighted_progress).toBe(100)
  })

  it('calculates weighted average across multiple projects with different priorities', async () => {
    fromResults = [
      {
        data: [
          {
            project_id: 'proj-critical',
            project: { id: 'proj-critical', status: 'active', priority: 'critical' },
          },
          {
            project_id: 'proj-low',
            project: { id: 'proj-low', status: 'completed', priority: 'low' },
          },
        ],
        error: null,
      },
      // proj-critical: 0/2 done; proj-low: no tickets (completed -> 100%)
      {
        data: [
          { project_id: 'proj-critical', status: 'todo' },
          { project_id: 'proj-critical', status: 'in_progress' },
        ],
        error: null,
      },
    ]

    const result = await getInitiativeProgress('init-1')
    // critical weight=5, progress=0 → 0; low weight=2, progress=1 → 2
    // totalWeight=7, weightedComplete=2 → round(2/7 * 100) = 29
    expect(result.weighted_progress).toBe(29)
  })
})

/* ============================================================
   updateInitiative
   ============================================================ */

describe('updateInitiative', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error for invalid data', async () => {
    // title too short
    const result = await updateInitiative('init-1', { title: 'AB' })
    expect(result.error).toBeDefined()
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await updateInitiative('init-1', { status: 'active' })
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when user has no organization', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(getAuthContext).mockResolvedValueOnce({
      supabase: mockSupabase as never,
      user: { id: 'user-1' } as never,
      orgId: null,
    })

    const result = await updateInitiative('init-1', { status: 'active' })
    expect(result).toEqual({ error: 'No organization' })
  })

  it('returns error when permission is denied', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))

    const result = await updateInitiative('init-1', { status: 'active' })
    expect(result).toEqual({ error: 'Insufficient permissions' })
  })

  it('checks initiative.update permission', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    await updateInitiative('init-1', { status: 'active' })
    expect(requirePermission).toHaveBeenCalledWith('org-1', 'initiative.update')
  })

  it('updates initiative successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await updateInitiative('init-1', {
      title: 'Updated Initiative Title',
      status: 'active',
    })
    expect(result).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith('/initiatives')
    expect(revalidatePath).toHaveBeenCalledWith('/initiatives/init-1')
  })

  it('returns error when update query fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: { message: 'DB error' } }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await updateInitiative('init-1', { status: 'on_hold' })
    expect(result).toEqual({ error: 'DB error' })
  })

  it('accepts valid color hex update', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await updateInitiative('init-1', { color: '#FF5500' })
    expect(result).toEqual({})
  })
})

/* ============================================================
   archiveInitiative
   ============================================================ */

describe('archiveInitiative', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await archiveInitiative('init-1')
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when user has no organization', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(getAuthContext).mockResolvedValueOnce({
      supabase: mockSupabase as never,
      user: { id: 'user-1' } as never,
      orgId: null,
    })

    const result = await archiveInitiative('init-1')
    expect(result).toEqual({ error: 'No organization' })
  })

  it('returns error when permission is denied', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))

    const result = await archiveInitiative('init-1')
    expect(result).toEqual({ error: 'Insufficient permissions' })
  })

  it('checks initiative.delete permission', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    await archiveInitiative('init-1')
    expect(requirePermission).toHaveBeenCalledWith('org-1', 'initiative.delete')
  })

  it('archives initiative successfully (soft delete)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await archiveInitiative('init-1')
    expect(result).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith('/initiatives')
  })

  it('returns error when archive update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: { message: 'FK constraint' } }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await archiveInitiative('init-1')
    expect(result).toEqual({ error: 'FK constraint' })
  })
})

/* ============================================================
   addProjectToInitiative
   ============================================================ */

describe('addProjectToInitiative', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error for invalid initiative_id (not UUID)', async () => {
    const result = await addProjectToInitiative('not-a-uuid', 'proj-1')
    expect(result.error).toBeDefined()
  })

  it('returns error for invalid project_id (not UUID)', async () => {
    const result = await addProjectToInitiative(
      'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      'not-a-uuid',
    )
    expect(result.error).toBeDefined()
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await addProjectToInitiative(
      'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    )
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when user has no organization', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(getAuthContext).mockResolvedValueOnce({
      supabase: mockSupabase as never,
      user: { id: 'user-1' } as never,
      orgId: null,
    })
    const result = await addProjectToInitiative(
      'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    )
    expect(result).toEqual({ error: 'No organization' })
  })

  it('returns error when permission is denied', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))
    const result = await addProjectToInitiative(
      'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    )
    expect(result).toEqual({ error: 'Insufficient permissions' })
  })

  it('links project to initiative successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await addProjectToInitiative(
      'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    )
    expect(result).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith('/initiatives/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d')
  })

  it('links project with optional notes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await addProjectToInitiative(
      'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
      'This project is the main driver',
    )
    expect(result).toEqual({})
  })

  it('returns specific error when project is already linked (unique constraint 23505)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: { code: '23505', message: 'duplicate key' } }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await addProjectToInitiative(
      'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    )
    expect(result).toEqual({ error: 'This project is already linked to an initiative' })
  })

  it('returns generic error for other DB failures', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: { code: '23503', message: 'FK violation' } }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await addProjectToInitiative(
      'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    )
    expect(result).toEqual({ error: 'FK violation' })
  })
})

/* ============================================================
   removeProjectFromInitiative
   ============================================================ */

describe('removeProjectFromInitiative', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await removeProjectFromInitiative('init-1', 'proj-1')
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when user has no organization', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(getAuthContext).mockResolvedValueOnce({
      supabase: mockSupabase as never,
      user: { id: 'user-1' } as never,
      orgId: null,
    })
    const result = await removeProjectFromInitiative('init-1', 'proj-1')
    expect(result).toEqual({ error: 'No organization' })
  })

  it('returns error when permission is denied', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))
    const result = await removeProjectFromInitiative('init-1', 'proj-1')
    expect(result).toEqual({ error: 'Insufficient permissions' })
  })

  it('checks initiative.update permission', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    await removeProjectFromInitiative('init-1', 'proj-1')
    expect(requirePermission).toHaveBeenCalledWith('org-1', 'initiative.update')
  })

  it('removes project from initiative successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await removeProjectFromInitiative('init-1', 'proj-1')
    expect(result).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith('/initiatives/init-1')
  })

  it('returns error when delete fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: { message: 'Delete failed' } }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await removeProjectFromInitiative('init-1', 'proj-1')
    expect(result).toEqual({ error: 'Delete failed' })
  })
})
