/**
 * Canonical base URL helper.
 *
 * Single source of truth for the application's base URL.
 * All code that needs the base URL should import `getBaseUrl` from here
 * instead of reading `process.env.NEXT_PUBLIC_APP_URL` directly.
 *
 * Priority order:
 *   1. NEXT_PUBLIC_APP_URL  — set explicitly in Vercel / local .env
 *   2. http://localhost:3000 — safe fallback for local development
 *
 * The value never has a trailing slash.
 */
export const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return url.replace(/\/$/, '')
}
