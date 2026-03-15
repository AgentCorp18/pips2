import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

// Track results for each from() call in sequence
let fromCallIndex = 0
let fromResults: Array<{ data?: unknown; error?: unknown }> = []

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

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue('admin'),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { advanceStep, overrideStep, updateProjectStatus } from '../actions'
import { requirePermission } from '@/lib/permissions'

/* ============================================================
   Tests
   ============================================================ */

describe('advanceStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await advanceStep('proj-1', 1)
    expect(result).toEqual({ success: false, error: 'Not authenticated' })
  })

  it('returns error when project is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // from('projects').select().eq().single() -> null
    fromResults = [{ data: null }]

    const result = await advanceStep('non-existent', 1)
    expect(result).toEqual({ success: false, error: 'Project not found' })
  })

  it('returns error when user lacks permission', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // from('projects') -> project found
    fromResults = [{ data: { id: 'proj-1', org_id: 'org-1', current_step: 'identify' } }]
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))

    const result = await advanceStep('proj-1', 1)
    expect(result).toEqual({
      success: false,
      error: 'Insufficient permissions to advance steps',
    })
  })

  it('returns error when trying to advance a non-current step', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { id: 'proj-1', org_id: 'org-1', current_step: 'analyze' } }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await advanceStep('proj-1', 1)
    expect(result).toEqual({ success: false, error: 'Can only advance the current step' })
  })

  it('returns error when step update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('projects').select().eq().single() -> project found
      { data: { id: 'proj-1', org_id: 'org-1', current_step: 'identify' } },
      // from('project_steps').update().eq().eq() -> error
      { error: { message: 'DB error' } },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await advanceStep('proj-1', 1)
    expect(result).toEqual({ success: false, error: 'Failed to complete step' })
  })

  it('returns success when step is advanced correctly', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('projects').select().eq().single() -> project found
      { data: { id: 'proj-1', org_id: 'org-1', current_step: 'generate' } },
      // from('project_steps').update().eq().eq() -> success
      { error: null },
      // from('projects').update().eq() -> success
      { error: null },
      // from('project_steps').update().eq().eq() -> success
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await advanceStep('proj-1', 3)
    expect(result).toEqual({ success: true })
  })

  it('checks step.complete permission', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { id: 'proj-1', org_id: 'org-1', current_step: 'identify' } },
      { error: null },
      { error: null },
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    await advanceStep('proj-1', 1)
    expect(requirePermission).toHaveBeenCalledWith('org-1', 'step.complete')
  })
})

describe('overrideStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await overrideStep('proj-1', 1)
    expect(result).toEqual({ success: false, error: 'Not authenticated' })
  })

  it('returns error when project is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null }]

    const result = await overrideStep('non-existent', 1)
    expect(result).toEqual({ success: false, error: 'Project not found' })
  })

  it('returns error when user lacks permission', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { id: 'proj-1', org_id: 'org-1', current_step: 'identify' } }]
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))

    const result = await overrideStep('proj-1', 1)
    expect(result).toEqual({
      success: false,
      error: 'Insufficient permissions to override steps',
    })
  })

  it('returns error when trying to override a non-current step', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { id: 'proj-1', org_id: 'org-1', current_step: 'generate' } }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await overrideStep('proj-1', 2)
    expect(result).toEqual({ success: false, error: 'Can only override the current step' })
  })

  it('checks step.override permission', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { id: 'proj-1', org_id: 'org-1', current_step: 'identify' } },
      { error: null },
      { error: null },
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    await overrideStep('proj-1', 1)
    expect(requirePermission).toHaveBeenCalledWith('org-1', 'step.override')
  })

  it('returns success when step is overridden correctly', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { id: 'proj-1', org_id: 'org-1', current_step: 'analyze' } },
      { error: null },
      { error: null },
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await overrideStep('proj-1', 2)
    expect(result).toEqual({ success: true })
  })

  it('returns error when skip fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { id: 'proj-1', org_id: 'org-1', current_step: 'analyze' } },
      { error: { message: 'DB fail' } },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await overrideStep('proj-1', 2)
    expect(result).toEqual({ success: false, error: 'Failed to skip step' })
  })
})

describe('updateProjectStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await updateProjectStatus('proj-1', 'on_hold')
    expect(result).toEqual({ success: false, error: 'Not authenticated' })
  })

  it('returns error when project is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null }]

    const result = await updateProjectStatus('non-existent', 'completed')
    expect(result).toEqual({ success: false, error: 'Project not found' })
  })

  it('returns error when user lacks permission', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { id: 'proj-1', org_id: 'org-1' } }]
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))

    const result = await updateProjectStatus('proj-1', 'cancelled')
    expect(result).toEqual({
      success: false,
      error: 'Insufficient permissions to update project status',
    })
  })

  it('checks project.update permission', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { id: 'proj-1', org_id: 'org-1' } }, { error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    await updateProjectStatus('proj-1', 'active')
    expect(requirePermission).toHaveBeenCalledWith('org-1', 'project.update')
  })

  it('returns success when status is updated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { id: 'proj-1', org_id: 'org-1' } }, { error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await updateProjectStatus('proj-1', 'on_hold')
    expect(result).toEqual({ success: true })
  })

  it('returns error when update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { id: 'proj-1', org_id: 'org-1' } }, { error: { message: 'DB error' } }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await updateProjectStatus('proj-1', 'completed')
    expect(result).toEqual({ success: false, error: 'Failed to update project status' })
  })
})
