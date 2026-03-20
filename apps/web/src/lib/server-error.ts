/**
 * Centralized server error logging utility.
 *
 * Provides structured error logging for server actions with consistent
 * format and Sentry integration.
 */

import * as Sentry from '@sentry/nextjs'

type ServerErrorContext = {
  action: string
  detail?: string
}

/**
 * Log a server-side error with structured context.
 * Captures to Sentry and logs to console.
 * Returns the error message for inclusion in action results.
 */
export const captureServerError = (error: unknown, context: ServerErrorContext): string => {
  const message = error instanceof Error ? error.message : String(error)

  console.error(`[${context.action}]`, message, context.detail ? `| ${context.detail}` : '')

  Sentry.captureException(error, { extra: context })

  return message
}
