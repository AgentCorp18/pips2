import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockRequirePermission = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: () => mockGetUser() },
    from: (...args: unknown[]) => mockFrom(...args),
  })),
}))

vi.mock('@/lib/permissions', () => ({
  requirePermission: (...args: unknown[]) => mockRequirePermission(...args),
}))

vi.mock('@/lib/analytics', () => ({ trackServerEvent: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createTicketFromFormContext } from '../create-ticket-from-form-action'

const USER_ID = 'aaaaaaaa-0000-4000-8000-000000000001'
const PROJECT_ID = 'bbbbbbbb-0000-4000-8000-000000000001'
const CALLER_ORG = 'cccccccc-0000-4000-8000-000000000001'
const FOREIGN_ORG = 'dddddddd-0000-4000-8000-000000000001'

const input = {
  projectId: PROJECT_ID,
  stepNumber: 5,
  title: 'Do the thing',
  description: 'details',
  priority: 'medium',
}

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

describe('createTicketFromFormContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } })
    mockRequirePermission.mockResolvedValue('member')
  })

  it('rejects an unauthenticated caller', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await createTicketFromFormContext(input)
    expect(result.error).toBe('You must be signed in')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('rejects a projectId that does not exist', async () => {
    mockFrom.mockReturnValueOnce(chain({ data: null, error: null }))
    const result = await createTicketFromFormContext(input)
    expect(result.error).toBe('Project not found')
  })

  it('rejects a project in an org the caller does not belong to', async () => {
    mockFrom.mockReturnValueOnce(chain({ data: { org_id: FOREIGN_ORG }, error: null }))
    mockRequirePermission.mockRejectedValue(new Error('Not a member of this organization'))

    const result = await createTicketFromFormContext(input)

    expect(result.error).toBe('Project not found')
    expect(mockRequirePermission).toHaveBeenCalledWith(
      FOREIGN_ORG,
      'ticket.create',
      expect.anything(),
    )
    // The insert must never be reached.
    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  it('writes the ticket into the project org, not the caller first membership', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockFrom
      .mockReturnValueOnce(chain({ data: { org_id: CALLER_ORG }, error: null }))
      .mockReturnValueOnce({ insert })

    const result = await createTicketFromFormContext(input)

    expect(result.success).toBe(true)
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ org_id: CALLER_ORG }))
  })
})
