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
import { StepProgressChart } from '@/components/reports/step-progress-chart'
import { TicketVelocityChart } from '@/components/reports/ticket-velocity-chart'
import { StepFunnelChart } from '@/components/reports/step-funnel-chart'
import { FolderKanban, TrendingUp, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react'
import {
  getProjectHealthKpis,
  getProjectsByStep,
  getTicketVelocity,
  getStepCompletionFunnel,
  getProjectsTable,
} from '../actions'

export const metadata: Metadata = {
  title: 'Project Health Report',
  description: 'Track project progress, step distribution, and ticket velocity.',
}

const ProjectHealthPage = async () => {
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

  const [kpis, stepData, velocityData, funnelData, projectRows] = await Promise.all([
    getProjectHealthKpis(orgId),
    getProjectsByStep(orgId),
    getTicketVelocity(orgId),
    getStepCompletionFunnel(orgId),
    getProjectsTable(orgId),
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
          data-testid="project-health-heading"
        >
          Project Health
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Track project progress, step distribution, and ticket velocity across your portfolio.
        </p>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active Projects"
          value={kpis.activeProjects}
          icon={FolderKanban}
          color="#3B82F6"
        />
        <KpiCard
          title="Avg Step Progress"
          value={`${kpis.avgStepProgress}%`}
          icon={TrendingUp}
          color="#10B981"
        />
        <KpiCard
          title="Overdue Tickets"
          value={kpis.overdueTickets}
          icon={AlertTriangle}
          color={kpis.overdueTickets > 0 ? '#EF4444' : '#F59E0B'}
        />
        <KpiCard
          title="Completed This Month"
          value={kpis.completedThisMonth}
          icon={CheckCircle2}
          color="#10B981"
        />
      </div>

      {/* Charts row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <StepProgressChart data={stepData} />
        <TicketVelocityChart data={velocityData} />
      </div>

      {/* Funnel */}
      <div className="mb-8">
        <StepFunnelChart data={funnelData} />
      </div>

      {/* Projects table */}
      <Card>
        <CardHeader>
          <CardTitle
            className="text-lg font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            All Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projectRows.length === 0 ? (
            <div
              className="flex h-32 items-center justify-center text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              No projects yet. Create a project to see it here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Current Step</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Open Tickets</TableHead>
                  <TableHead>Overdue</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/projects/${row.id}`}
                        className="hover:underline"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {row.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.currentStep}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-[var(--color-surface-secondary)]">
                          <div
                            className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                            style={{ width: `${row.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {row.progressPercent}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{row.openTickets}</TableCell>
                    <TableCell>
                      {row.overdueCount > 0 ? (
                        <span style={{ color: '#EF4444' }}>{row.overdueCount}</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-tertiary)' }}>0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.lastActivity ? (
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {new Date(row.lastActivity).toLocaleDateString()}
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

export default ProjectHealthPage
