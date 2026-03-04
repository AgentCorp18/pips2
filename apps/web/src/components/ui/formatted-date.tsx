'use client'

import { useMounted } from '@/hooks/use-mounted'

type FormattedDateProps = {
  /** ISO 8601 date string */
  date: string
  /** Intl.DateTimeFormat options (defaults to short date) */
  options?: Intl.DateTimeFormatOptions
  /** Optional locale (defaults to user locale) */
  locale?: string
  /** Fallback text shown during SSR / before hydration */
  fallback?: string
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
}: FormattedDateProps) => {
  const mounted = useMounted()

  if (!mounted) {
    return <span>{fallback}</span>
  }

  return <>{new Date(date).toLocaleDateString(locale, options)}</>
}
