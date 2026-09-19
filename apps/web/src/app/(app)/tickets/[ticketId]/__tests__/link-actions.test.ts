import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: () => mockGetUser() },
    from: (...args: unknown[]) => mockFrom(...args),
  })),
}))

vi.mock('@/lib/permissions', () => ({ requirePermission: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { searchTickets } from '../link-actions'

const USER_ID = 'aaaaaaaa-0000-4000-8000-000000000001'
const ORG_ID = 'cccccccc-0000-4000-8000-000000000001'
const FOREIGN_ORG = 'dddddddd-0000-4000-8000-000000000001'
const TICKET_ID = 'bbbbbbbb-0000-4000-8000-000000000001'

/** Chain stub that records .ilike() args and resolves to `result`. */
const chain = (result: { data?: unknown; error?: unknown }, calls?: Record<string, unknown[]>) => {
  const proxy: Record<string, unknown> = {}
  const p = new Proxy(proxy, {
    get(_t, prop) {
      if (prop === 'then') {
        const promise = Promise.resolve(result)
        return promise.then.bind(promise)
      }
      return (...args: unknown[]) => {
        if (calls) calls[String(prop)] = args
        return p
      }
    },
  })
  return p
}

describe('searchTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } })
  })

  it('rejects an unauthenticated caller', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await searchTickets(ORG_ID, 'thing', TICKET_ID)
    expect(result.error).toBe('You must be signed in')
  })

  it('rejects a client-supplied orgId the caller is not a member of', async () => {
    mockFrom.mockReturnValueOnce(chain({ data: null, error: null })) // membership lookup

    const result = await searchTickets(FOREIGN_ORG, 'thing', TICKET_ID)

    expect(result.error).toBe('Organization not found')
    expect(result.data).toBeUndefined()
    // No ticket query is issued.
    expect(mockFrom).toHaveBeenCalledTimes(1)
    expect(mockFrom).toHaveBeenCalledWith('org_members')
  })

  it('escapes LIKE metacharacters so % does not match every ticket', async () => {
    const calls: Record<string, unknown[]> = {}
    mockFrom
      .mockReturnValueOnce(chain({ data: { org_id: ORG_ID }, error: null }))
      .mockReturnValueOnce(chain({ data: [], error: null }, calls))

    await searchTickets(ORG_ID, '100%_off', TICKET_ID)

    expect(calls.ilike).toEqual(['title', '%100\\%\\_off%'])
  })

  it('returns results for a member of the supplied org', async () => {
    mockFrom
      .mockReturnValueOnce(chain({ data: { org_id: ORG_ID }, error: null }))
      .mockReturnValueOnce(
        chain({
          data: [{ id: TICKET_ID, title: 'Thing', sequence_number: 7, status: 'todo' }],
          error: null,
        }),
      )

    const result = await searchTickets(ORG_ID, 'thing', 'other-id')

    expect(result.error).toBeUndefined()
    expect(result.data).toHaveLength(1)
    expect(result.data?.[0]?.title).toBe('Thing')
  })
})
