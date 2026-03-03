import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Ticket } from 'lucide-react'

export const TicketEmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16">
    <div
      className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
      style={{ backgroundColor: 'var(--color-primary-subtle)' }}
    >
      <Ticket size={24} style={{ color: 'var(--color-primary)' }} />
    </div>
    <h3 className="mb-1 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
      No tickets yet
    </h3>
    <p
      className="mb-6 max-w-sm text-center text-sm"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      Create your first ticket to start tracking work.
    </p>
    <Button asChild className="gap-2">
      <Link href="/tickets/new">
        <Plus size={16} />
        Create your first ticket
      </Link>
    </Button>
  </div>
)
