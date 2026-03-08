import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { KpiCard } from '@/components/reports/kpi-card'
import { TeamContributionsChart } from '@/components/reports/team-contributions-chart'
import { ActivityTimelineChart } from '@/components/reports/activity-timeline-chart'
import { Users, UserCheck, TicketCheck, Clock, ArrowLeft } from 'lucide-react'
import {
  getTeamActivityKpis,
  getTeamContributions,
  getActivityTimeline,
  getTeamMembersTable,
} from '../actions'

export const metadata: Metadata = {
  title: 'Team Activity Report',
  description: 'Monitor team engagement, individual contributions, and activity trends.',
}

const TeamActivityPage = async () => {
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
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership) {
    redirect('/onboarding')
  }

  const orgId = membership.org_id

  const [kpis, contributions, timeline, memberRows] = await Promise.all([
    getTeamActivityKpis(orgId),
    getTeamContributions(orgId),
    getActivityTimeline(orgId),
    getTeamMembersTable(orgId),
  ])

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/reports"
          className="mb-3 inline-flex items-center gap-1 text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back to Reports
        </Link>
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
          data-testid="team-activity-heading"
        >
          Team Activity
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Monitor team engagement, individual contributions, and activity trends.
        </p>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Members" value={kpis.totalMembers} icon={Users} color="#6366F1" />
        <KpiCard
          title="Active This Week"
          value={kpis.activeThisWeek}
          icon={UserCheck}
          color="#3B82F6"
        />
        <KpiCard
          title="Tickets Completed (Week)"
          value={kpis.ticketsCompletedThisWeek}
          icon={TicketCheck}
          color="#10B981"
        />
        <KpiCard
          title="Avg Response Time"
          value={kpis.avgResponseTimeDays > 0 ? `${kpis.avgResponseTimeDays}d` : '--'}
          icon={Clock}
          color="#F59E0B"
          subtitle={kpis.avgResponseTimeDays > 0 ? 'days to resolve' : 'No completed tickets'}
        />
      </div>

      {/* Charts row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <TeamContributionsChart data={contributions} />
        <ActivityTimelineChart data={timeline} />
      </div>

      {/* Team members table */}
      <Card>
        <CardHeader>
          <CardTitle
            className="text-lg font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {memberRows.length === 0 ? (
            <div
              className="flex h-32 items-center justify-center text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              No team members yet. Invite members to see activity data.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.role}</Badge>
                    </TableCell>
                    <TableCell>{row.ticketsAssigned}</TableCell>
                    <TableCell>{row.ticketsCompleted}</TableCell>
                    <TableCell>
                      {row.lastActive ? (
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {new Date(row.lastActive).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-tertiary)' }}>--</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TeamActivityPage
