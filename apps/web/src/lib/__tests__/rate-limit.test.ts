import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/* ============================================================
   Upstash mock (must be declared before importing the module)
   ============================================================ */

const mockLimit = vi.fn()

// Redis must be a constructable class mock
vi.mock('@upstash/redis', () => {
  const RedisMock = vi.fn().mockImplementation(function () {
    return {}
  })
  return { Redis: RedisMock }
})

// Ratelimit must be constructable and expose a static slidingWindow method
vi.mock('@upstash/ratelimit', () => {
  const RatelimitMock = Object.assign(
    vi.fn().mockImplementation(function () {
      return { limit: mockLimit }
    }),
    {
      slidingWindow: vi.fn().mockReturnValue({ type: 'slidingWindow' }),
    },
  )
  return { Ratelimit: RatelimitMock }
})

/* ============================================================
   Import after mocks
   ============================================================ */

import { checkRateLimit } from '../rate-limit'

/* ============================================================
   In-memory fallback (no env vars set)
   ============================================================ */

describe('checkRateLimit — in-memory fallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Ensure Upstash env vars are absent
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('allows requests within the limit', async () => {
    const result = await checkRateLimit('mem-user-1', 3, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('tracks remaining count correctly', async () => {
    await checkRateLimit('mem-user-2', 3, 60_000)
    const result2 = await checkRateLimit('mem-user-2', 3, 60_000)
    expect(result2.remaining).toBe(1)

    const result3 = await checkRateLimit('mem-user-2', 3, 60_000)
    expect(result3.remaining).toBe(0)
  })

  it('rejects requests over the limit', async () => {
    await checkRateLimit('mem-user-3', 2, 60_000)
    await checkRateLimit('mem-user-3', 2, 60_000)
    const result = await checkRateLimit('mem-user-3', 2, 60_000)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('resets after the window expires', async () => {
    await checkRateLimit('mem-user-4', 1, 60_000)
    const blocked = await checkRateLimit('mem-user-4', 1, 60_000)
    expect(blocked.allowed).toBe(false)

    vi.advanceTimersByTime(61_000)

    const allowed = await checkRateLimit('mem-user-4', 1, 60_000)
    expect(allowed.allowed).toBe(true)
    expect(allowed.remaining).toBe(0)
  })

  it('isolates keys from each other', async () => {
    await checkRateLimit('mem-user-5a', 1, 60_000)
    const blocked = await checkRateLimit('mem-user-5a', 1, 60_000)
    expect(blocked.allowed).toBe(false)

    const other = await checkRateLimit('mem-user-5b', 1, 60_000)
    expect(other.allowed).toBe(true)
  })

  it('returns resetAt timestamp', async () => {
    const now = Date.now()
    const result = await checkRateLimit('mem-user-6', 5, 60_000)
    expect(result.resetAt).toBeGreaterThanOrEqual(now + 60_000)
  })

  it('does not call Upstash when env vars are absent', async () => {
    await checkRateLimit('mem-user-7', 5, 60_000)
    expect(mockLimit).not.toHaveBeenCalled()
  })
})

/* ============================================================
   Upstash Redis mode (env vars set)
   ============================================================ */

describe('checkRateLimit — Upstash Redis mode', () => {
  const resetTimestamp = Date.now() + 60_000

  beforeEach(() => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test-token')
    mockLimit.mockResolvedValue({ success: true, remaining: 9, reset: resetTimestamp })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('delegates to Upstash when env vars are set', async () => {
    const result = await checkRateLimit('upstash-user-1', 10, 60_000)
    expect(mockLimit).toHaveBeenCalledWith('upstash-user-1')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9)
    expect(result.resetAt).toBe(resetTimestamp)
  })

  it('returns allowed=false when Upstash reports rate limit exceeded', async () => {
    mockLimit.mockResolvedValueOnce({ success: false, remaining: 0, reset: resetTimestamp })
    const result = await checkRateLimit('upstash-user-2', 10, 60_000)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('passes the correct key to Upstash limit()', async () => {
    await checkRateLimit('ai-assist:user-abc', 10, 60_000)
    expect(mockLimit).toHaveBeenCalledWith('ai-assist:user-abc')
  })
})
