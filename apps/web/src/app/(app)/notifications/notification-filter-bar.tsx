'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { NotificationType } from '@/types/notifications'

/* ============================================================
   Filter definitions
   ============================================================ */

export type NotificationFilterKey = 'all' | 'assigned' | 'mentions' | 'updates'

type FilterDef = {
  key: NotificationFilterKey
  label: string
  types: NotificationType[]
}

export const NOTIFICATION_FILTERS: FilterDef[] = [
  { key: 'all', label: 'All', types: [] },
  { key: 'assigned', label: 'Assigned', types: ['ticket_assigned'] },
  { key: 'mentions', label: 'Mentions', types: ['mention'] },
  {
    key: 'updates',
    label: 'Updates',
    types: ['ticket_updated', 'ticket_commented', 'project_updated', 'invitation', 'system'],
  },
]

/* ============================================================
   NotificationFilterBar
   ============================================================ */

type NotificationFilterBarProps = {
  activeFilter: NotificationFilterKey
}

export const NotificationFilterBar = ({ activeFilter }: NotificationFilterBarProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = useCallback(
    (filterKey: NotificationFilterKey) => {
      const params = new URLSearchParams(searchParams.toString())
      if (filterKey === 'all') {
        params.delete('filter')
      } else {
        params.set('filter', filterKey)
      }
      // Reset pagination when changing filters
      params.delete('offset')
      router.push(`/notifications?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div data-testid="notification-filter-bar" className="mb-4 flex flex-wrap gap-2">
      {NOTIFICATION_FILTERS.map((filter) => (
        <Button
          key={filter.key}
          data-testid={`notification-filter-${filter.key}`}
          variant={activeFilter === filter.key ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange(filter.key)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}
