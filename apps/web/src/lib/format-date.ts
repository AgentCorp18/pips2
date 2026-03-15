/**
 * Server-safe date formatting utilities.
 * Use these in Server Components where <FormattedDate> (client-only) cannot be used.
 * Note: These run on the server in UTC — suitable for display when timezone precision
 * is not critical (e.g., "Mar 14, 2026, 3:45 PM" will reflect UTC, not user local time).
 */

const DEFAULT_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
}

const DATE_ONLY_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
}

/**
 * Formats a date string as "Mar 14, 2026, 3:45 PM" (medium date + short time).
 * Runs on the server in UTC — for timezone-accurate display, use <FormattedDate> client component instead.
 */
export const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString(undefined, DEFAULT_OPTIONS)
}

/**
 * Formats a date string as "Mar 14, 2026" (medium date only).
 * Runs on the server in UTC — for timezone-accurate display, use <FormattedDate> client component instead.
 */
export const formatDateOnly = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString(undefined, DATE_ONLY_OPTIONS)
}
