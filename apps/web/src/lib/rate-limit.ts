// WARNING: This in-memory rate limiter is ineffective in serverless/multi-instance
// deployments (e.g., Vercel). Each cold start creates a fresh Map, resetting counters.
// TODO: Replace with a persistent store (Upstash Redis, Vercel KV, or Supabase)
// before enabling paid AI features or exposing to high traffic.

/**
 * Simple in-memory rate limiter for API routes.
 * Resets on deploy/restart — sufficient for beta.
 */

type RateLimitEntry = {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = Date.now()

const cleanup = () => {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check rate limit for a given key (e.g. user ID).
 * @param key - Unique identifier for the rate limit bucket
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export const checkRateLimit = (key: string, limit: number, windowMs: number): RateLimitResult => {
  cleanup()

  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  entry.count += 1

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}
