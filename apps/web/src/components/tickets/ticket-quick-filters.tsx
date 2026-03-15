'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { User, AlertTriangle, Clock, UserPlus, CircleUser } from 'lucide-react'

/* ============================================================
   Types
   ============================================================ */

export type QuickFilterKey =
  | 'my_open'
  | 'overdue'
  | 'created_by_me'
  | 'unassigned'
  | 'high_priority'

type QuickFilterDef = {
  key: QuickFilterKey
  label: string
  icon: React.ReactNode
}

type TicketQuickFiltersProps = {
  basePath?: string
}

/* ============================================================
   Filter Definitions
   ============================================================ */

const QUICK_FILTERS: QuickFilterDef[] = [
  { key: 'my_open', label: 'My Open', icon: <User size={14} /> },
  { key: 'overdue', label: 'Overdue', icon: <Clock size={14} /> },
  { key: 'created_by_me', label: 'Created by Me', icon: <CircleUser size={14} /> },
  { key: 'unassigned', label: 'Unassigned', icon: <UserPlus size={14} /> },
  { key: 'high_priority', label: 'High Priority', icon: <AlertTriangle size={14} /> },
]

/* ============================================================
   Helpers
   ============================================================ */

export const getActiveQuickFilters = (searchParams: URLSearchParams): QuickFilterKey[] => {
  const raw = searchParams.getAll('quick')
  return raw.filter((v): v is QuickFilterKey =>
    ['my_open', 'overdue', 'created_by_me', 'unassigned', 'high_priority'].includes(v),
  )
}

/* ============================================================
   Component
   ============================================================ */

export const TicketQuickFilters = ({ basePath = '/tickets' }: TicketQuickFiltersProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeFilters = getActiveQuickFilters(searchParams)

  const toggleFilter = (key: QuickFilterKey) => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.getAll('quick')

    // Remove all quick params, then re-add toggled set
    params.delete('quick')
    if (current.includes(key)) {
      current.filter((k) => k !== key).forEach((k) => params.append('quick', k))
    } else {
      ;[...current, key].forEach((k) => params.append('quick', k))
    }

    // Reset to page 1 when filters change
    params.delete('page')

    router.replace(`${basePath}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium mr-1" style={{ color: 'var(--color-text-secondary)' }}>
        Quick filters:
      </span>
      {QUICK_FILTERS.map((filter) => {
        const isActive = activeFilters.includes(filter.key)
        return (
          <Button
            key={filter.key}
            variant={isActive ? 'default' : 'outline'}
            size="xs"
            onClick={() => toggleFilter(filter.key)}
            className="gap-1.5"
          >
            {filter.icon}
            {filter.label}
          </Button>
        )
      })}
    </div>
  )
}
