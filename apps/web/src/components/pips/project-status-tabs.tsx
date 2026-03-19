'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

type StatusTab = {
  label: string
  value: string
  count: number
}

type ProjectStatusTabsProps = {
  counts: {
    active: number
    completed: number
    archived: number
    all: number
  }
  currentStatus: string
}

export const ProjectStatusTabs = ({ counts, currentStatus }: ProjectStatusTabsProps) => {
  const searchParams = useSearchParams()

  const buildHref = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'active') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    // Preserve search query if present
    const qs = params.toString()
    return `/projects${qs ? `?${qs}` : ''}`
  }

  const tabs: StatusTab[] = [
    { label: 'Active', value: 'active', count: counts.active },
    { label: 'Completed', value: 'completed', count: counts.completed },
    { label: 'Archived', value: 'archived', count: counts.archived },
    { label: 'All', value: 'all', count: counts.all },
  ]

  return (
    <div
      className="flex gap-1 rounded-lg border border-[var(--color-border)] p-0.5"
      role="tablist"
      aria-label="Project status filter"
    >
      {tabs.map((tab) => {
        const isActive = currentStatus === tab.value
        return (
          <Link
            key={tab.value}
            href={buildHref(tab.value)}
            role="tab"
            aria-selected={isActive}
            data-testid={`status-tab-${tab.value}`}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab.label}
            <Badge
              variant={isActive ? 'secondary' : 'outline'}
              className={`h-4 min-w-4 px-1 text-xs ${
                isActive
                  ? 'border-white/30 bg-white/20 text-white'
                  : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'
              }`}
            >
              {tab.count}
            </Badge>
          </Link>
        )
      })}
    </div>
  )
}
