import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Ticket, FolderKanban, Lightbulb } from 'lucide-react'

export const TicketEmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16">
    <div
      className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
      style={{ backgroundColor: 'var(--color-primary-subtle)' }}
    >
      <Ticket size={36} style={{ color: 'var(--color-primary)' }} />
    </div>
    <h3 className="mb-2 text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
      No tickets yet
    </h3>
    <p
      className="mb-2 max-w-md text-center text-sm"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      Tickets help you track tasks, bugs, and action items across your projects.
    </p>
    <div
      className="mb-8 flex items-start gap-2 rounded-[var(--radius-md)] px-4 py-3"
      style={{ backgroundColor: 'var(--color-surface)' }}
      data-testid="ticket-empty-tip"
    >
      <Lightbulb size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        Tickets are created as you work through PIPS steps, or you can create them manually to track
        any work.
      </p>
    </div>
    <div className="flex items-center gap-3">
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
