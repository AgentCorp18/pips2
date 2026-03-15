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

  return <>{new Date(date).toLocaleString(locale, resolvedOptions)}</>
}
