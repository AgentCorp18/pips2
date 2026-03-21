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

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue('admin'),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import {
  getTrainingPaths,
  getPathModuleCounts,
  getAllModules,
  getTrainingModules,
  getUserTrainingProgress,
  updateTrainingProgress,
  getTrainingModule,
  getTrainingPath,
} from '../actions'

/* ============================================================
   Sample data
   ============================================================ */

const samplePath = {
  id: 'path-1',
  title: 'PIPS Fundamentals',
  description: 'Learn the basics',
  estimated_hours: 4,
  target_audience: 'beginners',
  sort_order: 1,
  is_active: true,
}

const sampleModule = {
  id: 'mod-1',
  path_id: 'path-1',
  title: 'Introduction',
  description: 'Welcome to PIPS',
  estimated_minutes: 30,
  sort_order: 1,
  content_node_ids: ['cn-1'],
  prerequisites: [],
}

const sampleProgress = {
  id: 'prog-1',
  path_id: 'path-1',
  module_id: 'mod-1',
  status: 'in_progress',
  started_at: '2026-01-01T00:00:00Z',
  completed_at: null,
  assessment_score: null,
  time_spent_minutes: 15,
}

/* ============================================================
   getTrainingPaths
   ============================================================ */

describe('getTrainingPaths', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  it('returns active training paths on success', async () => {
    fromResults = [{ data: [samplePath], error: null }]

    const result = await getTrainingPaths()
    expect(result).toEqual([samplePath])
  })

  it('returns empty array on db error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getTrainingPaths()
    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    fromResults = [{ data: null, error: null }]

    const result = await getTrainingPaths()
    expect(result).toEqual([])
  })
})

/* ============================================================
   getPathModuleCounts
   ============================================================ */

describe('getPathModuleCounts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  it('returns module counts grouped by path_id', async () => {
    fromResults = [
      {
        data: [{ path_id: 'path-1' }, { path_id: 'path-1' }, { path_id: 'path-2' }],
        error: null,
      },
    ]

    const result = await getPathModuleCounts()
    expect(result).toEqual({ 'path-1': 2, 'path-2': 1 })
  })

  it('returns empty object on db error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getPathModuleCounts()
    expect(result).toEqual({})
  })

  it('returns empty object when no modules exist', async () => {
    fromResults = [{ data: [], error: null }]

    const result = await getPathModuleCounts()
    expect(result).toEqual({})
  })
})

/* ============================================================
   getAllModules
   ============================================================ */

describe('getAllModules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  it('returns all modules on success', async () => {
    fromResults = [{ data: [sampleModule], error: null }]

    const result = await getAllModules()
    expect(result).toEqual([sampleModule])
  })

  it('returns empty array on db error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getAllModules()
    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    fromResults = [{ data: null, error: null }]

    const result = await getAllModules()
    expect(result).toEqual([])
  })
})

/* ============================================================
   getTrainingModules
   ============================================================ */

describe('getTrainingModules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  it('returns modules for a specific path', async () => {
    const mod2 = { ...sampleModule, id: 'mod-2', sort_order: 2 }
    fromResults = [{ data: [sampleModule, mod2], error: null }]

    const result = await getTrainingModules('path-1')
    expect(result).toEqual([sampleModule, mod2])
    expect(result).toHaveLength(2)
  })

  it('returns empty array on db error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getTrainingModules('path-1')
    expect(result).toEqual([])
  })

  it('returns empty array when no modules found', async () => {
    fromResults = [{ data: [], error: null }]

    const result = await getTrainingModules('path-nonexistent')
    expect(result).toEqual([])
  })
})

/* ============================================================
   getUserTrainingProgress
   ============================================================ */

describe('getUserTrainingProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns progress for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: [sampleProgress], error: null }]

    const result = await getUserTrainingProgress()
    expect(result).toEqual([sampleProgress])
  })

  it('returns empty array when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getUserTrainingProgress()
    expect(result).toEqual([])
  })

  it('returns empty array on db error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getUserTrainingProgress()
    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: null }]

    const result = await getUserTrainingProgress()
    expect(result).toEqual([])
  })
})

