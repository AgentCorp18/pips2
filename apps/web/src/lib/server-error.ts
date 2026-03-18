/**
 * Centralized server error logging utility.
 *
 * Provides structured error logging for server actions with consistent
 * format and future Sentry integration point.
 */

type ServerErrorContext = {
  action: string
  detail?: string
}

/**
 * Log a server-side error with structured context.
 * Returns the error message for inclusion in action results.
 */
export const captureServerError = (error: unknown, context: ServerErrorContext): string => {
  const message = error instanceof Error ? error.message : String(error)

  console.error(`[${context.action}]`, message, context.detail ? `| ${context.detail}` : '')

  // Future: Sentry.captureException(error, { tags: { action: context.action } })

  return message
}
