'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { LayoutGrid, TableProperties } from 'lucide-react'

/* ============================================================
   Types
   ============================================================ */

export type ViewMode = 'table' | 'cards'

type ViewToggleProps = {
  current: ViewMode
}

/* ============================================================
   Component
   ============================================================ */

export const ViewToggle = ({ current }: ViewToggleProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setView = useCallback(
    (view: ViewMode) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('view', view)
      router.push(`/tickets?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="flex items-center rounded-lg border border-[var(--color-border)] p-0.5">
      <Button
        variant={current === 'table' ? 'secondary' : 'ghost'}
        size="xs"
        onClick={() => setView('table')}
        className="gap-1"
        aria-label="Table view"
      >
        <TableProperties size={14} />
        Table
      </Button>
      <Button
        variant={current === 'cards' ? 'secondary' : 'ghost'}
        size="xs"
        onClick={() => setView('cards')}
        className="gap-1"
        aria-label="Card view"
      >
        <LayoutGrid size={14} />
        Cards
      </Button>
    </div>
  )
}
