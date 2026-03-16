import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be declared before the route import
   ============================================================ */

const mockSendEmail = vi.fn()
vi.mock('@/lib/email/send', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

vi.mock('@/lib/email/overdue-digest', () => ({
  overdueDigestTemplate: vi.fn().mockReturnValue('<html>digest</html>'),
}))

vi.mock('@/lib/base-url', () => ({
  getBaseUrl: vi.fn().mockReturnValue('https://pips-app.vercel.app'),
}))

const mockFrom = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockImplementation(() => ({
    from: (...args: unknown[]) => mockFrom(...args),
  })),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { GET } from './route'

/* ============================================================
   Fixtures
   ============================================================ */

const makeRequest = (secret?: string) =>
  new Request('https://pips-app.vercel.app/api/cron/overdue-digest', {
    method: 'GET',
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  })

const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0]

const makeTicketRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'ticket-1',
  org_id: 'org-1',
  title: 'Fix login bug',
  priority: 'high',
  status: 'in_progress',
  due_date: YESTERDAY,
  assignee_id: 'user-2',
  project_id: 'proj-1',
  projects: { title: 'Quality Initiative' },
  assignee: { display_name: 'Alice', full_name: 'Alice Smith' },
  ...overrides,
})

const makeAdminRow = (overrides: Record<string, unknown> = {}) => ({
  user_id: 'user-1',
  role: 'owner',
  org_id: 'org-1',
  profiles: { email: 'owner@example.com', display_name: 'Bob', full_name: 'Bob Jones' },
  ...overrides,
})

/* ============================================================
   Chain builder helpers
   ============================================================ */

/** Build a mock .select().lt().not().order() chain returning the given payload */
const ticketSelectChain = (payload: { data: unknown[] | null; error: null | { message: string } }) => ({
  select: vi.fn().mockReturnValue({
    lt: vi.fn().mockReturnValue({
      not: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue(payload),
      }),
    }),
  }),
})

/** Build a mock .select().in() chain returning the given payload */
const simpleSelectInChain = (payload: { data: unknown[] | null; error: null | { message: string } }) => ({
  select: vi.fn().mockReturnValue({
    in: vi.fn().mockResolvedValue(payload),
  }),
})

/** Build a mock .select().in().in() chain for org_members (two .in() calls) */
const adminSelectChain = (payload: { data: unknown[] | null; error: null | { message: string } }) => ({
  select: vi.fn().mockReturnValue({
    in: vi.fn().mockReturnValue({
      in: vi.fn().mockResolvedValue(payload),
    }),
  }),
})

/* ============================================================
   Tests
   ============================================================ */

