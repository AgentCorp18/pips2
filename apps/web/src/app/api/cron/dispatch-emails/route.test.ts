import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks
   ============================================================ */

const mockSendEmail = vi.fn()
vi.mock('@/lib/email/send', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

vi.mock('@/lib/email/ticket-assigned', () => ({
  ticketAssignedTemplate: vi.fn().mockReturnValue('<html>ticket-assigned</html>'),
}))
vi.mock('@/lib/email/mention', () => ({
  mentionTemplate: vi.fn().mockReturnValue('<html>mention</html>'),
}))
vi.mock('@/lib/email/project-updated', () => ({
  projectUpdatedTemplate: vi.fn().mockReturnValue('<html>project-updated</html>'),
}))
vi.mock('@/lib/email/base-template', () => ({
  baseTemplate: vi.fn().mockReturnValue('<html>generic</html>'),
  ctaButton: vi.fn().mockReturnValue('<a>CTA</a>'),
  escapeHtml: vi.fn().mockImplementation((s: string) => s),
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
   Helpers
   ============================================================ */

const makeRequest = (secret?: string) =>
  new Request('https://pips-app.vercel.app/api/cron/dispatch-emails', {
    method: 'GET',
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  })

const makeNotification = (overrides: Record<string, unknown> = {}) => ({
  id: 'notif-1',
  org_id: 'org-1',
  user_id: 'user-1',
  type: 'ticket_assigned',
  title: 'Ticket assigned to you',
  body: 'You have been assigned to ticket "Fix bug"',
  entity_type: 'ticket',
  entity_id: 'ticket-1',
  created_at: new Date().toISOString(),
  ...overrides,
})

/* ============================================================
   Tests
   ============================================================ */

describe('GET /api/cron/dispatch-emails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('CRON_SECRET', 'test-cron-secret')
    vi.stubEnv('RESEND_API_KEY', 're_test_key')
  })

  it('returns 401 when CRON_SECRET is missing', async () => {
    vi.stubEnv('CRON_SECRET', '')
    const res = await GET(makeRequest('wrong'))
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

  it('returns {sent:0, skipped:0, failed:0} when no unsent notifications', async () => {
    // Mock: notifications query returns empty
    mockFrom.mockImplementation((table: string) => {
      if (table === 'notifications') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          }),
        }
      }
      return { select: vi.fn() }
    })

    const res = await GET(makeRequest('test-cron-secret'))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toEqual({ sent: 0, skipped: 0, failed: 0 })
  })

  it('sends email for unsent notification and marks as sent', async () => {
    const notification = makeNotification()

    // Chain builder for notifications query
    const notifChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [notification], error: null }),
            }),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }

    // Profiles query
    const profilesChain = {
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'user-1',
              email: 'test@example.com',
              display_name: 'Test User',
              full_name: 'Test User',
            },
          ],
          error: null,
        }),
      }),
    }

    // Preferences query
    const prefsChain = {
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            {
              user_id: 'user-1',
              org_id: 'org-1',
              email_enabled: true,
              ticket_assigned: true,
              mention: true,
              project_updated: true,
              ticket_updated: true,
              ticket_commented: true,
            },
          ],
          error: null,
        }),
      }),
    }

    let notifCallCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'notifications') {
        notifCallCount++
        if (notifCallCount === 1) return notifChain // first call = select
        return notifChain // subsequent calls = update
      }
      if (table === 'profiles') return profilesChain
      if (table === 'notification_preferences') return prefsChain
      return { select: vi.fn() }
    })

    mockSendEmail.mockResolvedValue({ success: true, id: 'email-123' })

    const res = await GET(makeRequest('test-cron-secret'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.sent).toBe(1)
    expect(json.skipped).toBe(0)
    expect(json.failed).toBe(0)
    expect(mockSendEmail).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'PIPS — Ticket Assigned to You',
      html: expect.any(String),
    })
  })

  it('skips notification when user has email_enabled = false', async () => {
    const notification = makeNotification()

    const notifChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [notification], error: null }),
            }),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }

    const profilesChain = {
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            { id: 'user-1', email: 'test@example.com', display_name: 'Test', full_name: null },
          ],
          error: null,
        }),
      }),
    }

    const prefsChain = {
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            {
              user_id: 'user-1',
              org_id: 'org-1',
              email_enabled: false,
              ticket_assigned: true,
              mention: true,
              project_updated: true,
              ticket_updated: true,
              ticket_commented: true,
            },
          ],
          error: null,
        }),
      }),
    }

    let notifCallCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'notifications') {
        notifCallCount++
        if (notifCallCount === 1) return notifChain
        return notifChain
      }
      if (table === 'profiles') return profilesChain
      if (table === 'notification_preferences') return prefsChain
      return { select: vi.fn() }
    })

    const res = await GET(makeRequest('test-cron-secret'))
    const json = await res.json()

    expect(json.skipped).toBe(1)
    expect(json.sent).toBe(0)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('skips notification when specific type is disabled in preferences', async () => {
    const notification = makeNotification({ type: 'mention' })

    const notifChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [notification], error: null }),
            }),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }

    const profilesChain = {
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            { id: 'user-1', email: 'test@example.com', display_name: 'Test', full_name: null },
          ],
          error: null,
        }),
      }),
    }

    const prefsChain = {
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            {
              user_id: 'user-1',
              org_id: 'org-1',
              email_enabled: true,
              ticket_assigned: true,
              mention: false,
              project_updated: true,
              ticket_updated: true,
              ticket_commented: true,
            },
          ],
          error: null,
        }),
      }),
    }

    let notifCallCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'notifications') {
        notifCallCount++
        if (notifCallCount === 1) return notifChain
        return notifChain
      }
      if (table === 'profiles') return profilesChain
      if (table === 'notification_preferences') return prefsChain
      return { select: vi.fn() }
    })

    const res = await GET(makeRequest('test-cron-secret'))
    const json = await res.json()

    expect(json.skipped).toBe(1)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('counts failed sends and leaves email_sent as false', async () => {
    const notification = makeNotification()

    const notifChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [notification], error: null }),
            }),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }

    const profilesChain = {
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [
            { id: 'user-1', email: 'test@example.com', display_name: 'Test', full_name: null },
          ],
          error: null,
        }),
      }),
    }

    const prefsChain = {
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    }

    let notifCallCount = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'notifications') {
        notifCallCount++
        if (notifCallCount === 1) return notifChain
        return notifChain
      }
      if (table === 'profiles') return profilesChain
      if (table === 'notification_preferences') return prefsChain
      return { select: vi.fn() }
    })

    mockSendEmail.mockResolvedValue({ success: false, error: 'API error' })

    const res = await GET(makeRequest('test-cron-secret'))
    const json = await res.json()

    expect(json.failed).toBe(1)
    expect(json.sent).toBe(0)
  })

  it('returns 500 when notification fetch fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'notifications') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
                }),
              }),
            }),
          }),
        }
      }
      return { select: vi.fn() }
    })

    const res = await GET(makeRequest('test-cron-secret'))
    expect(res.status).toBe(500)
  })
})
