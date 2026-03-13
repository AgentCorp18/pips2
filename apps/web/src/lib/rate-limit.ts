// WARNING: This in-memory rate limiter is ineffective in serverless/multi-instance
// deployments (e.g., Vercel). Each cold start creates a fresh Map, resetting counters.
//
// TODO: Replace with Upstash Redis once credentials are provisioned.
//
// Migration plan:
//   1. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to Vercel env vars
//   2. Install @upstash/ratelimit and @upstash/redis packages
//   3. The checkRateLimit function below will automatically switch to Upstash
//      when UPSTASH_REDIS_REST_URL is detected at runtime
//
// Example Upstash implementation (uncomment when credentials are ready):
//
//   import { Ratelimit } from '@upstash/ratelimit'
//   import { Redis } from '@upstash/redis'
//
//   const redis = new Redis({
//     url: process.env.UPSTASH_REDIS_REST_URL!,
//     token: process.env.UPSTASH_REDIS_REST_TOKEN!,
//   })
//
//   const ratelimit = new Ratelimit({
//     redis,
//     limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
//   })

/**
 * Simple in-memory rate limiter for API routes.
 * Resets on deploy/restart — sufficient for beta.
 *
 * When UPSTASH_REDIS_REST_URL is set, this function will log a warning
 * reminding the operator to complete the Upstash migration.
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
  // Warn operators that Upstash credentials are present but migration is incomplete
  if (process.env.UPSTASH_REDIS_REST_URL) {
    console.warn(
      '[rate-limit] UPSTASH_REDIS_REST_URL is set but Upstash integration is not yet active. ' +
        'Complete the TODO migration in apps/web/src/lib/rate-limit.ts to enable persistent rate limiting.',
    )
  }

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
