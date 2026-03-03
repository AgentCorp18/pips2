import { NextResponse } from 'next/server'

/* ============================================================
   GET /api/health/ping
   Lightweight endpoint for load balancer health checks.
   Returns 200 with a minimal JSON payload.
   Does NOT require authentication.
   ============================================================ */

export const GET = () => {
  return NextResponse.json({ status: 'ok' })
}
