import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockRevalidatePath = vi.fn()
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

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { addComment } from '../comment-actions'

/* ============================================================
   Helpers
   ============================================================ */

const USER_ID = 'aaaaaaaa-0000-4000-8000-000000000001'
const TICKET_ID = 'bbbbbbbb-0000-4000-8000-000000000001'
const ORG_ID = 'cccccccc-0000-4000-8000-000000000001'
const COMMENT_ID = 'dddddddd-0000-4000-8000-000000000001'
const MENTIONED_USER_ID = 'eeeeeeee-0000-4000-8000-000000000001'

const buildChain = (overrides: Record<string, unknown> = {}) => {
  const chain: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  }
  return chain
}

/* ============================================================
   addComment
   ============================================================ */

describe('addComment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } })
    mockRequirePermission.mockResolvedValue(undefined)
    mockRevalidatePath.mockReturnValue(undefined)
  })

  it('returns fieldErrors when body is empty', async () => {
    const result = await addComment(TICKET_ID, '')
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.body).toBeTruthy()
  })

  it('returns error when user is not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    // Still need from() for the ticket lookup that won't happen, but
    // the user check happens after schema validation — need a valid body
    mockFrom.mockReturnValue(
      buildChain({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    )

    const result = await addComment(TICKET_ID, 'Hello world')
    expect(result.error).toBe('You must be signed in')
  })

  it('returns error when ticket is not found', async () => {
    mockFrom.mockReturnValue(
      buildChain({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    )

    const result = await addComment(TICKET_ID, 'Hello world')
    expect(result.error).toBe('Ticket not found')
  })

  it('inserts comment and returns commentId when no mentions', async () => {
    let callCount = 0
    mockFrom.mockImplementation((table: string) => {
      callCount++
      if (table === 'tickets') {
        return buildChain({
          single: vi
            .fn()
            .mockResolvedValue({ data: { org_id: ORG_ID, title: 'Test' }, error: null }),
        })
      }
      if (table === 'comments') {
        return buildChain({
          single: vi.fn().mockResolvedValue({ data: { id: COMMENT_ID }, error: null }),
        })
      }
      return buildChain()
    })

    const result = await addComment(TICKET_ID, 'Hello world')
    expect(result.commentId).toBe(COMMENT_ID)
    expect(result.error).toBeUndefined()
    expect(mockRevalidatePath).toHaveBeenCalledWith(`/tickets/${TICKET_ID}`)
    // notifications table should NOT be called when there are no mentions
    expect(callCount).toBe(2) // tickets + comments
  })

  it('creates mention notifications when comment contains @uuid mentions', async () => {
    const insertNotifMock = vi.fn().mockResolvedValue({ data: null, error: null })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return buildChain({
          single: vi
            .fn()
            .mockResolvedValue({ data: { org_id: ORG_ID, title: 'My Ticket' }, error: null }),
        })
      }
      if (table === 'comments') {
        return buildChain({
          single: vi.fn().mockResolvedValue({ data: { id: COMMENT_ID }, error: null }),
        })
      }
      if (table === 'profiles') {
        return buildChain({
          single: vi.fn().mockResolvedValue({
            data: { display_name: 'Alice', full_name: 'Alice Smith' },
            error: null,
          }),
        })
      }
      if (table === 'notifications') {
        return { insert: insertNotifMock }
      }
      return buildChain()
    })

    const body = `Hey @${MENTIONED_USER_ID} please check this`
    const result = await addComment(TICKET_ID, body)

    expect(result.commentId).toBe(COMMENT_ID)
    expect(insertNotifMock).toHaveBeenCalledOnce()

    const [notifRows] = insertNotifMock.mock.calls[0] as [unknown[]]
    expect(Array.isArray(notifRows)).toBe(true)
    const firstNotif = (notifRows as Record<string, unknown>[])[0]
    expect(firstNotif.user_id).toBe(MENTIONED_USER_ID)
    expect(firstNotif.type).toBe('mention')
    expect(firstNotif.org_id).toBe(ORG_ID)
    expect(firstNotif.entity_id).toBe(TICKET_ID)
  })

  it('does not create notification for self-mention', async () => {
    const insertNotifMock = vi.fn().mockResolvedValue({ data: null, error: null })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return buildChain({
          single: vi
            .fn()
            .mockResolvedValue({ data: { org_id: ORG_ID, title: 'My Ticket' }, error: null }),
        })
      }
      if (table === 'comments') {
        return buildChain({
          single: vi.fn().mockResolvedValue({ data: { id: COMMENT_ID }, error: null }),
        })
      }
      if (table === 'notifications') {
        return { insert: insertNotifMock }
      }
      return buildChain()
    })

    // Mention your own user ID — should be filtered out
    const body = `Note to self: @${USER_ID} remember this`
    const result = await addComment(TICKET_ID, body)

    expect(result.commentId).toBe(COMMENT_ID)
    // notifications insert should NOT be called since the only mention is the commenter themselves
    expect(insertNotifMock).not.toHaveBeenCalled()
  })

  it('continues successfully even if notification insert fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return buildChain({
          single: vi
            .fn()
            .mockResolvedValue({ data: { org_id: ORG_ID, title: 'My Ticket' }, error: null }),
        })
      }
      if (table === 'comments') {
        return buildChain({
          single: vi.fn().mockResolvedValue({ data: { id: COMMENT_ID }, error: null }),
        })
      }
      if (table === 'profiles') {
        return buildChain({
          single: vi
            .fn()
            .mockResolvedValue({
              data: { display_name: 'Bob', full_name: 'Bob Jones' },
              error: null,
            }),
        })
      }
      if (table === 'notifications') {
        return { insert: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }) }
      }
      return buildChain()
    })

    const body = `Hey @${MENTIONED_USER_ID} look at this`
    const result = await addComment(TICKET_ID, body)

    // Comment was saved — notification failure is non-fatal
    expect(result.commentId).toBe(COMMENT_ID)
    expect(result.error).toBeUndefined()
  })
})
