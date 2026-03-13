'use client'

import { useState, useMemo } from 'react'
import { nextSortState, sortRows, type SortDirection } from '@/components/ui/sortable-header'

export type UseSortableOptions<T> = {
  key: keyof T & string
  direction: 'asc' | 'desc'
}

export type UseSortableReturn<T> = {
  sortedData: T[]
  sortKey: string | null
  sortDirection: SortDirection
  handleSort: (key: string) => void
}

export const useSortable = <T extends Record<string, unknown>>(
  data: T[],
  defaultSort?: UseSortableOptions<T>,
): UseSortableReturn<T> => {
  const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction ?? null)

  const handleSort = (key: string) => {
    const next = nextSortState(sortKey, sortDirection, key)
    setSortKey(next.sortKey)
    setSortDirection(next.direction)
  }

  const sortedData = useMemo(
    () => sortRows(data, sortKey, sortDirection) as T[],
    [data, sortKey, sortDirection],
  )

  return { sortedData, sortKey, sortDirection, handleSort }
}
