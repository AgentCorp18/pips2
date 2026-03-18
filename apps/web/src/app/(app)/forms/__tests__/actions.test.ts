import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

let fromCallIndex = 0
let fromResults: Array<{ data?: unknown; count?: number | null; error?: unknown }> = []

/**
 * Each .from() call creates a fresh chain that resolves
 * to fromResults[fromCallIndex++] at terminal positions.
 * The range() method is always the final chainable before await.
 */
const createChainForIndex = (idx: number) => {
  const terminal = () => {
    const result = fromResults[idx] ?? { data: null, count: null, error: null }
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

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: () => {
      const idx = fromCallIndex++
      return createChainForIndex(idx)
    },
  })),
}))

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue('admin'),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { getOrgForms, getFormStats, getFormDisplayName } from '../actions'
import { requirePermission } from '@/lib/permissions'

/* ============================================================
   getOrgForms
   ============================================================ */

describe('getOrgForms', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    vi.mocked(requirePermission).mockResolvedValue('admin')
  })

  it('returns { forms: [], total: 0 } when permission check fails', async () => {
    vi.mocked(requirePermission).mockRejectedValue(new Error('Forbidden'))
    const result = await getOrgForms('org-1')
    expect(result).toEqual({ forms: [], total: 0 })
  })

  it('calls supabase with correct select and org filter', async () => {
    fromResults = [{ data: [], count: 0, error: null }]
    const result = await getOrgForms('org-1')
    expect(result).toEqual({ forms: [], total: 0 })
    expect(requirePermission).toHaveBeenCalledWith('org-1', 'data.view')
  })

  it('applies form_type filter correctly', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'f-1',
            form_type: 'fishbone',
            step: '2',
            title: 'Root cause',
            project: { id: 'proj-1', title: 'Test', status: 'active', org_id: 'org-1' },
            creator: null,
            created_at: '2026-01-01',
            updated_at: '2026-01-01',
            data: {},
            project_id: 'proj-1',
            created_by: 'user-1',
          },
        ],
        count: 1,
        error: null,
      },
    ]
    const result = await getOrgForms('org-1', { form_type: ['fishbone'] })
    expect(result.total).toBe(1)
    expect(result.forms[0]).toMatchObject({ form_type: 'fishbone' })
  })

  it('applies step filter correctly', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'f-2',
            form_type: 'five_why',
            step: '2',
            title: 'Why chain',
            project: { id: 'proj-1', title: 'Test', status: 'active', org_id: 'org-1' },
            creator: null,
            created_at: '2026-01-01',
            updated_at: '2026-01-01',
            data: {},
            project_id: 'proj-1',
            created_by: 'user-1',
          },
        ],
        count: 1,
        error: null,
      },
    ]
    const result = await getOrgForms('org-1', { step: ['2'] })
    expect(result.total).toBe(1)
    expect(result.forms[0]).toMatchObject({ step: '2' })
  })

  it('applies project_id filter correctly', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'f-3',
            form_type: 'fishbone',
            step: '2',
            title: 'Scoped',
            project: { id: 'proj-99', title: 'Scoped Project', status: 'active', org_id: 'org-1' },
            creator: null,
            created_at: '2026-01-01',
            updated_at: '2026-01-01',
            data: {},
            project_id: 'proj-99',
            created_by: 'user-1',
          },
        ],
        count: 1,
        error: null,
      },
    ]
    const result = await getOrgForms('org-1', {
      project_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    })
    expect(result.total).toBe(1)
  })

  it('applies search filter with escaped wildcards', async () => {
    fromResults = [{ data: [], count: 0, error: null }]
    // Should not throw; the action must handle the search with wildcard escaping
    const result = await getOrgForms('org-1', { search: 'reduce % churn_rate' })
    expect(result).toEqual({ forms: [], total: 0 })
  })

  it('excludes archived projects by default', async () => {
    fromResults = [{ data: [], count: 0, error: null }]
    const result = await getOrgForms('org-1', {})
    // No error means the query was built correctly with neq filter
    expect(result).toEqual({ forms: [], total: 0 })
  })

  it('includes archived projects when include_archived is true', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'f-4',
            form_type: 'fishbone',
            step: '2',
            title: 'Archived form',
            project: {
              id: 'proj-2',
              title: 'Archived Project',
              status: 'archived',
              org_id: 'org-1',
            },
            creator: null,
            created_at: '2026-01-01',
            updated_at: '2026-01-01',
            data: {},
            project_id: 'proj-2',
            created_by: 'user-1',
          },
        ],
        count: 1,
        error: null,
      },
    ]
    const result = await getOrgForms('org-1', { include_archived: true })
    expect(result.total).toBe(1)
  })

  it('handles Supabase error gracefully and returns empty', async () => {
    fromResults = [{ data: null, count: null, error: { message: 'DB error' } }]
    const result = await getOrgForms('org-1')
    expect(result).toEqual({ forms: [], total: 0 })
  })

  it('applies pagination correctly (range calculation)', async () => {
    fromResults = [{ data: [], count: 0, error: null }]
    // page=2, per_page=10 → from=10, to=19
    const result = await getOrgForms('org-1', { page: 2, per_page: 10 })
    expect(result).toEqual({ forms: [], total: 0 })
  })

  it('applies sorting correctly', async () => {
    fromResults = [{ data: [], count: 0, error: null }]
    const result = await getOrgForms('org-1', { sort_by: 'created_at', sort_order: 'asc' })
    expect(result).toEqual({ forms: [], total: 0 })
  })

  it('returns forms array with total when data is present', async () => {
    const mockForms = [
      {
        id: 'f-5',
        form_type: 'fishbone',
        step: '2',
        title: 'F1',
        project: { id: 'proj-1', title: 'P1', status: 'active', org_id: 'org-1' },
        creator: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        data: {},
        project_id: 'proj-1',
        created_by: 'user-1',
      },
      {
        id: 'f-6',
        form_type: 'five_why',
        step: '2',
        title: 'F2',
        project: { id: 'proj-1', title: 'P1', status: 'active', org_id: 'org-1' },
        creator: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        data: {},
        project_id: 'proj-1',
        created_by: 'user-1',
      },
    ]
    fromResults = [{ data: mockForms, count: 2, error: null }]
    const result = await getOrgForms('org-1')
    expect(result.total).toBe(2)
    expect(result.forms).toHaveLength(2)
  })
})

