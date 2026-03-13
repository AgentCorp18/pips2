'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, X, Ticket, FolderKanban } from 'lucide-react'

export const QuickCreateFab = () => {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      data-testid="quick-create-fab"
    >
      {open && (
        <div
          className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-lg"
          data-testid="fab-menu"
        >
          <Link
            href="/tickets/new"
            data-testid="fab-new-ticket"
            className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface)]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Ticket size={16} style={{ color: 'var(--color-primary)' }} />
            New Ticket
          </Link>
          <Link
            href="/projects/new"
            data-testid="fab-new-project"
            className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface)]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <FolderKanban size={16} style={{ color: 'var(--color-primary)' }} />
            New Project
          </Link>
        </div>
      )}

      <button
        type="button"
        data-testid="fab-trigger"
        aria-label={open ? 'Close quick create menu' : 'Open quick create menu'}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {open ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  )
}
