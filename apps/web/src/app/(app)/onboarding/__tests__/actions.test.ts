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

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
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

import { checkSlugAvailability, createOrganization } from '../actions'

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
   checkSlugAvailability
   ============================================================ */

describe('checkSlugAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await checkSlugAvailability('my-org')
    expect(result).toEqual({ available: false, error: 'Unauthorized' })
  })

  it('returns error when slug fails validation', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const result = await checkSlugAvailability('INVALID SLUG!')
    expect(result.available).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('returns available: true when slug is not taken', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // from('organizations').select().eq().maybeSingle() -> null
    fromResults = [{ data: null }]

    const result = await checkSlugAvailability('my-org')
    expect(result).toEqual({ available: true })
  })

  it('returns available: false when slug is already taken', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // from('organizations').select().eq().maybeSingle() -> found
    fromResults = [{ data: { id: 'org-1' } }]

    const result = await checkSlugAvailability('taken-slug')
    expect(result).toEqual({ available: false })
  })
})

/* ============================================================
   createOrganization
   ============================================================ */

describe('createOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  /* ---------- Validation errors ---------- */

  it('returns fieldErrors when name is missing', async () => {
    const fd = makeFormData({ slug: 'valid-slug' })
    const result = await createOrganization(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.name).toBeDefined()
  })

  it('returns fieldErrors when name is too short', async () => {
    const fd = makeFormData({ name: 'A', slug: 'valid-slug' })
    const result = await createOrganization(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.name).toBeDefined()
  })

  it('returns fieldErrors when slug is missing', async () => {
    const fd = makeFormData({ name: 'Valid Org' })
    const result = await createOrganization(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.slug).toBeDefined()
  })

  it('returns fieldErrors when slug is too short', async () => {
    const fd = makeFormData({ name: 'Valid Org', slug: 'ab' })
    const result = await createOrganization(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.slug).toBeDefined()
  })

  it('returns fieldErrors when slug has invalid characters', async () => {
    const fd = makeFormData({ name: 'Valid Org', slug: 'INVALID_SLUG!' })
    const result = await createOrganization(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.slug).toBeDefined()
  })

  /* ---------- Auth errors ---------- */

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const fd = makeFormData({ name: 'My Org', slug: 'my-org' })
    const result = await createOrganization(emptyState, fd)
    expect(result).toEqual({ error: 'You must be signed in to create an organization' })
  })

  /* ---------- Slug uniqueness ---------- */

  it('returns fieldErrors when slug is already taken', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // checkSlugAvailability: from('organizations').select().eq().maybeSingle() -> exists
    fromResults = [{ data: { id: 'existing-org' } }]

    const fd = makeFormData({ name: 'My Org', slug: 'taken-slug' })
    const result = await createOrganization(emptyState, fd)
    expect(result).toEqual({ fieldErrors: { slug: 'This slug is already taken' } })
  })

  /* ---------- DB error paths ---------- */

  it('returns error when organization insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // checkSlugAvailability -> not taken
      { data: null },
      // from('organizations').insert().select().single() -> error
      { data: null, error: { message: 'DB error' } },
    ]

    const fd = makeFormData({ name: 'My Org', slug: 'my-org' })
    const result = await createOrganization(emptyState, fd)
    expect(result).toEqual({ error: 'Failed to create organization. Please try again.' })
  })

  it('returns error and cleans up org when member creation fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // checkSlugAvailability -> not taken
      { data: null },
      // from('organizations').insert().select().single() -> success
      { data: { id: 'new-org-1' } },
      // from('org_members').insert() -> error
      { error: { message: 'Member insert error' } },
      // from('organizations').delete().eq() -> cleanup
      { error: null },
    ]

    const fd = makeFormData({ name: 'My Org', slug: 'my-org' })
    const result = await createOrganization(emptyState, fd)
    expect(result).toEqual({
      error: 'Failed to set up organization membership. Please try again.',
    })
  })

  /* ---------- Success path ---------- */

  it('redirects to /dashboard on successful creation', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // checkSlugAvailability -> not taken
      { data: null },
      // from('organizations').insert().select().single() -> success
      { data: { id: 'new-org-1' } },
      // from('org_members').insert() -> success
      { error: null },
      // from('org_settings').insert() -> success
      { error: null },
    ]

    const fd = makeFormData({ name: 'My Org', slug: 'my-org' })
    await expect(createOrganization(emptyState, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('still redirects when org_settings insert fails (non-critical)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // checkSlugAvailability -> not taken
      { data: null },
      // from('organizations').insert().select().single() -> success
      { data: { id: 'new-org-1' } },
      // from('org_members').insert() -> success
      { error: null },
      // from('org_settings').insert() -> non-critical error
      { error: { message: 'Settings error' } },
    ]

    const fd = makeFormData({ name: 'My Org', slug: 'my-org' })
    await expect(createOrganization(emptyState, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })
})
