'use client'

import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type SortDirection = 'asc' | 'desc' | null

export type SortableHeaderProps = {
  label: string
  sortKey: string
  currentSort: string | null
  currentDirection: SortDirection
  onSort: (key: string) => void
  className?: string
}

export const SortableHeader = ({
  label,
  sortKey,
  currentSort,
  currentDirection,
  onSort,
  className,
}: SortableHeaderProps) => {
  const isActive = currentSort === sortKey
  const direction = isActive ? currentDirection : null

  const Icon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ArrowUpDown

  return (
    <TableHead
      className={cn('cursor-pointer select-none', className)}
      onClick={() => onSort(sortKey)}
      aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
    >
      <span className="inline-flex items-center gap-1 hover:opacity-70 transition-opacity">
        {label}
        <Icon
          size={14}
          className={cn('shrink-0 transition-opacity', isActive ? 'opacity-100' : 'opacity-40')}
        />
      </span>
    </TableHead>
  )
}

/**
 * Generic hook-like helper to compute next sort state.
 * cycle: null → asc → desc → null
 */
export const nextSortState = (
  currentKey: string | null,
  currentDirection: SortDirection,
  clickedKey: string,
): { sortKey: string | null; direction: SortDirection } => {
  if (currentKey !== clickedKey) {
    // New column — always start ascending
    return { sortKey: clickedKey, direction: 'asc' }
  }
  if (currentDirection === 'asc') {
    return { sortKey: clickedKey, direction: 'desc' }
  }
  // desc → clear
  return { sortKey: null, direction: null }
}

/**
 * Sort an array of objects by a key.
 * Handles strings (case-insensitive), numbers, and ISO date strings.
 */
export const sortRows = <T extends Record<string, unknown>>(
  rows: T[],
  sortKey: string | null,
  direction: SortDirection,
): T[] => {
  if (!sortKey || !direction) return rows

  return [...rows].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]

    // Nulls always go last
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    let comparison = 0

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal
    } else if (typeof aVal === 'string' && typeof bVal === 'string') {
      // Detect ISO date strings (e.g. "2024-03-01T00:00:00Z")
      const dateA = Date.parse(aVal)
      const dateB = Date.parse(bVal)
      if (!isNaN(dateA) && !isNaN(dateB)) {
        comparison = dateA - dateB
      } else {
        comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase())
      }
    }

    return direction === 'asc' ? comparison : -comparison
  })
}
