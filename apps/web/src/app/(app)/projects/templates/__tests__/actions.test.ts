import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

let fromCallIndex = 0
let fromResults: Array<{ data?: unknown; error?: unknown }> = []

const createChain = (idx: number, results: Array<{ data?: unknown; error?: unknown }> = fromResults) => {
  const terminal = () => {
    const result = results[idx] ?? { data: null, error: null }
    return Promise.resolve(result)
  }
  const proxy: Record<string, unknown> = {}
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (prop === 'then') {
        const p = terminal()
        return p.then.bind(p)
      }
      return (..._args: unknown[]) => new Proxy(proxy, handler)
    },
  }
  return new Proxy(proxy, handler)
}

const mockGetUser = vi.fn()

let adminFromCallIndex = 0
let adminFromResults: Array<{ data?: unknown; error?: unknown }> = []

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: () => {
      const idx = adminFromCallIndex++
      return createChain(idx, adminFromResults)
    },
  })),
}))

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/analytics', () => ({
  trackServerEvent: vi.fn(),
}))

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
      orgId: 'org-1',
    }
  }),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { applyTemplate } from '../actions'
import { getAuthContext } from '@/lib/auth-context'

/* ============================================================
   Tests
   ============================================================ */

describe('applyTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    adminFromCallIndex = 0
    adminFromResults = []
  })

  /* ---------- Input validation ---------- */

  it('returns error when projectTitle is empty', async () => {
    const result = await applyTemplate('manufacturing-defect-reduction', '   ')
    expect(result).toEqual({ error: 'Project title is required' })
  })

  it('returns error when projectTitle is too short', async () => {
    const result = await applyTemplate('manufacturing-defect-reduction', 'AB')
    expect(result).toEqual({ error: 'Project title must be at least 3 characters' })
  })

  it('returns error when projectTitle is too long', async () => {
    const result = await applyTemplate('manufacturing-defect-reduction', 'x'.repeat(201))
    expect(result).toEqual({ error: 'Project title must be 200 characters or fewer' })
  })

  it('returns error when templateId does not exist', async () => {
    const result = await applyTemplate('non-existent-template', 'My Project')
    expect(result).toEqual({ error: 'Template not found' })
  })

  /* ---------- Auth errors ---------- */

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await applyTemplate('manufacturing-defect-reduction', 'My Project')
    expect(result).toEqual({ error: 'You must be signed in to create a project' })
  })

  it('returns error when orgId is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(getAuthContext).mockResolvedValueOnce({
      supabase: mockSupabase as never,
      user: { id: 'user-1' } as never,
      orgId: null,
    })
    const result = await applyTemplate('manufacturing-defect-reduction', 'My Project')
    expect(result).toEqual({ error: 'You must belong to an organization to create a project' })
  })

  /* ---------- DB error paths ---------- */

  it('returns error when project insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // projects.insert().select().single() -> error
      { data: null, error: { message: 'DB error' } },
    ]
    const result = await applyTemplate('manufacturing-defect-reduction', 'My Project')
    expect(result).toEqual({ error: 'Failed to create project. Please try again.' })
  })

  it('returns error and cleans up when steps creation fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // projects.insert().select().single() -> success
      { data: { id: 'proj-new' } },
      // project_steps.upsert() -> error
      { error: { message: 'Steps error' } },
      // cleanup delete
      { error: null },
    ]
    const result = await applyTemplate('manufacturing-defect-reduction', 'My Project')
    expect(result).toEqual({ error: 'Failed to initialize project steps. Please try again.' })
  })

  it('returns error and cleans up when project_members insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // projects.insert().select().single() -> success
      { data: { id: 'proj-new' } },
      // project_steps.upsert() -> success
      { error: null },
      // cleanup delete
      { error: null },
    ]
    adminFromResults = [
      // project_members.insert() -> error
      { error: { message: 'Member error' } },
    ]
    const result = await applyTemplate('manufacturing-defect-reduction', 'My Project')
    expect(result).toEqual({ error: 'Failed to add you as project lead. Please try again.' })
  })

  /* ---------- Success path ---------- */

  it('returns projectId on success for a valid template', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // projects.insert().select().single() -> success
      { data: { id: 'proj-abc' } },
      // project_steps.upsert() -> success
      { error: null },
      // project_forms.upsert() -> success
      { error: null },
    ]
    adminFromResults = [
      // project_members.insert() -> success
      { error: null },
      // chat_channels.insert().select().single() -> success
      { data: { id: 'chan-1' } },
      // chat_channel_members.insert() -> success
      { error: null },
    ]
    const result = await applyTemplate('manufacturing-defect-reduction', 'My Defect Project')
    expect(result).toEqual({ projectId: 'proj-abc' })
  })

  it('trims whitespace from project title', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { id: 'proj-abc' } },
      { error: null },
      { error: null },
    ]
    adminFromResults = [
      { error: null },
      { data: { id: 'chan-1' } },
      { error: null },
    ]
    // Title with surrounding whitespace — should pass validation (len = 15 after trim)
    const result = await applyTemplate('manufacturing-defect-reduction', '  Valid Title  ')
    expect(result).toEqual({ projectId: 'proj-abc' })
  })

  it('succeeds for each of the 10 system template IDs with mocked DB', async () => {
    const { SYSTEM_TEMPLATES } = await import('@/lib/form-templates')
    for (const template of SYSTEM_TEMPLATES) {
      vi.clearAllMocks()
      fromCallIndex = 0
      fromResults = [
        { data: { id: `proj-${template.id}` } },
        { error: null },
        { error: null },
      ]
      adminFromCallIndex = 0
      adminFromResults = [
        { error: null },
        { data: { id: 'chan-1' } },
        { error: null },
      ]
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

      const result = await applyTemplate(template.id, 'Test Project Name')
      expect(result, `Template ${template.id} should succeed`).toEqual({
        projectId: `proj-${template.id}`,
      })
    }
  })
})
