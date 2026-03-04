'use client'

import { formatDistanceToNow } from 'date-fns'
import { useMounted } from '@/hooks/use-mounted'

type RelativeTimeProps = {
  /** ISO 8601 date string */
  date: string
  /** Fallback text shown during SSR / before hydration */
  fallback?: string
}

const safeFormatDistance = (date: string): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return 'just now'
  }
}

/**
 * Renders a human-readable relative time string (e.g. "3 minutes ago").
 * Defers rendering until client mount to avoid hydration mismatches
 * caused by time differences between server render and client hydration.
 */
export const RelativeTime = ({ date, fallback = '\u00A0' }: RelativeTimeProps) => {
  const mounted = useMounted()

  if (!mounted) {
    return <span>{fallback}</span>
  }

  return <>{safeFormatDistance(date)}</>
}
