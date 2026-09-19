import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockGetCurrentOrg = vi.fn()
const mockRequirePermission = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: () => mockGetUser() },
    from: (...args: unknown[]) => mockFrom(...args),
  })),
}))

vi.mock('@/lib/get-current-org', () => ({
  getCurrentOrg: (...args: unknown[]) => mockGetCurrentOrg(...args),
}))

vi.mock('@/lib/permissions', () => ({
  requirePermission: (...args: unknown[]) => mockRequirePermission(...args),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createTicketsFromChecklist } from '../checklist-ticket-actions'

const USER_ID = 'aaaaaaaa-0000-4000-8000-000000000001'
const PROJECT_ID = 'bbbbbbbb-0000-4000-8000-000000000001'
const ORG_ID = 'cccccccc-0000-4000-8000-000000000001'

const items = [{ text: 'Ship it', assignee: '', completed: false }]

/** Chain stub that resolves to `result` at any terminal point. */
const chain = (result: { data?: unknown; error?: unknown }) => {
  const proxy: Record<string, unknown> = {}
  const p = new Proxy(proxy, {
    get(_t, prop) {
      if (prop === 'then') {
        const promise = Promise.resolve(result)
        return promise.then.bind(promise)
      }
      return () => p
    },
  })
  return p
}

describe('createTicketsFromChecklist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } })
    mockGetCurrentOrg.mockResolvedValue({ orgId: ORG_ID })
    mockRequirePermission.mockResolvedValue('member')
  })

  it('rejects a projectId belonging to another org', async () => {
    // The project lookup is filtered on the caller org, so a foreign project
    // comes back as null.
    mockFrom.mockReturnValueOnce(chain({ data: null, error: null }))

    const result = await createTicketsFromChecklist(PROJECT_ID, items)

    expect(result.created).toBe(0)
    expect(result.error).toBe('Project not found')
    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  it('rejects a caller without ticket.create permission', async () => {
    mockFrom.mockReturnValueOnce(chain({ data: { id: PROJECT_ID }, error: null }))
    mockRequirePermission.mockRejectedValue(new Error('Insufficient permissions'))

    const result = await createTicketsFromChecklist(PROJECT_ID, items)

    expect(result.created).toBe(0)
    expect(result.error).toBe('Project not found')
    expect(mockRequirePermission).toHaveBeenCalledWith(ORG_ID, 'ticket.create', expect.anything())
  })

  it('creates tickets when the project belongs to the caller org', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockFrom
      .mockReturnValueOnce(chain({ data: { id: PROJECT_ID }, error: null })) // project check
      .mockReturnValueOnce(chain({ data: [], error: null })) // org members
      .mockReturnValueOnce({ insert }) // tickets insert

    const result = await createTicketsFromChecklist(PROJECT_ID, items)

    expect(result.created).toBe(1)
    expect(insert).toHaveBeenCalledWith([expect.objectContaining({ org_id: ORG_ID })])
  })
})
