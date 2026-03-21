import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks
   ============================================================ */

const mockSelect = vi.fn()
const mockLimit = vi.fn()
const mockGetSession = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: () => ({
      select: (...args: unknown[]) => {
        mockSelect(...args)
        return {
          limit: (...limitArgs: unknown[]) => {
            mockLimit(...limitArgs)
            return Promise.resolve({ data: [{ id: '1' }], error: null })
          },
        }
      },
    }),
    auth: {
      getSession: mockGetSession,
    },
  })),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { GET } from './route'

/* ============================================================
   Tests
   ============================================================ */

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
  })

  it('returns a well-shaped health response with status ok', async () => {
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe('ok')
    expect(body.timestamp).toBeDefined()
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
    // version and uptime intentionally removed to avoid information disclosure
    expect(body.version).toBeUndefined()
    expect(body.uptime).toBeUndefined()
    expect(body.checks.database.status).toBe('ok')
    expect(typeof body.checks.database.latency_ms).toBe('number')
    expect(body.checks.auth.status).toBe('ok')
    expect(typeof body.checks.auth.latency_ms).toBe('number')
  })

  it('returns degraded (503) when database fails but auth succeeds', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValueOnce({
      from: () => ({
        select: () => ({
          limit: () => Promise.resolve({ data: null, error: { message: 'connection refused' } }),
        }),
      }),
      auth: { getSession: mockGetSession },
    } as never)
    // Second call for auth check uses default mock
    vi.mocked(createClient).mockResolvedValueOnce({
      from: () => ({
        select: () => ({
          limit: () => Promise.resolve({ data: [{ id: '1' }], error: null }),
        }),
      }),
      auth: { getSession: mockGetSession },
    } as never)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.status).toBe('degraded')
    expect(body.checks.database.status).toBe('error')
    expect(body.checks.database.error).toBe('Service unavailable')
    expect(body.checks.auth.status).toBe('ok')
  })

  it('returns degraded (503) when auth fails but database succeeds', async () => {
    const failingGetSession = vi.fn().mockResolvedValue({
      data: { session: null },
      error: { message: 'auth service unavailable' },
    })

    const { createClient } = await import('@/lib/supabase/server')
    // Database check client — succeeds
    vi.mocked(createClient).mockResolvedValueOnce({
      from: () => ({
        select: () => ({
          limit: () => Promise.resolve({ data: [{ id: '1' }], error: null }),
        }),
      }),
      auth: { getSession: mockGetSession },
    } as never)
    // Auth check client — fails
    vi.mocked(createClient).mockResolvedValueOnce({
      from: () => ({
        select: () => ({
          limit: () => Promise.resolve({ data: [{ id: '1' }], error: null }),
        }),
      }),
      auth: { getSession: failingGetSession },
    } as never)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.status).toBe('degraded')
    expect(body.checks.database.status).toBe('ok')
    expect(body.checks.auth.status).toBe('error')
    expect(body.checks.auth.error).toBe('Service unavailable')
  })

  it('returns error (503) when both checks fail', async () => {
    const failingGetSession = vi.fn().mockResolvedValue({
      data: { session: null },
      error: { message: 'auth down' },
    })

    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValueOnce({
      from: () => ({
        select: () => ({
          limit: () => Promise.resolve({ data: null, error: { message: 'db down' } }),
        }),
      }),
      auth: { getSession: failingGetSession },
    } as never)
    vi.mocked(createClient).mockResolvedValueOnce({
      from: () => ({
        select: () => ({
          limit: () => Promise.resolve({ data: null, error: { message: 'db down' } }),
        }),
      }),
      auth: { getSession: failingGetSession },
    } as never)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.status).toBe('error')
    expect(body.checks.database.status).toBe('error')
    expect(body.checks.auth.status).toBe('error')
  })

  it('handles thrown exceptions gracefully', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockRejectedValue(new Error('network timeout'))

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.checks.database.status).toBe('error')
    expect(body.checks.database.error).toBe('Service unavailable')
  })

  it('does not expose version or uptime (information disclosure prevention)', async () => {
    process.env.APP_VERSION = '2.5.0'

    const response = await GET()
    const body = await response.json()

    // Security: version and uptime should not be exposed
    expect(body.version).toBeUndefined()
    expect(body.uptime).toBeUndefined()

    delete process.env.APP_VERSION
  })
})
