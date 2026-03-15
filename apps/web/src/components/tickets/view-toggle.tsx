'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Columns3, LayoutGrid, TableProperties } from 'lucide-react'

/* ============================================================
   Types
   ============================================================ */

export type ViewMode = 'table' | 'cards' | 'board'

type ViewToggleProps = {
  current: ViewMode
  basePath?: string
}

/* ============================================================
   Component
   ============================================================ */

export const ViewToggle = ({ current, basePath = '/tickets' }: ViewToggleProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setView = useCallback(
    (view: ViewMode) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('view', view)
      router.replace(`${basePath}?${params.toString()}`)
    },
    [router, searchParams, basePath],
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
      <Button
        variant={current === 'board' ? 'secondary' : 'ghost'}
        size="xs"
        onClick={() => setView('board')}
        className="gap-1"
        aria-label="Board view"
        data-testid="view-toggle-board"
      >
        <Columns3 size={14} />
        Board
      </Button>
    </div>
  )
}
