/**
 * Analytics helper — thin wrapper around Vercel Analytics track().
 *
 * Server actions use `@vercel/analytics/server` (async, needs headers).
 * Client components use `@vercel/analytics` (sync, browser-only).
 *
 * All tracking is fire-and-forget — analytics must never block user actions.
 */

import { track as serverTrack } from '@vercel/analytics/server'
import { headers } from 'next/headers'

type AllowedValue = string | number | boolean | null | undefined

/**
 * Track a custom event from a server action or server component.
 * Reads request headers automatically for Vercel Analytics attribution.
 * Silently catches errors — analytics should never break user flows.
 */
export const trackServerEvent = async (
  name: string,
  properties?: Record<string, AllowedValue>,
): Promise<void> => {
  try {
    const reqHeaders = await headers()
    await serverTrack(name, properties ?? {}, { headers: reqHeaders })
  } catch {
    // Silently ignore — analytics must never block user actions
  }
}
