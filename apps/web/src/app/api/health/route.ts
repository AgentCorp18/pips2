import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRateLimitBackend } from '@/lib/rate-limit'

/* ============================================================
   Types
   ============================================================ */

type HealthStatus = 'ok' | 'degraded' | 'error'

type CheckResult = {
  status: 'ok' | 'error'
  latency_ms: number
  error?: string
}

type RateLimitCheck = CheckResult & { backend: ReturnType<typeof getRateLimitBackend> }

type HealthResponse = {
  status: HealthStatus
  timestamp: string
  checks: {
    database: CheckResult
    auth: CheckResult
    rate_limit: RateLimitCheck
  }
}

/* ============================================================
   Helpers
   ============================================================ */

const checkDatabase = async (): Promise<CheckResult> => {
  const start = performance.now()
  try {
    const supabase = await createClient()
    // Use a lightweight query to verify database connectivity.
    // .from() with .select() and .limit(1) is the most reliable
    // approach across Supabase configurations.
    const { error } = await supabase.from('profiles').select('id').limit(1)
    const latency = Math.round(performance.now() - start)

    if (error) {
      console.error('[health] database check failed:', error.message)
      return { status: 'error', latency_ms: latency, error: 'Service unavailable' }
    }

    return { status: 'ok', latency_ms: latency }
  } catch (err) {
    const latency = Math.round(performance.now() - start)
    console.error('[health] database check threw:', err instanceof Error ? err.message : err)
    return { status: 'error', latency_ms: latency, error: 'Service unavailable' }
  }
}

const checkAuth = async (): Promise<CheckResult> => {
  const start = performance.now()
  try {
    const supabase = await createClient()
    // getSession() returns null for unauthenticated requests,
    // but the call itself verifies the auth service is reachable.
    const { error } = await supabase.auth.getSession()
    const latency = Math.round(performance.now() - start)

    if (error) {
      console.error('[health] auth check failed:', error.message)
      return { status: 'error', latency_ms: latency, error: 'Service unavailable' }
    }

    return { status: 'ok', latency_ms: latency }
  } catch (err) {
    const latency = Math.round(performance.now() - start)
    console.error('[health] auth check threw:', err instanceof Error ? err.message : err)
    return { status: 'error', latency_ms: latency, error: 'Service unavailable' }
  }
}

/**
 * Surface the limiter backend so a silent degradation is visible in monitoring
 * instead of only in logs. 'unconfigured' means brute-force protection is not
 * actually running.
 */
const checkRateLimiter = (): RateLimitCheck => {
  const backend = getRateLimitBackend()
  return {
    backend,
    status: backend === 'unconfigured' ? 'error' : 'ok',
    latency_ms: 0,
    ...(backend === 'unconfigured' ? { error: 'Rate limiting is not configured' } : {}),
  }
}

const deriveStatus = (checks: HealthResponse['checks']): HealthStatus => {
  // Connectivity to the backing services decides ok/degraded/error.
  const dependencies = [checks.database, checks.auth]
  const allOk = dependencies.every((c) => c.status === 'ok')
  const allError = dependencies.every((c) => c.status === 'error')

  if (allError) return 'error'
  if (!allOk) return 'degraded'

  // Everything reachable, but a misconfigured limiter is not a healthy service.
  return checks.rate_limit.status === 'ok' ? 'ok' : 'degraded'
}

/* ============================================================
   GET /api/health
   Returns system health with database and auth checks.
   Does NOT require authentication.
   ============================================================ */

export const dynamic = 'force-dynamic'

export const GET = async () => {
  const [database, auth] = await Promise.all([checkDatabase(), checkAuth()])

  const checks = { database, auth, rate_limit: checkRateLimiter() }
  const status = deriveStatus(checks)

  const body: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    checks,
  }

  const httpStatus = status === 'ok' ? 200 : 503

  return NextResponse.json(body, { status: httpStatus })
}