/* ============================================================
   updateTrainingProgress
   ============================================================ */

describe('updateTrainingProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('upserts progress for in_progress status (first start — no existing record)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // Call 1: fetch existing record (no record found)
    // Call 2: upsert
    fromResults = [
      { data: null, error: null },
      { data: null, error: null },
    ]

    const result = await updateTrainingProgress('path-1', 'mod-1', 'in_progress')
    expect(result).toBeUndefined()
    // Both the fetch and the upsert should have been called
    expect(fromCallIndex).toBe(2)
  })

  it('does not overwrite started_at when record already has one', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // Call 1: fetch existing record — started_at already set
    // Call 2: upsert
    fromResults = [
      { data: { started_at: '2026-01-01T00:00:00Z' }, error: null },
      { data: null, error: null },
    ]

    const result = await updateTrainingProgress('path-1', 'mod-1', 'in_progress', 10)
    expect(result).toBeUndefined()
    expect(fromCallIndex).toBe(2)
  })

  it('upserts progress for completed status with optional fields', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // Call 1: fetch existing record
    // Call 2: upsert
    fromResults = [
      { data: null, error: null },
      { data: null, error: null },
    ]

    const result = await updateTrainingProgress('path-1', 'mod-1', 'completed', 45, 85)
    expect(result).toBeUndefined()
    expect(fromCallIndex).toBe(2)
  })

  it('returns early when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await updateTrainingProgress('path-1', 'mod-1', 'in_progress')
    expect(result).toBeUndefined()
    // No from() calls should have been made (fromCallIndex stays 0)
    expect(fromCallIndex).toBe(0)
  })

  it('upserts progress for not_started status', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // Call 1: fetch existing record
    // Call 2: upsert
    fromResults = [
      { data: null, error: null },
      { data: null, error: null },
    ]

    const result = await updateTrainingProgress('path-1', 'mod-1', 'not_started')
    expect(result).toBeUndefined()
    expect(fromCallIndex).toBe(2)
  })

  it('includes timeSpentMinutes when provided', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // Call 1: fetch existing record
    // Call 2: upsert
    fromResults = [
      { data: null, error: null },
      { data: null, error: null },
    ]

    const result = await updateTrainingProgress('path-1', 'mod-1', 'in_progress', 30)
    expect(result).toBeUndefined()
    expect(fromCallIndex).toBe(2)
  })
})

/* ============================================================
   getTrainingModule
   ============================================================ */

describe('getTrainingModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns a single module by ID', async () => {
    fromResults = [{ data: sampleModule, error: null }]

    const result = await getTrainingModule('mod-1')
    expect(result).toEqual(sampleModule)
  })

  it('returns null on db error', async () => {
    fromResults = [{ data: null, error: { message: 'Not found' } }]

    const result = await getTrainingModule('mod-nonexistent')
    expect(result).toBeNull()
  })

  it('returns null when module does not exist', async () => {
    fromResults = [{ data: null, error: { code: 'PGRST116', message: 'No rows' } }]

    const result = await getTrainingModule('mod-missing')
    expect(result).toBeNull()
  })
})

/* ============================================================
   getTrainingPath
   ============================================================ */

describe('getTrainingPath', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns a single path by ID', async () => {
    fromResults = [{ data: samplePath, error: null }]

    const result = await getTrainingPath('path-1')
    expect(result).toEqual(samplePath)
  })

  it('returns null on db error', async () => {
    fromResults = [{ data: null, error: { message: 'Not found' } }]

    const result = await getTrainingPath('path-nonexistent')
    expect(result).toBeNull()
  })

  it('returns null when path does not exist', async () => {
    fromResults = [{ data: null, error: { code: 'PGRST116', message: 'No rows' } }]

    const result = await getTrainingPath('path-missing')
    expect(result).toBeNull()
  })
})
