import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

const mockExchangeCodeForSession = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  })),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { GET } from './route'

/* ============================================================
   Helpers
   ============================================================ */

const makeRequest = (params: Record<string, string>) => {
  const url = new URL('http://localhost/auth/callback')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return new Request(url.toString())
}

/* ============================================================
   Tests
   ============================================================ */

describe('GET /auth/callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExchangeCodeForSession.mockResolvedValue({ error: null })
  })

  /* ---------- Open redirect protection ---------- */

  it('redirects to /dashboard when no next param is provided', async () => {
    const request = makeRequest({ code: 'valid-code' })
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/dashboard')
  })

  it('redirects to next param when it is a valid internal path', async () => {
    const request = makeRequest({ code: 'valid-code', next: '/projects' })
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/projects')
  })

  it('redirects to /dashboard when next starts with //', async () => {
    // Protocol-relative URLs like //evil.com can be used as open redirects
    const request = makeRequest({ code: 'valid-code', next: '//evil.com' })
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/dashboard')
  })

  it('redirects to /dashboard when next is an absolute URL to another host', async () => {
    const request = makeRequest({ code: 'valid-code', next: 'https://evil.com/steal' })
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/dashboard')
  })

  it('redirects to /dashboard when next is a relative path without leading slash', async () => {
    const request = makeRequest({ code: 'valid-code', next: 'evil.com/path' })
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/dashboard')
  })

  it('allows deep internal paths as next param', async () => {
    const request = makeRequest({ code: 'valid-code', next: '/org/123/projects/456' })
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/org/123/projects/456')
  })

  it('allows paths with query strings as next param', async () => {
    const request = makeRequest({ code: 'valid-code', next: '/dashboard?tab=overview' })
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/dashboard?tab=overview')
  })

  /* ---------- Code exchange ---------- */

  it('redirects to login error page when no code is provided', async () => {
    const request = makeRequest({ next: '/dashboard' })
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'http://localhost/login?error=auth_callback_failed',
    )
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled()
  })

  it('redirects to login error page when code exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: { message: 'Invalid code' } })

    const request = makeRequest({ code: 'bad-code' })
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'http://localhost/login?error=auth_callback_failed',
    )
  })

  it('calls exchangeCodeForSession with the provided code', async () => {
    const request = makeRequest({ code: 'my-auth-code' })
    await GET(request)

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('my-auth-code')
  })
})
