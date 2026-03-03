import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

let fromCallIndex = 0
let fromResults: Array<{ data?: unknown; error?: unknown }> = []

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

const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { createProject } from '../actions'

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
    // from('org_members').select().eq().limit().single() -> null
    fromResults = [{ data: null }]

    const fd = makeFormData({ name: 'My Project', description: '', target_completion_date: '' })
    const result = await createProject(emptyState, fd)
    expect(result).toEqual({ error: 'You must belong to an organization to create a project' })
  })

  /* ---------- DB error paths ---------- */

  it('returns error when project insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('org_members') -> membership
      { data: { org_id: 'org-1' } },
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
      // from('org_members') -> membership
      { data: { org_id: 'org-1' } },
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

  it('redirects to project page on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('org_members') -> membership
      { data: { org_id: 'org-1' } },
      // from('projects').insert().select().single() -> success
      { data: { id: 'proj-new' } },
      // from('project_steps').insert() -> success
      { error: null },
      // from('project_members').insert() -> success
      { error: null },
    ]

    const fd = makeFormData({ name: 'My Project', description: '', target_completion_date: '' })
    await expect(createProject(emptyState, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/projects/proj-new')
  })

  it('still redirects when project member insert fails (non-critical)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('org_members') -> membership
      { data: { org_id: 'org-1' } },
      // from('projects').insert().select().single() -> success
      { data: { id: 'proj-new' } },
      // from('project_steps').insert() -> success
      { error: null },
      // from('project_members').insert() -> non-critical error
      { error: { message: 'Member error' } },
    ]

    const fd = makeFormData({
      name: 'My Project',
      description: 'A great project',
      target_completion_date: '',
    })
    await expect(createProject(emptyState, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/projects/proj-new')
  })

  it('accepts valid optional description and target date', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { org_id: 'org-1' } },
      { data: { id: 'proj-new' } },
      { error: null },
      { error: null },
    ]

    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const dateStr = futureDate.toISOString().split('T')[0]!

    const fd = makeFormData({
      name: 'My Project',
      description: 'Description here',
      target_completion_date: dateStr,
    })
    await expect(createProject(emptyState, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/projects/proj-new')
  })
})
