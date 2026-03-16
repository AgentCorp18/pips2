'use client'

import { useCallback, useState } from 'react'

/**
 * Manages column visibility state with localStorage persistence.
 *
 * @param tableId — unique key per table (e.g. "tickets", "projects")
 * @param allColumns — ordered list of column IDs that exist
 * @param defaultVisible — which columns are visible out-of-the-box
 */
export const useColumnVisibility = (
  tableId: string,
  allColumns: string[],
  defaultVisible: string[],
) => {
  const storageKey = `pips-columns-${tableId}`

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window === 'undefined') return defaultVisible
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as string[]
        // Filter to only columns that still exist (schema may have changed)
        const valid = parsed.filter((c) => allColumns.includes(c))
        return valid.length > 0 ? valid : defaultVisible
      }
    } catch {
      // Ignore parse errors
    }
    return defaultVisible
  })

  const toggleColumn = useCallback(
    (columnId: string) => {
      setVisibleColumns((prev) => {
        const next = prev.includes(columnId)
          ? prev.filter((c) => c !== columnId)
          : [...prev, columnId]
        // Don't allow hiding all columns
        if (next.length === 0) return prev
        try {
          localStorage.setItem(storageKey, JSON.stringify(next))
        } catch {
          // Ignore storage errors
        }
        return next
      })
    },
    [storageKey],
  )

  const resetToDefaults = useCallback(() => {
    setVisibleColumns(defaultVisible)
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // Ignore
    }
  }, [defaultVisible, storageKey])

  const isVisible = useCallback(
    (columnId: string) => visibleColumns.includes(columnId),
    [visibleColumns],
  )

  return { visibleColumns, toggleColumn, resetToDefaults, isVisible }
}
