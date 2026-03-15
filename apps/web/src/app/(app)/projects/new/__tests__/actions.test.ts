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

const { mockGetCurrentOrg } = vi.hoisted(() => ({
  mockGetCurrentOrg: vi
    .fn()
    .mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' }),
}))

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
    const user = result?.data?.user ?? null
    const org = user ? await mockGetCurrentOrg() : null
    return {
      supabase: mockSupabase,
      user,
      orgId: org?.orgId ?? null,
    }
  }),
}))

// Admin client for project_members insert (bypasses RLS)
let adminFromCallIndex = 0
let adminFromResults: Array<{ data?: unknown; error?: unknown }> = []

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: () => {
      const idx = adminFromCallIndex++
      return createChainForIndex(idx, adminFromResults)
    },
  })),
}))

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/lib/get-current-org', () => ({
  getCurrentOrg: mockGetCurrentOrg,
  ORG_COOKIE_NAME: 'pips-org-id',
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { createProject } from '../actions'
import { getCurrentOrg } from '@/lib/get-current-org'

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

const emptyState = {}

/* ============================================================
   createProject
   ============================================================ */

describe('createProject', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    adminFromCallIndex = 0
    adminFromResults = []
  })

  /* ---------- Validation errors ---------- */

  it('returns fieldErrors when name is missing', async () => {
    const fd = makeFormData({ description: 'Some description' })
    const result = await createProject(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.name).toBeDefined()
  })

  it('returns fieldErrors when name is too short', async () => {
    const fd = makeFormData({ name: 'AB', description: '' })
    const result = await createProject(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.name).toBeDefined()
  })

  it('returns fieldErrors when name is too long', async () => {
    const fd = makeFormData({ name: 'x'.repeat(201), description: '' })
    const result = await createProject(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.name).toBeDefined()
  })

  /* ---------- Auth errors ---------- */

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const fd = makeFormData({ name: 'My Project', description: '', target_completion_date: '' })
    const result = await createProject(emptyState, fd)
    expect(result).toEqual({ error: 'You must be signed in to create a project' })
  })

  it('returns error when user has no organization', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(getCurrentOrg).mockResolvedValueOnce(null)

    const fd = makeFormData({ name: 'My Project', description: '', target_completion_date: '' })
    const result = await createProject(emptyState, fd)
    expect(result).toEqual({ error: 'You must belong to an organization to create a project' })
  })

  /* ---------- DB error paths ---------- */

  it('returns error when project insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('projects').insert().select().single() -> error
      { data: null, error: { message: 'DB error' } },
    ]

    const fd = makeFormData({ name: 'My Project', description: '', target_completion_date: '' })
    const result = await createProject(emptyState, fd)
    expect(result).toEqual({ error: 'Failed to create project. Please try again.' })
  })

  it('returns error and cleans up when steps creation fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('projects').insert().select().single() -> success
      { data: { id: 'proj-new' } },
      // from('project_steps').insert() -> error
      { error: { message: 'Steps error' } },
      // from('projects').delete().eq() -> cleanup
      { error: null },
    ]

    const fd = makeFormData({ name: 'My Project', description: '', target_completion_date: '' })
    const result = await createProject(emptyState, fd)
    expect(result).toEqual({ error: 'Failed to initialize project steps. Please try again.' })
  })

  /* ---------- Success path ---------- */

  it('returns success with projectId on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('projects').insert().select().single() -> success
      { data: { id: 'proj-new' } },
      // from('project_steps').insert() -> success
      { error: null },
    ]
    // admin client: from('project_members').insert() -> success
    adminFromResults = [{ error: null }]

    const fd = makeFormData({ name: 'My Project', description: '', target_completion_date: '' })
    const result = await createProject(emptyState, fd)
    expect(result).toEqual({ success: true, projectId: 'proj-new' })
  })

  it('returns error and cleans up when project member insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('projects').insert().select().single() -> success
      { data: { id: 'proj-new' } },
      // from('project_steps').insert() -> success
      { error: null },
      // from('projects').delete().eq() -> cleanup after memberError
      { error: null },
    ]
    // admin client: from('project_members').insert() -> error
    adminFromResults = [{ error: { message: 'Member error' } }]

    const fd = makeFormData({
      name: 'My Project',
      description: 'A great project',
      target_completion_date: '',
    })
    const result = await createProject(emptyState, fd)
    expect(result).toEqual({ error: 'Failed to add you as project lead. Please try again.' })
  })

  it('accepts valid optional description and target date', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { id: 'proj-new' } }, { error: null }]
    // admin client: from('project_members').insert() -> success
    adminFromResults = [{ error: null }]

    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const dateStr = futureDate.toISOString().split('T')[0]!

    const fd = makeFormData({
      name: 'My Project',
      description: 'Description here',
      target_completion_date: dateStr,
    })
    const result = await createProject(emptyState, fd)
    expect(result).toEqual({ success: true, projectId: 'proj-new' })
  })
})