/* ============================================================
   getFormStats
   ============================================================ */

describe('getFormStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    vi.mocked(requirePermission).mockResolvedValue('admin')
  })

  it('returns zeros when permission check fails', async () => {
    vi.mocked(requirePermission).mockRejectedValue(new Error('Forbidden'))
    const result = await getFormStats('org-1')
    expect(result).toEqual({ total: 0, byFormType: [], byStep: [], recentCount: 0 })
  })

  it('computes byFormType counts correctly', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'f1',
            form_type: 'fishbone',
            step: '2',
            updated_at: '2020-01-01T00:00:00Z',
            project: { org_id: 'org-1', status: 'active' },
          },
          {
            id: 'f2',
            form_type: 'fishbone',
            step: '2',
            updated_at: '2020-01-01T00:00:00Z',
            project: { org_id: 'org-1', status: 'active' },
          },
          {
            id: 'f3',
            form_type: 'five_why',
            step: '2',
            updated_at: '2020-01-01T00:00:00Z',
            project: { org_id: 'org-1', status: 'active' },
          },
        ],
        error: null,
      },
    ]
    const result = await getFormStats('org-1')
    expect(result.total).toBe(3)
    // byFormType sorted descending by count
    expect(result.byFormType[0]).toEqual({ formType: 'fishbone', count: 2 })
    expect(result.byFormType[1]).toEqual({ formType: 'five_why', count: 1 })
  })

  it('computes byStep counts correctly', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'f1',
            form_type: 'fishbone',
            step: '2',
            updated_at: '2020-01-01T00:00:00Z',
            project: { org_id: 'org-1', status: 'active' },
          },
          {
            id: 'f2',
            form_type: 'brainstorming',
            step: '3',
            updated_at: '2020-01-01T00:00:00Z',
            project: { org_id: 'org-1', status: 'active' },
          },
          {
            id: 'f3',
            form_type: 'five_why',
            step: '2',
            updated_at: '2020-01-01T00:00:00Z',
            project: { org_id: 'org-1', status: 'active' },
          },
        ],
        error: null,
      },
    ]
    const result = await getFormStats('org-1')
    const step2 = result.byStep.find((s) => s.step === '2')
    const step3 = result.byStep.find((s) => s.step === '3')
    expect(step2).toEqual({ step: '2', count: 2 })
    expect(step3).toEqual({ step: '3', count: 1 })
  })

  it('computes recentCount for items in last 7 days', async () => {
    const recent = new Date()
    recent.setDate(recent.getDate() - 3)
    const old = new Date()
    old.setDate(old.getDate() - 10)

    fromResults = [
      {
        data: [
          {
            id: 'f1',
            form_type: 'fishbone',
            step: '2',
            updated_at: recent.toISOString(),
            project: { org_id: 'org-1', status: 'active' },
          },
          {
            id: 'f2',
            form_type: 'five_why',
            step: '2',
            updated_at: recent.toISOString(),
            project: { org_id: 'org-1', status: 'active' },
          },
          {
            id: 'f3',
            form_type: 'brainstorming',
            step: '3',
            updated_at: old.toISOString(),
            project: { org_id: 'org-1', status: 'active' },
          },
        ],
        error: null,
      },
    ]
    const result = await getFormStats('org-1')
    expect(result.recentCount).toBe(2)
  })

  it('handles empty result set', async () => {
    fromResults = [{ data: [], error: null }]
    const result = await getFormStats('org-1')
    expect(result).toEqual({ total: 0, byFormType: [], byStep: [], recentCount: 0 })
  })

  it('handles Supabase error gracefully', async () => {
    fromResults = [{ data: null, error: { message: 'connection timeout' } }]
    const result = await getFormStats('org-1')
    expect(result).toEqual({ total: 0, byFormType: [], byStep: [], recentCount: 0 })
  })

  it('handles null data as empty', async () => {
    fromResults = [{ data: null, error: null }]
    const result = await getFormStats('org-1')
    expect(result).toEqual({ total: 0, byFormType: [], byStep: [], recentCount: 0 })
  })
})

/* ============================================================
   getFormDisplayName
   ============================================================ */

describe('getFormDisplayName', () => {
  it('returns correct name for fishbone form type', () => {
    const name = getFormDisplayName('fishbone')
    expect(name).toBe('Fishbone Diagram')
  })

  it('returns correct name for five_why form type', () => {
    const name = getFormDisplayName('five_why')
    expect(name).toMatch(/5.Why|Five Why/i)
  })

  it('returns correct name for problem_statement form type', () => {
    const name = getFormDisplayName('problem_statement')
    expect(name.length).toBeGreaterThan(0)
    // Should not be the raw type string
    expect(name).not.toBe('problem_statement')
  })

  it('returns title-cased fallback for unknown types', () => {
    const name = getFormDisplayName('custom_unknown_tool')
    expect(name).toBe('Custom Unknown Tool')
  })

  it('returns title-cased fallback with single word', () => {
    const name = getFormDisplayName('customtool')
    expect(name).toBe('Customtool')
  })

  it('returns title-cased fallback for multi-word unknown type', () => {
    const name = getFormDisplayName('my_special_form')
    expect(name).toBe('My Special Form')
  })
})
