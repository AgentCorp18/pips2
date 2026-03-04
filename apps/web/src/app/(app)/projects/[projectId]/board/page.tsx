import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getTicketsForBoard } from '@/app/(app)/tickets/actions'
import { KanbanBoard } from '@/components/tickets/kanban-board'
import type { BoardTicket } from '@/components/tickets/kanban-board'

const ProjectBoardPage = async ({ params }: { params: Promise<{ projectId: string }> }) => {
  const { projectId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!membership) {
    redirect('/onboarding')
  }

  const { data: orgSettings } = await supabase
    .from('org_settings')
    .select('ticket_prefix')
    .eq('org_id', membership.org_id)
    .single()

  const prefix = orgSettings?.ticket_prefix ?? 'TKT'

  const tickets = await getTicketsForBoard(membership.org_id, {
    project_id: projectId,
  })

  const boardTickets: BoardTicket[] = tickets.map((ticket) => {
    const assignee = ticket.assignee as unknown as {
      id: string
      full_name: string
      display_name: string | null
      avatar_url: string | null
    } | null

    return {
      id: ticket.id,
      sequenceId: `${prefix}-${ticket.sequence_number}`,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      type: ticket.type,
      assigneeName: assignee ? assignee.display_name || assignee.full_name || null : null,
      assigneeAvatar: assignee?.avatar_url ?? null,
      dueDate: ticket.due_date,
    }
  })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {boardTickets.length} {boardTickets.length === 1 ? 'ticket' : 'tickets'} in this project
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href={`/tickets/new?project_id=${projectId}`}>
            <Plus size={16} />
            Create Ticket
          </Link>
        </Button>
      </div>

      <KanbanBoard initialTickets={boardTickets} />
    </div>
  )
}

export default ProjectBoardPage