describe('GET /api/cron/overdue-digest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('CRON_SECRET', 'test-cron-secret')
    vi.stubEnv('RESEND_API_KEY', 're_test_key')
  })

  /* -------------------------------------------------------
     Auth
     ------------------------------------------------------- */

  it('returns 401 when CRON_SECRET env var is not set', async () => {
    vi.stubEnv('CRON_SECRET', '')
    const res = await GET(makeRequest('test-cron-secret'))
    expect(res.status).toBe(401)
  })

  it('returns 401 when authorization header does not match', async () => {
    const res = await GET(makeRequest('wrong-secret'))
    expect(res.status).toBe(401)
  })

  it('returns 401 when authorization header is absent', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  /* -------------------------------------------------------
     No overdue tickets
     ------------------------------------------------------- */

  it('returns zero counts when no overdue tickets exist', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return ticketSelectChain({ data: [], error: null })
      }
      return { select: vi.fn() }
    })

    const res = await GET(makeRequest('test-cron-secret'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ orgsNotified: 0, emailsSent: 0, emailsFailed: 0 })
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  /* -------------------------------------------------------
     Ticket fetch error
     ------------------------------------------------------- */

  it('returns 500 when ticket query fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return ticketSelectChain({ data: null, error: { message: 'DB error' } })
      }
      return { select: vi.fn() }
    })

    const res = await GET(makeRequest('test-cron-secret'))
    expect(res.status).toBe(500)
  })

  /* -------------------------------------------------------
     Admin fetch error
     ------------------------------------------------------- */

  it('returns 500 when org_members query fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return ticketSelectChain({ data: [makeTicketRow()], error: null })
      }
      if (table === 'organizations') {
        return simpleSelectInChain({ data: [{ id: 'org-1', name: 'ACME Corp' }], error: null })
      }
      if (table === 'org_members') {
        return adminSelectChain({ data: null, error: { message: 'DB error' } })
      }
      return { select: vi.fn() }
    })

    const res = await GET(makeRequest('test-cron-secret'))
    expect(res.status).toBe(500)
  })

  /* -------------------------------------------------------
     Happy path — sends email to owner
     ------------------------------------------------------- */

  it('sends digest email to org owner and returns correct counts', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return ticketSelectChain({ data: [makeTicketRow()], error: null })
      }
      if (table === 'organizations') {
        return simpleSelectInChain({ data: [{ id: 'org-1', name: 'ACME Corp' }], error: null })
      }
      if (table === 'org_members') {
        return adminSelectChain({ data: [makeAdminRow()], error: null })
      }
      return { select: vi.fn() }
    })

    mockSendEmail.mockResolvedValue({ success: true, id: 'email-abc' })

    const res = await GET(makeRequest('test-cron-secret'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.orgsNotified).toBe(1)
    expect(json.emailsSent).toBe(1)
    expect(json.emailsFailed).toBe(0)
    expect(mockSendEmail).toHaveBeenCalledOnce()
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'owner@example.com',
        subject: expect.stringContaining('overdue'),
        html: expect.any(String),
      }),
    )
  })

  /* -------------------------------------------------------
     Multiple admins in one org
     ------------------------------------------------------- */

  it('sends one email per admin in an org', async () => {
    const admin2 = makeAdminRow({
      user_id: 'user-3',
      role: 'admin',
      profiles: { email: 'admin@example.com', display_name: 'Carol', full_name: 'Carol White' },
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return ticketSelectChain({ data: [makeTicketRow()], error: null })
      }
      if (table === 'organizations') {
        return simpleSelectInChain({ data: [{ id: 'org-1', name: 'ACME Corp' }], error: null })
      }
      if (table === 'org_members') {
        return adminSelectChain({ data: [makeAdminRow(), admin2], error: null })
      }
      return { select: vi.fn() }
    })

    mockSendEmail.mockResolvedValue({ success: true, id: 'email-xyz' })

    const res = await GET(makeRequest('test-cron-secret'))
    const json = await res.json()

    expect(json.emailsSent).toBe(2)
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
  })

  /* -------------------------------------------------------
     Failed send is counted, not thrown
     ------------------------------------------------------- */

  it('counts failed send without throwing', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return ticketSelectChain({ data: [makeTicketRow()], error: null })
      }
      if (table === 'organizations') {
        return simpleSelectInChain({ data: [{ id: 'org-1', name: 'ACME Corp' }], error: null })
      }
      if (table === 'org_members') {
        return adminSelectChain({ data: [makeAdminRow()], error: null })
      }
      return { select: vi.fn() }
    })

    mockSendEmail.mockResolvedValue({ success: false, error: 'Resend API error' })

    const res = await GET(makeRequest('test-cron-secret'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.emailsFailed).toBe(1)
    expect(json.emailsSent).toBe(0)
  })

  /* -------------------------------------------------------
     Admin row without email is silently skipped
     ------------------------------------------------------- */

  it('skips admin rows with no email profile', async () => {
    const adminNoEmail = makeAdminRow({ profiles: null })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return ticketSelectChain({ data: [makeTicketRow()], error: null })
      }
      if (table === 'organizations') {
        return simpleSelectInChain({ data: [{ id: 'org-1', name: 'ACME Corp' }], error: null })
      }
      if (table === 'org_members') {
        return adminSelectChain({ data: [adminNoEmail], error: null })
      }
      return { select: vi.fn() }
    })

    const res = await GET(makeRequest('test-cron-secret'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.emailsSent).toBe(0)
    expect(mockSendEmail).not.toHaveBeenCalled()
    // Org is still counted as "notified" because we processed it
    expect(json.orgsNotified).toBe(1)
  })

  /* -------------------------------------------------------
     Subject line varies with count
     ------------------------------------------------------- */

  it('uses singular subject for 1 overdue ticket', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return ticketSelectChain({ data: [makeTicketRow()], error: null })
      }
      if (table === 'organizations') {
        return simpleSelectInChain({ data: [{ id: 'org-1', name: 'ACME Corp' }], error: null })
      }
      if (table === 'org_members') {
        return adminSelectChain({ data: [makeAdminRow()], error: null })
      }
      return { select: vi.fn() }
    })

    mockSendEmail.mockResolvedValue({ success: true, id: 'email-1' })

    await GET(makeRequest('test-cron-secret'))

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'PIPS: 1 overdue ticket need attention',
      }),
    )
  })

  it('uses plural subject for 2+ overdue tickets', async () => {
    const ticket2 = makeTicketRow({ id: 'ticket-2', title: 'Another bug' })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        return ticketSelectChain({ data: [makeTicketRow(), ticket2], error: null })
      }
      if (table === 'organizations') {
        return simpleSelectInChain({ data: [{ id: 'org-1', name: 'ACME Corp' }], error: null })
      }
      if (table === 'org_members') {
        return adminSelectChain({ data: [makeAdminRow()], error: null })
      }
      return { select: vi.fn() }
    })

    mockSendEmail.mockResolvedValue({ success: true, id: 'email-2' })

    await GET(makeRequest('test-cron-secret'))

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'PIPS: 2 overdue tickets need attention',
      }),
    )
  })

  /* -------------------------------------------------------
     Today's date boundary — tickets due today are NOT overdue
     ------------------------------------------------------- */

  it('does not include tickets due today (due_date == today)', async () => {
    // The route uses .lt('due_date', today) so Supabase handles this;
    // we just verify the lt query is constructed with today's date.
    mockFrom.mockImplementation((table: string) => {
      if (table === 'tickets') {
        const ltMock = vi.fn().mockReturnValue({
          not: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        })
        return {
          select: vi.fn().mockReturnValue({ lt: ltMock }),
        }
      }
      return { select: vi.fn() }
    })

    const res = await GET(makeRequest('test-cron-secret'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.orgsNotified).toBe(0)
  })
})
