import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

const mockGetUser = vi.fn()
const mockRequirePermission = vi.fn()
const mockRevalidatePath = vi.fn()

// Supabase chain tracking
let fromCallIndex = 0
let fromResults: Array<{ data?: unknown; error?: unknown }> = []

const createChain = (idx: number) => {
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

const mockSupabase = {
  auth: { getUser: () => mockGetUser() },
  from: () => {
    const idx = fromCallIndex++
    return createChain(idx)
  },
}

vi.mock('@/lib/auth-context', () => ({
  getAuthContext: vi.fn(async () => {
    const result = await mockGetUser()
    return {
      supabase: mockSupabase,
      user: result?.data?.user ?? null,
      orgId: result?.data?.orgId ?? null,
    }
  }),
}))

vi.mock('@/lib/permissions', () => ({
  requirePermission: (...args: unknown[]) => mockRequirePermission(...args),
}))

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

/* ============================================================
   Imports after mocks
   ============================================================ */

import { archiveProject } from '../actions'

/* ============================================================
   Helpers
   ============================================================ */

const ORG_ID = 'aaaaaaaa-0000-4000-8000-000000000001'
const PROJECT_ID = 'bbbbbbbb-0000-4000-8000-000000000001'

const setAuth = (authenticated = true) => {
  if (authenticated) {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' }, orgId: ORG_ID },
    })
  } else {
    mockGetUser.mockResolvedValue({ data: { user: null, orgId: null } })
  }
}

/* ============================================================
   Tests
   ============================================================ */

describe('archiveProject', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockRequirePermission.mockResolvedValue(undefined)
  })

  it('returns error when user is not authenticated', async () => {
    setAuth(false)
    const result = await archiveProject(PROJECT_ID)
    expect(result.error).toBeDefined()
    expect(result.error).toMatch(/not authenticated/i)
  })

  it('returns error when permission is denied', async () => {
    setAuth()
    mockRequirePermission.mockRejectedValue(new Error('Forbidden'))
    const result = await archiveProject(PROJECT_ID)
    expect(result.error).toBeDefined()
    expect(result.error).toContain("don't have permission")
  })

  it('returns error when project is not found in org', async () => {
    setAuth()
    // Select returns null
    fromResults = [{ data: null, error: null }]
    const result = await archiveProject(PROJECT_ID)
    expect(result.error).toBeDefined()
    expect(result.error).toMatch(/not found/i)
  })

  it('returns error when update fails', async () => {
    setAuth()
    // Select returns project
    fromResults = [
      { data: { id: PROJECT_ID, org_id: ORG_ID }, error: null },
      // Update fails
      { data: null, error: { message: 'DB error' } },
    ]
    const result = await archiveProject(PROJECT_ID)
    expect(result.error).toBeDefined()
    expect(result.error).toMatch(/failed to archive/i)
  })

  it('archives project and revalidates on success', async () => {
    setAuth()
    fromResults = [
      { data: { id: PROJECT_ID, org_id: ORG_ID }, error: null },
      { data: null, error: null }, // update success
    ]
    const result = await archiveProject(PROJECT_ID)
    expect(result.error).toBeUndefined()
    expect(mockRevalidatePath).toHaveBeenCalledWith('/projects')
  })

  it('checks project.update permission', async () => {
    setAuth()
    fromResults = [
      { data: { id: PROJECT_ID, org_id: ORG_ID }, error: null },
      { data: null, error: null },
    ]
    await archiveProject(PROJECT_ID)
    expect(mockRequirePermission).toHaveBeenCalledWith(ORG_ID, 'project.update', undefined)
  })
})
