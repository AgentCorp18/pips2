'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { LayoutGrid, TableProperties, FlaskConical } from 'lucide-react'

export type FormsViewMode = 'table' | 'cards' | 'sandbox'

type FormsViewToggleProps = {
  current: FormsViewMode
}

export const FormsViewToggle = ({ current }: FormsViewToggleProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setView = useCallback(
    (view: FormsViewMode) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('view', view)
      // Reset page when switching views
      params.delete('page')
      router.replace(`/forms?${params.toString()}`)
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
      <Button
        variant={current === 'sandbox' ? 'secondary' : 'ghost'}
        size="xs"
        onClick={() => setView('sandbox')}
        className="gap-1"
        aria-label="Sandbox view"
      >
        <FlaskConical size={14} />
        Sandbox
      </Button>
    </div>
  )
}
