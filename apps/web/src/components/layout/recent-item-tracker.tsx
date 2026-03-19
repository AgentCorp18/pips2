'use client'

import { useEffect } from 'react'
import { addRecentItem, type RecentItemType } from '@/lib/recent-items'

type RecentItemTrackerProps = {
  id: string
  title: string
  type: RecentItemType
  path: string
}

/**
 * Invisible client component dropped into Server Component pages.
 * Records the current page as a recent item in localStorage on mount.
 */
export const RecentItemTracker = ({ id, title, type, path }: RecentItemTrackerProps) => {
  useEffect(() => {
    addRecentItem({ id, title, type, path })
  }, [id, title, type, path])

  return null
}
