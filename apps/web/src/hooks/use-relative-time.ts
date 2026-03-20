'use client'

import { useEffect, useState } from 'react'

/**
 * Returns a human-readable relative time string for a given date.
 * Updates every 30 seconds so the label stays fresh.
 *
 * Examples: "just now", "1 min ago", "5 min ago", "1 hour ago"
 */
export const useRelativeTime = (date: Date | null): string => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!date) return
    const id = setInterval(() => {
      setNow(Date.now())
    }, 30_000)
    return () => clearInterval(id)
  }, [date])

  if (!date) return ''

  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)

  if (diffSec < 10) return 'just now'
  if (diffSec < 60) return `${diffSec} sec ago`
  if (diffMin === 1) return '1 min ago'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHour === 1) return '1 hour ago'
  return `${diffHour} hours ago`
}
