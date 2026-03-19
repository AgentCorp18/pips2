import Link from 'next/link'
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type LinkedTicket = {
  id: string
  title: string
  status: string
  priority: string
  assignee: { display_name: string } | null
}

type LinkedTicketsProps = {
  projectId: string
  tickets: LinkedTicket[]
}

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  blocked: 'Blocked',
  done: 'Done',
  cancelled: 'Cancelled',
}

const STATUS_COLORS: Record<string, string> = {
  done: 'text-[var(--color-success)]',
  cancelled: 'text-muted-foreground',
  blocked: 'text-destructive',
  in_progress: 'text-[var(--color-primary)]',
  in_review: 'text-[var(--color-primary)]',
}

export const LinkedTickets = ({ projectId, tickets }: LinkedTicketsProps) => {
  const doneCount = tickets.filter((t) => t.status === 'done').length
  const totalCount = tickets.length
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Linked Tickets</CardTitle>
          <div className="flex items-center gap-3">
            {totalCount > 0 && (
              <span className="text-sm text-muted-foreground">
                {doneCount}/{totalCount} done
              </span>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/tickets?project_id=${projectId}`}>
                <ExternalLink className="size-3.5" />
                View Board
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                backgroundColor: 'var(--color-step-5)',
              }}
            />
          </div>
        )}

        {/* Ticket list */}
        {totalCount === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No tickets linked to this project yet. Create tickets from the Implementation Checklist
            or add them manually from the ticket board.
          </p>
        ) : (
          <ul className="space-y-2">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  href={`/tickets/${ticket.id}`}
                  className={cn(
                    'flex items-center justify-between rounded-[var(--radius-md)] border px-3 py-2 transition-colors hover:bg-[var(--color-surface-secondary)]',
                    ticket.status === 'done'
                      ? 'border-[var(--color-success)] bg-[var(--color-success-subtle)]'
                      : 'border-[var(--color-border)]',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {ticket.status === 'done' ? (
                      <CheckCircle2 className="size-4 shrink-0 text-[var(--color-success)]" />
                    ) : (
                      <Circle
                        className={cn(
                          'size-4 shrink-0',
                          STATUS_COLORS[ticket.status] ?? 'text-muted-foreground',
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'text-sm',
                        ticket.status === 'done' && 'line-through text-muted-foreground',
                      )}
                    >
                      {ticket.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {ticket.assignee && (
                      <span className="text-xs text-muted-foreground">
                        {ticket.assignee.display_name}
                      </span>
                    )}
                    <Badge variant="secondary" className="text-[10px]">
                      {STATUS_LABELS[ticket.status] ?? ticket.status}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
