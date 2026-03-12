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

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue('member'),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { saveFormData, loadFormData } from '../actions'

/* ============================================================
   Tests
   ============================================================ */

describe('saveFormData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await saveFormData('proj-1', 1, 'problem_statement', { summary: 'test' })
    expect(result).toEqual({ success: false, error: 'Not authenticated' })
  })

  it('returns success when upsert succeeds', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // Call 0: from('projects').select('org_id') -> project found
      { data: { org_id: 'org-1' } },
      // Call 1: from('project_forms').upsert() -> success
      { error: null },
    ]

    const result = await saveFormData('proj-1', 2, 'fishbone', { categories: [] })
    expect(result).toEqual({ success: true })
  })

  it('returns error when project is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // Call 0: from('projects').select('org_id') -> not found
      { data: null },
    ]

    const result = await saveFormData('proj-unknown', 1, 'problem_statement', {})
    expect(result).toEqual({ success: false, error: 'Project not found' })
  })

  it('returns generic error message when upsert fails (no internal details leaked)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // Call 0: from('projects').select('org_id') -> project found
      { data: { org_id: 'org-1' } },
      // Call 1: from('project_forms').upsert() -> fails
      { error: { message: 'duplicate key violation' } },
    ]

    const result = await saveFormData('proj-1', 1, 'problem_statement', {})
    expect(result).toEqual({ success: false, error: 'Failed to save form data. Please try again.' })
  })

  it('can save different form types', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // Call 0: from('projects').select('org_id') -> project found
      { data: { org_id: 'org-1' } },
      // Call 1: from('project_forms').upsert() -> success
      { error: null },
    ]

    const result = await saveFormData('proj-1', 3, 'brainstorming', { ideas: ['idea1'] })
    expect(result).toEqual({ success: true })
  })

  it('can save form data for step 6', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // Call 0: from('projects').select('org_id') -> project found
      { data: { org_id: 'org-1' } },
      // Call 1: from('project_forms').upsert() -> success
      { error: null },
    ]

    const result = await saveFormData('proj-1', 6, 'lessons_learned', { notes: 'good' })
    expect(result).toEqual({ success: true })
  })
})

describe('loadFormData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns null when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await loadFormData('proj-1', 1, 'problem_statement')
    expect(result).toBeNull()
  })

  it('returns the form data when found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { data: { summary: 'Problem is...', gap: '20%' } } }]

    const result = await loadFormData('proj-1', 1, 'problem_statement')
    expect(result).toEqual({ summary: 'Problem is...', gap: '20%' })
  })

  it('returns null when no form data exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null }]

    const result = await loadFormData('proj-1', 1, 'problem_statement')
    expect(result).toBeNull()
  })

  it('returns null when data property is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { data: null } }]

    const result = await loadFormData('proj-1', 1, 'problem_statement')
    expect(result).toBeNull()
  })

  it('returns complex nested form data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const complexData = {
      categories: [
        { name: 'People', causes: ['Lack of training'] },
        { name: 'Process', causes: ['No SOP'] },
      ],
    }
    fromResults = [{ data: { data: complexData } }]

    const result = await loadFormData('proj-1', 2, 'fishbone')
    expect(result).toEqual(complexData)
  })

  it('returns array form data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const arrayData = { ideas: ['idea1', 'idea2', 'idea3'] }
    fromResults = [{ data: { data: arrayData } }]

    const result = await loadFormData('proj-1', 3, 'brainstorming')
    expect(result).toEqual(arrayData)
  })
})
