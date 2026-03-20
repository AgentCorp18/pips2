import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

let fromCallIndex = 0
let fromResults: Array<{ data?: unknown; error?: unknown }> = []

const createChainForIndex = (
  idx: number,
  results: Array<{ data?: unknown; error?: unknown }> = fromResults,
) => {
  const terminal = () => {
    const result = results[idx] ?? { data: null, error: null }
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

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: () => {
      return createChainForIndex(0)
    },
  })),
}))

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
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

import { convertToPips } from '../actions'

/* ============================================================
   convertToPips
   ============================================================ */

describe('convertToPips', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await convertToPips('project-1')
    expect(result.error).toBeDefined()
  })

  it('returns error when project not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // First .from() call is the project select — returns null (not found)
    fromResults = [{ data: null, error: null }]
    const result = await convertToPips('project-1')
    expect(result.error).toBe('Project not found')
  })

  it('returns error when project is already a PIPS project', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // Project found but is already 'pips'
    fromResults = [
      { data: { id: 'project-1', org_id: 'org-1', project_type: 'pips' }, error: null },
    ]
    const result = await convertToPips('project-1')
    expect(result.error).toBe('Project is already a PIPS project')
  })

  it('returns success with projectId when conversion succeeds', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // 1: project select — simple project found
    // 2: project update — success
    // 3: project_steps upsert — success
    fromResults = [
      { data: { id: 'project-1', org_id: 'org-1', project_type: 'simple' }, error: null },
      { data: null, error: null },
      { data: null, error: null },
    ]
    const result = await convertToPips('project-1')
    expect(result.error).toBeUndefined()
    expect(result.data?.projectId).toBe('project-1')
  })

  it('returns error when project update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { id: 'project-1', org_id: 'org-1', project_type: 'simple' }, error: null },
      { data: null, error: { message: 'update failed' } },
    ]
    const result = await convertToPips('project-1')
    expect(result.error).toBe('Failed to convert project')
  })
})
