import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mock Supabase client
   ============================================================ */

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockIs = vi.fn()
const mockOr = vi.fn()
const mockLimit = vi.fn()
const mockTextSearch = vi.fn()
const mockSingle = vi.fn()

const buildChain = () => ({
  select: mockSelect,
  eq: mockEq,
  is: mockIs,
  or: mockOr,
  limit: mockLimit,
  textSearch: mockTextSearch,
  single: mockSingle,
})

const mockFrom = vi.fn(() => buildChain())

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: 'user-1' } },
      })),
    },
    from: mockFrom,
  })),
}))

// We need to dynamically import after mocks are set up
const importActions = async () => {
  const mod = await import('../actions')
  return mod
}

/* ============================================================
   globalSearch
   ============================================================ */

describe('globalSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Set up chaining for each call: from().select().eq()...
    mockSelect.mockReturnThis()
    mockEq.mockReturnThis()
    mockIs.mockReturnThis()
    mockOr.mockReturnThis()
    mockTextSearch.mockReturnThis()

    // Default: limit resolves the promise (projects and tickets)
    mockLimit.mockResolvedValue({ data: [] })

    // single resolves for org_settings and org_members
    mockSingle.mockResolvedValue({ data: { ticket_prefix: 'PIPS', org_id: 'org-1' } })
  })

  it('returns empty when query is empty', async () => {
    const { globalSearch } = await importActions()
    const result = await globalSearch('', 'org-1')
    expect(result).toEqual({ groups: [], total: 0 })
  })

  it('returns empty when query is only whitespace', async () => {
    const { globalSearch } = await importActions()
    const result = await globalSearch('   ', 'org-1')
    expect(result).toEqual({ groups: [], total: 0 })
  })

  it('returns grouped results for valid query', async () => {
    // Configure mockLimit to return different data based on call order
    mockLimit
      .mockResolvedValueOnce({
        data: [{ id: 'proj-1', name: 'Defect Reduction', current_step: 1, status: 'active' }],
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'tkt-1',
            title: 'Fix QC process',
            sequence_number: 42,
            status: 'todo',
            project: { name: 'Defect Reduction' },
          },
        ],
      })

    const { globalSearch } = await importActions()
    const result = await globalSearch('defect', 'org-1')

    expect(result.total).toBe(2)
    expect(result.groups).toHaveLength(2)

    const projectGroup = result.groups.find((g) => g.type === 'project')
    expect(projectGroup).toBeDefined()
    expect(projectGroup?.results[0]?.title).toBe('Defect Reduction')
    expect(projectGroup?.results[0]?.url).toBe('/projects/proj-1')

    const ticketGroup = result.groups.find((g) => g.type === 'ticket')
    expect(ticketGroup).toBeDefined()
    expect(ticketGroup?.results[0]?.title).toBe('Fix QC process')
    expect(ticketGroup?.results[0]?.url).toBe('/tickets/tkt-1')
  })

  it('returns only project group when no tickets match', async () => {
    mockLimit
      .mockResolvedValueOnce({
        data: [{ id: 'proj-1', name: 'Test Project', current_step: 2, status: 'active' }],
      })
      .mockResolvedValueOnce({
        data: [],
      })

    const { globalSearch } = await importActions()
    const result = await globalSearch('test', 'org-1')

    expect(result.total).toBe(1)
    expect(result.groups).toHaveLength(1)
    expect(result.groups[0]?.type).toBe('project')
  })
})
