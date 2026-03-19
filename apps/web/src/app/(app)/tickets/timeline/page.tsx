import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getTicketsForTimeline } from './actions'
import { TicketTimeline } from '@/components/tickets/ticket-timeline'

export const metadata: Metadata = {
  title: 'Timeline',
  description: 'Gantt-style timeline view for tickets',
}

type TimelinePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const TimelinePage = async ({ searchParams }: TimelinePageProps) => {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentOrg = await getCurrentOrg(supabase, user.id)

  if (!currentOrg) {
    redirect('/onboarding')
  }

  // Parse optional filters
  const filters: {
    assignee_id?: string
    project_id?: string
    priority?: string[]
    status?: string[]
  } = {}

  if (typeof params.assignee_id === 'string') filters.assignee_id = params.assignee_id
  if (typeof params.project_id === 'string') filters.project_id = params.project_id
  if (params.priority) {
    filters.priority = Array.isArray(params.priority) ? params.priority : [params.priority]
  }
  if (params.status) {
    filters.status = Array.isArray(params.status) ? params.status : [params.status]
  }

  // Get ticket prefix
  const { data: orgSettings } = await supabase
    .from('org_settings')
    .select('ticket_prefix')
    .eq('org_id', currentOrg.orgId)
    .single()

  const prefix = orgSettings?.ticket_prefix ?? 'TKT'

  const tickets = await getTicketsForTimeline(currentOrg.orgId, filters)

  return (
    <div className="mx-auto max-w-full px-4">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
            data-testid="timeline-page-heading"
          >
            Timeline
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
            data-testid="timeline-page-description"
          >
            Gantt-style view of ticket schedules and progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/tickets">List View</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/tickets/board">Board</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/tickets/calendar">Calendar</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/tickets/workload">Workload</Link>
          </Button>
          <Button asChild className="gap-2" data-testid="timeline-new-ticket-button">
            <Link href="/tickets/new">
              <Plus size={16} />
              New Ticket
            </Link>
          </Button>
        </div>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-6 rounded-full" />

      {/* Timeline */}
      <TicketTimeline tickets={tickets} prefix={prefix} />
    </div>
  )
}

export default TimelinePage
