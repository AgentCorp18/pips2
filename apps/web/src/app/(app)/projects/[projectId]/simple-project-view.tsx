'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Ticket, CheckCircle2, Clock, ArrowUpRight, Layers } from 'lucide-react'
import { convertToPips } from '../actions'

/* ============================================================
   Types
   ============================================================ */

type SimpleTicket = {
  id: string
  sequenceId: string
  title: string
  status: string
  priority: string
}

type SimpleProjectViewProps = {
  projectId: string
  tickets: SimpleTicket[]
  totalTickets: number
  completedTickets: number
}

/* ============================================================
   Status badge config
   ============================================================ */

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  to_do: { label: 'To Do', variant: 'outline' },
  in_progress: { label: 'In Progress', variant: 'default' },
  in_review: { label: 'In Review', variant: 'secondary' },
  done: { label: 'Done', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

const PRIORITY_COLOR: Record<string, string> = {
  critical: 'text-[var(--color-error)]',
  high: 'text-[var(--color-warning)]',
  medium: 'text-[var(--color-text-secondary)]',
  low: 'text-[var(--color-text-tertiary)]',
}

/* ============================================================
   Convert to PIPS button — client action
   ============================================================ */

const ConvertToPipsButton = ({ projectId }: { projectId: string }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleConvert = () => {
    startTransition(async () => {
      const result = await convertToPips(projectId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Project converted to PIPS — step 1 is ready')
      router.push(`/projects/${projectId}/steps/1`)
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleConvert}
      disabled={isPending}
      className="gap-2"
      data-testid="convert-to-pips-button"
    >
      <Layers size={14} />
      {isPending ? 'Converting...' : 'Convert to PIPS'}
    </Button>
  )
}

/* ============================================================
   Main component
   ============================================================ */

export const SimpleProjectView = ({
  projectId,
  tickets,
  totalTickets,
  completedTickets,
}: SimpleProjectViewProps) => {
  const [showAll, setShowAll] = useState(false)

  const completionPct = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0

  const visibleTickets = showAll ? tickets : tickets.slice(0, 10)

  return (
    <div className="mx-auto max-w-[var(--content-max-width)] space-y-6">
      {/* Action bar */}
      <div className="flex items-center justify-end gap-2">
        <ConvertToPipsButton projectId={projectId} />
        <Button size="sm" className="gap-2" asChild data-testid="create-ticket-button">
          <Link href={`/tickets/new?project_id=${projectId}`}>
            <Plus size={14} />
            Create Ticket
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3" data-testid="simple-project-stats">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Ticket size={20} className="text-[var(--color-text-tertiary)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalTickets}</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Total tickets</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle2 size={20} className="text-[var(--color-success)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {completedTickets}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Clock size={20} className="text-[var(--color-primary)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {completionPct}%
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Completion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ticket size={16} className="text-[var(--color-text-tertiary)]" />
            Tickets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {tickets.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 py-12 text-center"
              data-testid="simple-project-empty"
            >
              <Ticket size={32} className="text-[var(--color-text-tertiary)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">No tickets yet</p>
              <Button size="sm" asChild>
                <Link href={`/tickets/new?project_id=${projectId}`}>
                  <Plus size={14} className="mr-1.5" />
                  Create first ticket
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <ul data-testid="simple-project-ticket-list">
                {visibleTickets.map((ticket, idx) => {
                  const statusCfg = STATUS_CONFIG[ticket.status] ?? {
                    label: ticket.status,
                    variant: 'outline' as const,
                  }
                  const priorityColor = PRIORITY_COLOR[ticket.priority] ?? ''
                  return (
                    <li
                      key={ticket.id}
                      className={`flex items-center gap-3 px-6 py-3 hover:bg-[var(--color-surface-secondary)] transition-colors ${
                        idx < visibleTickets.length - 1
                          ? 'border-b border-[var(--color-border)]'
                          : ''
                      }`}
                    >
                      <span className={`shrink-0 text-xs font-mono font-medium ${priorityColor}`}>
                        {ticket.sequenceId}
                      </span>
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="flex-1 truncate text-sm text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors"
                        data-testid={`ticket-row-${ticket.id}`}
                      >
                        {ticket.title}
                      </Link>
                      <Badge variant={statusCfg.variant} className="shrink-0 text-xs">
                        {statusCfg.label}
                      </Badge>
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="shrink-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors"
                        aria-label={`Open ${ticket.sequenceId}`}
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {tickets.length > 10 && (
                <div className="border-t border-[var(--color-border)] px-6 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAll((prev) => !prev)}
                    data-testid="show-all-tickets-button"
                  >
                    {showAll ? 'Show less' : `Show all ${tickets.length} tickets`}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Board link */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/projects/${projectId}/board`} className="gap-2">
            View as Board
          </Link>
        </Button>
      </div>
    </div>
  )
}
