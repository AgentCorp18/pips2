import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkRateLimit } from '../rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('allows requests within the limit', () => {
    const result = checkRateLimit('user-1', 3, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('tracks remaining count correctly', () => {
    checkRateLimit('user-2', 3, 60_000)
    const result2 = checkRateLimit('user-2', 3, 60_000)
    expect(result2.remaining).toBe(1)

    const result3 = checkRateLimit('user-2', 3, 60_000)
    expect(result3.remaining).toBe(0)
  })

  it('rejects requests over the limit', () => {
    checkRateLimit('user-3', 2, 60_000)
    checkRateLimit('user-3', 2, 60_000)
    const result = checkRateLimit('user-3', 2, 60_000)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('resets after the window expires', () => {
    checkRateLimit('user-4', 1, 60_000)
    const blocked = checkRateLimit('user-4', 1, 60_000)
    expect(blocked.allowed).toBe(false)

    vi.advanceTimersByTime(61_000)

    const allowed = checkRateLimit('user-4', 1, 60_000)
    expect(allowed.allowed).toBe(true)
    expect(allowed.remaining).toBe(0)
  })

  it('isolates keys from each other', () => {
    checkRateLimit('user-5a', 1, 60_000)
    const blocked = checkRateLimit('user-5a', 1, 60_000)
    expect(blocked.allowed).toBe(false)

    const other = checkRateLimit('user-5b', 1, 60_000)
    expect(other.allowed).toBe(true)
  })

  it('returns resetAt timestamp', () => {
    const now = Date.now()
    const result = checkRateLimit('user-6', 5, 60_000)
    expect(result.resetAt).toBeGreaterThanOrEqual(now + 60_000)
  })
})
