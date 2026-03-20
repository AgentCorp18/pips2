'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertTriangle, ArrowDownUp } from 'lucide-react'

type ProjectsFilterBarProps = {
  currentSort: string
  currentFilter: string
  atRiskCount: number
}

/**
 * Sort and filter controls for the projects list (cards view).
 * Uses URL search params so the state is shareable and server-rendered.
 */
export const ProjectsFilterBar = ({
  currentSort,
  currentFilter,
  atRiskCount,
}: ProjectsFilterBarProps) => {
  const searchParams = useSearchParams()

  const buildUrl = (updates: Record<string, string | null>): string => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    return `/projects?${params.toString()}`
  }

  const isHealthSort = currentSort === 'health'
  const isAtRiskFilter = currentFilter === 'at-risk'

  return (
    <div
      className="mb-4 flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="Project sort and filter controls"
    >
      {/* Sort by health */}
      <Link
        href={buildUrl({ sort: isHealthSort ? null : 'health' })}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          isHealthSort
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
            : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary-light)] hover:text-[var(--color-primary)]'
        }`}
        aria-pressed={isHealthSort}
        data-testid="sort-health-button"
      >
        <ArrowDownUp size={12} aria-hidden="true" />
        Sort by Health
      </Link>

      {/* At Risk filter */}
      <Link
        href={buildUrl({ filter: isAtRiskFilter ? null : 'at-risk' })}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          isAtRiskFilter
            ? 'border-[#EF4444] bg-[#FEF2F2] text-[#EF4444]'
            : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[#FCA5A5] hover:text-[#EF4444]'
        }`}
        aria-pressed={isAtRiskFilter}
        data-testid="filter-at-risk-button"
      >
        <AlertTriangle size={12} aria-hidden="true" />
        At Risk
        {atRiskCount > 0 && (
          <span
            className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none ${
              isAtRiskFilter ? 'bg-[#EF4444] text-white' : 'bg-[#FEF2F2] text-[#EF4444]'
            }`}
          >
            {atRiskCount}
          </span>
        )}
      </Link>
    </div>
  )
}
