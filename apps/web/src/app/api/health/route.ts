import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/* ============================================================
   Types
   ============================================================ */

type HealthStatus = 'ok' | 'degraded' | 'error'

type CheckResult = {
  status: 'ok' | 'error'
  latency_ms: number
  error?: string
}

type HealthResponse = {
  status: HealthStatus
  timestamp: string
  checks: {
    database: CheckResult
    auth: CheckResult
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

const deriveStatus = (checks: HealthResponse['checks']): HealthStatus => {
  const results = Object.values(checks)
  const allOk = results.every((c) => c.status === 'ok')
  const allError = results.every((c) => c.status === 'error')

  if (allOk) return 'ok'
  if (allError) return 'error'
  return 'degraded'
}

/* ============================================================
   GET /api/health
   Returns system health with database and auth checks.
   Does NOT require authentication.
   ============================================================ */

export const dynamic = 'force-dynamic'

export const GET = async () => {
  const [database, auth] = await Promise.all([checkDatabase(), checkAuth()])

  const checks = { database, auth }
  const status = deriveStatus(checks)

  const body: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    checks,
  }

  const httpStatus = status === 'ok' ? 200 : 503

  return NextResponse.json(body, { status: httpStatus })
}
