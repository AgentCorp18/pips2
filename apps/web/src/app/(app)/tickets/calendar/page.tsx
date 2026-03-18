import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getTicketsForCalendar } from './actions'
import { TicketCalendar } from '@/components/tickets/ticket-calendar'

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'View tickets on a monthly calendar by due date',
}

type CalendarPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const CalendarPage = async ({ searchParams }: CalendarPageProps) => {
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

  // Parse year/month from search params, default to current
  const now = new Date()
  const year = typeof params.year === 'string' ? parseInt(params.year, 10) : now.getFullYear()
  const month = typeof params.month === 'string' ? parseInt(params.month, 10) : now.getMonth() + 1

  // Validate year/month
  const safeYear = year >= 2020 && year <= 2100 ? year : now.getFullYear()
  const safeMonth = month >= 1 && month <= 12 ? month : now.getMonth() + 1

  // Parse optional filters
  const filters: {
    assignee_id?: string
    project_id?: string
    priority?: string[]
  } = {}

  if (typeof params.assignee_id === 'string') filters.assignee_id = params.assignee_id
  if (typeof params.project_id === 'string') filters.project_id = params.project_id
  if (params.priority) {
    filters.priority = Array.isArray(params.priority) ? params.priority : [params.priority]
  }

  // Get ticket prefix
  const { data: orgSettings } = await supabase
    .from('org_settings')
    .select('ticket_prefix')
    .eq('org_id', currentOrg.orgId)
    .single()

  const prefix = orgSettings?.ticket_prefix ?? 'TKT'

  const tickets = await getTicketsForCalendar(currentOrg.orgId, safeYear, safeMonth, filters)

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
            data-testid="calendar-page-heading"
          >
            Calendar
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
            data-testid="calendar-page-description"
          >
            Tickets displayed by their due date
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/tickets">List View</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/tickets/board">Board View</Link>
          </Button>
          <Button asChild className="gap-2" data-testid="calendar-new-ticket-button">
            <Link href="/tickets/new">
              <Plus size={16} />
              New Ticket
            </Link>
          </Button>
        </div>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-6 rounded-full" />

      {/* Calendar */}
      <TicketCalendar tickets={tickets} year={safeYear} month={safeMonth} prefix={prefix} />
    </div>
  )
}

export default CalendarPage
