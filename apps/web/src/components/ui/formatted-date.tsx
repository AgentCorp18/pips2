'use client'

import { useMounted } from '@/hooks/use-mounted'

type FormattedDateProps = {
  /** ISO 8601 date string */
  date: string
  /** Intl.DateTimeFormat options (defaults to medium date + short time) */
  options?: Intl.DateTimeFormatOptions
  /** Optional locale (defaults to user locale) */
  locale?: string
  /** Fallback text shown during SSR / before hydration */
  fallback?: string
  /** Whether to show time alongside the date (default: true) */
  showTime?: boolean
}

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
}

const DATE_ONLY_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
}

/**
 * Parses a date string safely for display in local time.
 *
 * Postgres DATE columns return bare `YYYY-MM-DD` strings. The built-in
 * `new Date("2026-03-14")` treats those as UTC midnight, so users west
 * of UTC see the date shift back by one day. We detect that format and
 * rewrite it to `YYYY-MM-DDT00:00:00` (no timezone suffix) so the JS
 * engine parses it as local midnight instead.
 *
 * Full ISO-8601 timestamps (containing `T`) are left untouched — they
 * already carry an offset and should be interpreted as-is.
 */
const parseDateForDisplay = (date: string): Date => {
  // Match bare date strings: YYYY-MM-DD (10 chars, no T)
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(`${date}T00:00:00`)
  }
  return new Date(date)
}

/**
 * Client-only date formatter that avoids hydration mismatches
 * caused by timezone differences between server (UTC) and client (local).
 */
export const FormattedDate = ({
  date,
  options,
  locale,
  fallback = '\u00A0',
  showTime = true,
}: FormattedDateProps) => {
  const mounted = useMounted()

  if (!mounted) {
    return <span>{fallback}</span>
  }

  const resolvedOptions = options ?? (showTime ? DEFAULT_DATE_OPTIONS : DATE_ONLY_OPTIONS)

  return <>{parseDateForDisplay(date).toLocaleString(locale, resolvedOptions)}</>
}
