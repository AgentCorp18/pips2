'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Ticket, FolderKanban, ChevronDown, ChevronUp } from 'lucide-react'

export const TicketEmptyState = () => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16">
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--color-primary-subtle)' }}
      >
        <Ticket size={36} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        No tickets yet
      </h3>
      <p
        className="mb-1 max-w-md text-center text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Tickets help you track tasks, bugs, and action items as you work through your PIPS projects.
      </p>

      {/* Progressive disclosure */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mb-5 flex items-center gap-1 text-xs font-medium"
        style={{ color: 'var(--color-primary)' }}
        aria-expanded={expanded}
      >
        {expanded ? (
          <>
            Show less <ChevronUp size={13} />
          </>
        ) : (
          <>
            Learn how tickets work <ChevronDown size={13} />
          </>
        )}
      </button>

      {expanded && (
        <div
          className="mb-6 max-w-sm rounded-[var(--radius-md)] p-4 text-left text-xs"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <p className="mb-2 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Two ways to create tickets
          </p>
          <ul className="space-y-1.5 list-disc pl-4">
            <li>
              <strong>From a PIPS step</strong> — as you fill out forms in Step 2 (Analyze) or Step
              5 (Implement), action items become tickets automatically
            </li>
            <li>
              <strong>Manually</strong> — create a ticket any time to track a task, bug, or
              improvement idea and link it to a project later
            </li>
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="gap-2" data-testid="empty-create-ticket-button">
          <Link href="/tickets/new">
            <Plus size={16} />
            Create Ticket
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2" data-testid="empty-start-project-link">
          <Link href="/projects/new">
            <FolderKanban size={16} />
            Start a Project
          </Link>
        </Button>
      </div>
    </div>
  )
}
