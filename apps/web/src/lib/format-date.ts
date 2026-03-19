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

/**
 * Parses a date string safely, handling both date-only strings ("YYYY-MM-DD") and
 * full ISO timestamps ("YYYY-MM-DDTHH:mm:ssZ").
 *
 * For date-only strings, appends "T12:00:00" so the local date is preserved when
 * converting to a Date object (avoids off-by-one errors from UTC midnight rollback).
 * For ISO timestamps, parses directly.
 */
export const parseDateSafe = (dateStr: string): Date => {
  if (dateStr.includes('T')) {
    return new Date(dateStr)
  }
  return new Date(dateStr + 'T12:00:00')
}
