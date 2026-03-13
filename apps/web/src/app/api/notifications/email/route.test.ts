import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks
   ============================================================ */

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

const mockSendEmail = vi.fn()

vi.mock('@/lib/email/send', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

vi.mock('@/lib/email/ticket-assigned', () => ({
  ticketAssignedTemplate: vi.fn(() => '<html>ticket assigned</html>'),
}))

vi.mock('@/lib/email/mention', () => ({
  mentionTemplate: vi.fn(() => '<html>mention</html>'),
}))

vi.mock('@/lib/email/project-updated', () => ({
  projectUpdatedTemplate: vi.fn(() => '<html>project updated</html>'),
}))

vi.mock('@/lib/email/invitation', () => ({
  invitationTemplate: vi.fn(() => '<html>invitation</html>'),
}))

vi.mock('@/lib/email/welcome', () => ({
  welcomeTemplate: vi.fn(() => '<html>welcome</html>'),
}))

vi.mock('@/lib/email/base-template', () => ({
  baseTemplate: vi.fn(() => '<html>generic</html>'),
  ctaButton: vi.fn(() => '<a>CTA</a>'),
  escapeHtml: vi.fn((s: string) => s),
}))

vi.mock('@/lib/base-url', () => ({
  getBaseUrl: vi.fn(() => 'https://pips-app.vercel.app'),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { POST } from './route'

/* ============================================================
   Helpers
   ============================================================ */

const validPayload = {
  user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  type: 'ticket_assigned',
  title: 'New ticket assigned',
  body: 'You have been assigned ticket #42',
  entity_type: 'ticket',
  entity_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  metadata: {
    ticket_title: 'Fix login bug',
    ticket_id: 'TICK-42',
    project_name: 'Project Alpha',
    priority: 'high',
  },
}

const makeRequest = (body: unknown, secret?: string) =>
  new Request('http://localhost/api/notifications/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(secret ? { 'x-notification-secret': secret } : {}),
    },
    body: JSON.stringify(body),
  })

const notificationsChain = {
  update: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          is: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    }),
  }),
}

const mockProfileQuery = (profile: Record<string, unknown> | null) => {
  const profileChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: profile }),
  }
  mockFrom.mockImplementation((table: string) => {
    if (table === 'notifications') return notificationsChain
    return profileChain
  })
  return profileChain
}

/* ============================================================
   Tests
   ============================================================ */

describe('POST /api/notifications/email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NOTIFICATION_EMAIL_SECRET = 'test-secret-123'
    mockSendEmail.mockResolvedValue({ success: true, id: 'email-1' })
  })

  // --- Auth ---

  it('returns 401 when no secret header is provided', async () => {
    const response = await POST(makeRequest(validPayload))
    const body = await response.json()
    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when secret header is wrong', async () => {
    const response = await POST(makeRequest(validPayload, 'wrong-secret'))
    const body = await response.json()
    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when NOTIFICATION_EMAIL_SECRET env var is not set', async () => {
    delete process.env.NOTIFICATION_EMAIL_SECRET
    const response = await POST(makeRequest(validPayload, 'any-secret'))
    const body = await response.json()
    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  // --- Validation ---

  it('returns 400 for invalid JSON body', async () => {
    const request = new Request('http://localhost/api/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-notification-secret': 'test-secret-123',
      },
      body: 'not json',
    })
    const response = await POST(request)
    const body = await response.json()
    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid request body')
  })

  it('returns 400 when user_id is not a UUID', async () => {
    mockProfileQuery(null)
    const response = await POST(
      makeRequest({ ...validPayload, user_id: 'not-a-uuid' }, 'test-secret-123'),
    )
    const body = await response.json()
    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid payload')
  })

  it('returns 400 when required fields are missing', async () => {
    const response = await POST(makeRequest({ user_id: validPayload.user_id }, 'test-secret-123'))
    const body = await response.json()
    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid payload')
  })

  // --- User lookup ---

  it('returns 404 when user profile is not found', async () => {
    mockProfileQuery(null)
    const response = await POST(makeRequest(validPayload, 'test-secret-123'))
    const body = await response.json()
    expect(response.status).toBe(404)
    expect(body.error).toBe('User not found')
  })

  // --- Happy path ---

  it('sends email and returns success for valid request', async () => {
    mockProfileQuery({
      email: 'user@example.com',
      full_name: 'Test User',
      display_name: 'TestU',
    })

    const response = await POST(makeRequest(validPayload, 'test-secret-123'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.id).toBe('email-1')
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'PIPS — Ticket Assigned to You',
      }),
    )
  })

  it('uses display_name when available, falls back to full_name', async () => {
    mockProfileQuery({
      email: 'user@example.com',
      full_name: 'Full Name',
      display_name: null,
    })

    await POST(makeRequest({ ...validPayload, type: 'welcome' }, 'test-secret-123'))

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'PIPS — Welcome to PIPS',
      }),
    )
  })

  it('uses generic subject for unknown notification type', async () => {
    mockProfileQuery({
      email: 'user@example.com',
      full_name: 'User',
      display_name: 'U',
    })

    await POST(makeRequest({ ...validPayload, type: 'unknown_type' }, 'test-secret-123'))

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'PIPS — Notification',
      }),
    )
  })

  // --- Email send failure ---

  it('returns 500 when sendEmail fails', async () => {
    mockProfileQuery({
      email: 'user@example.com',
      full_name: 'User',
      display_name: 'U',
    })
    mockSendEmail.mockResolvedValue({ success: false, error: 'SMTP error' })

    const response = await POST(makeRequest(validPayload, 'test-secret-123'))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('SMTP error')
  })

  // --- Notification marking ---

  it('marks notification as emailed when entity_id is provided', async () => {
    mockProfileQuery({
      email: 'u@test.com',
      full_name: 'U',
      display_name: 'U',
    })

    await POST(makeRequest(validPayload, 'test-secret-123'))

    expect(mockFrom).toHaveBeenCalledWith('notifications')
    expect(notificationsChain.update).toHaveBeenCalledWith({ email_sent: true })
  })
})
