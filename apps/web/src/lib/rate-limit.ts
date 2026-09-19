/**
 * Rate limiter with Upstash Redis backend (production) and in-memory fallback (local dev).
 *
 * When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set, requests are tracked
 * in Redis using a sliding-window algorithm — persistent across serverless cold starts and
 * multiple instances.
 *
 * When those env vars are absent, the module falls back to an in-memory Map with the same
 * semantics. That is fine locally and close to useless on serverless, where each invocation
 * may get a fresh instance — an attacker spreading login attempts across instances is
 * effectively unthrottled.
 *
 * SECURITY: the fallback therefore does not apply in production. With no Upstash
 * configuration, checkRateLimit() denies instead of allowing, so the failure is visible
 * rather than silent. Setting ALLOW_IN_MEMORY_RATE_LIMIT=true restores the old behaviour
 * as a deliberate, logged opt-out.
 *
 * Setup (production):
 *   1. Create a Redis database at console.upstash.com
 *   2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to Vercel env vars
 *   3. Confirm both names are in the turbo.json env allowlist, or they never reach the app
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Which backend checkRateLimit() will use.
 * - 'upstash'      — Redis-backed, correct across instances
 * - 'memory'       — per-instance counter; development, or an explicit production opt-out
 * - 'unconfigured' — production with no Redis and no opt-out; the limiter denies
 */
export type RateLimitBackend = 'upstash' | 'memory' | 'unconfigured'

export const getRateLimitBackend = (): RateLimitBackend => {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return 'upstash'
  }
  if (process.env.NODE_ENV !== 'production') return 'memory'
  if (process.env.ALLOW_IN_MEMORY_RATE_LIMIT === 'true') return 'memory'
  return 'unconfigured'
}

/* ============================================================
   In-memory fallback (local dev / no env vars)
   ============================================================ */

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

const checkRateLimitInMemory = (key: string, limit: number, windowMs: number): RateLimitResult => {
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

/* ============================================================
   Upstash Redis backend
   ============================================================ */

/**
 * Converts milliseconds to a duration string accepted by @upstash/ratelimit.
 * Upstash supports: "1 ms", "1 s", "1 m", "1 h", "1 d"
 */
const msToUpstashWindow = (ms: number): `${number} ms` | `${number} s` | `${number} m` => {
  const seconds = ms / 1_000
  const minutes = seconds / 60
  if (Number.isInteger(minutes) && minutes >= 1) {
    return `${minutes} m`
  }
  if (Number.isInteger(seconds) && seconds >= 1) {
    return `${seconds} s`
  }
  return `${ms} ms`
}

const checkRateLimitUpstash = async (
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> => {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, msToUpstashWindow(windowMs)),
  })

  const { success, remaining, reset } = await ratelimit.limit(key)

  return {
    allowed: success,
    remaining,
    resetAt: reset,
  }
}

/* ============================================================
   Public API
   ============================================================ */

/**
 * Check rate limit for a given key (e.g. user ID or email).
 *
 * @param key - Unique identifier for the rate limit bucket
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Promise resolving to { allowed, remaining, resetAt }
 */
export const checkRateLimit = async (
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> => {
  const backend = getRateLimitBackend()

  if (backend === 'upstash') {
    return checkRateLimitUpstash(key, limit, windowMs)
  }

  if (backend === 'unconfigured') {
    console.error(
      '[SECURITY] Rate limiting is not configured (UPSTASH_REDIS_REST_URL / ' +
        'UPSTASH_REDIS_REST_TOKEN missing in production). Denying the request rather than ' +
        'silently degrading to a per-instance counter. Set ALLOW_IN_MEMORY_RATE_LIMIT=true ' +
        'to accept the weaker guarantee.',
    )
    return { allowed: false, remaining: 0, resetAt: Date.now() + windowMs }
  }

  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[SECURITY] Rate limiting is using the in-memory fallback in production ' +
        '(ALLOW_IN_MEMORY_RATE_LIMIT=true). Limits are per-instance and easily evaded.',
    )
  }

  return checkRateLimitInMemory(key, limit, windowMs)
}
