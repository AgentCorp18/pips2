import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getWorkloadData } from './actions'
import { TeamWorkload } from '@/components/tickets/team-workload'

export const metadata: Metadata = {
  title: 'Team Workload',
  description: 'View ticket distribution across team members',
}

type WorkloadPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const WorkloadPage = async ({ searchParams }: WorkloadPageProps) => {
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
    project_id?: string
    include_done?: boolean
  } = {}

  if (typeof params.project_id === 'string') filters.project_id = params.project_id
  if (params.include_done === 'true') filters.include_done = true

  // Get ticket prefix
  const { data: orgSettings } = await supabase
    .from('org_settings')
    .select('ticket_prefix')
    .eq('org_id', currentOrg.orgId)
    .single()

  const prefix = orgSettings?.ticket_prefix ?? 'TKT'

  const { members, unassignedCount } = await getWorkloadData(currentOrg.orgId, filters)

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
            data-testid="workload-page-heading"
          >
            Team Workload
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
            data-testid="workload-page-description"
          >
            Ticket distribution and capacity across team members
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
            <Link href="/tickets/timeline">Timeline</Link>
          </Button>
          <Button asChild className="gap-2" data-testid="workload-new-ticket-button">
            <Link href="/tickets/new">
              <Plus size={16} />
              New Ticket
            </Link>
          </Button>
        </div>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-6 rounded-full" />

      {/* Workload */}
      <TeamWorkload members={members} unassignedCount={unassignedCount} prefix={prefix} />
    </div>
  )
}

export default WorkloadPage
