import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Badge } from '@/components/ui/badge'
import { StatCards } from '@/components/dashboard/stat-cards'
import { LazyProjectsByStepChart as ProjectsByStepChart } from '@/components/reports/lazy-charts'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { AgingTicketsAlert } from '@/components/dashboard/aging-tickets-alert'
import { CreateSampleProject } from './create-sample-project'
import {
  getDashboardStats,
  getDashboardDeltas,
  getProjectsByStep,
  getRecentActivity,
  getAgingTickets,
  getDashboardMetrics,
  getOrgImpactSummary,
  getDashboardPersonalSummary,
  getComplianceAlerts,
} from './actions'
import { MetricsWidgets } from '@/components/dashboard/metrics-widgets'
import type {
  DashboardMetrics,
  DashboardDeltas,
  OrgImpactSummary,
  PersonalSummary,
  ComplianceAlert,
} from './actions'
import { OrgImpactSummary as OrgImpactSummaryWidget } from '@/components/dashboard/org-impact-summary'
import { MethodologyComplianceAlert } from '@/components/dashboard/methodology-compliance-alert'
import { KnowledgeCadenceBar } from '@/components/knowledge-cadence/knowledge-cadence-bar'
import { WelcomeCards } from '@/components/dashboard/welcome-cards'
import { QuickCreateFab } from '@/components/ui/quick-create-fab'
import type { ProductContext } from '@pips/shared'

/* ============================================================
   Helpers
   ============================================================ */

const getTimeOfDayGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/* ============================================================
   Metadata
   ============================================================ */

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'Your PIPS dashboard — view project stats, activity, and process improvement progress at a glance.',
}

const DashboardPage = async () => {
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

  const { orgId, orgName, role } = currentOrg

  // Fetch org plan + user profile in parallel
  const [orgResult, profileResult] = await Promise.all([
    supabase.from('organizations').select('plan').eq('id', orgId).single(),
    supabase.from('profiles').select('display_name, full_name').eq('id', user.id).single(),
  ])

  const { data: org } = orgResult

  if (!org) {
    redirect('/onboarding')
  }

  const roleLabel = role as string

  // Resolve display name: prefer display_name, fall back to full_name, then email prefix
  const profile = profileResult.data
  const displayName =
    profile?.display_name ?? profile?.full_name ?? (user.email ? user.email.split('@')[0] : 'there')

  const greeting = getTimeOfDayGreeting()

  let stats: Awaited<ReturnType<typeof getDashboardStats>> = {
    totalProjects: 0,
    activeProjects: 0,
    openTickets: 0,
    overdueTickets: 0,
    blockedTickets: 0,
    completedThisMonth: 0,
    teamMembers: 0,
  }
  let stepData: Awaited<ReturnType<typeof getProjectsByStep>> = []
  let activity: Awaited<ReturnType<typeof getRecentActivity>> = []
  let agingTickets: Awaited<ReturnType<typeof getAgingTickets>> = []
  let metrics: DashboardMetrics = {
    completionRate: 0,
    avgCycleTimeDays: null,
    ticketsClosedThisWeek: 0,
    ticketsCreatedThisWeek: 0,
    formsCompletedCount: 0,
  }
  let impactSummary: OrgImpactSummary = {
    projectsCompleted: 0,
    ticketsResolved: 0,
    formsCompleted: 0,
    avgMethodologyDepth: null,
    avgCycleTimeDays: null,
    rootCausesIdentified: 0,
    solutionsEvaluated: 0,
    lessonsDocumented: 0,
  }
  let personalSummary: PersonalSummary = {
    assignedTickets: 0,
    overdueTickets: 0,
    pendingNotifications: 0,
  }
  let complianceAlert: ComplianceAlert | null = null
  let deltas: DashboardDeltas = {
    openTickets: { current: 0, previousWeek: 0, delta: 0, direction: 'flat' },
    overdueTickets: { current: 0, previousWeek: 0, delta: 0, direction: 'flat' },
    completedThisMonth: { current: 0, previousWeek: 0, delta: 0, direction: 'flat' },
    activeProjects: { current: 0, previousWeek: 0, delta: 0, direction: 'flat' },
  }

  try {
    ;[
      stats,
      stepData,
      activity,
      agingTickets,
      metrics,
      impactSummary,
      personalSummary,
      complianceAlert,
      deltas,
    ] = await Promise.all([
      getDashboardStats(orgId),
      getProjectsByStep(orgId),
      getRecentActivity(orgId, 10),
      getAgingTickets(orgId),
      getDashboardMetrics(orgId),
      getOrgImpactSummary(orgId),
      getDashboardPersonalSummary(user.id, orgId),
      getComplianceAlerts(orgId),
      getDashboardDeltas(orgId),
    ])
  } catch (err) {
    console.error('[DashboardPage] Error fetching data:', err)
  }

  // Overview-level cadence context — surfaces introductory PIPS content
  const dashboardCadenceContext: ProductContext = {
    steps: ['overview'],
    tools: [],
    roles: [],
    principles: [],
  }

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Welcome header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
          data-testid="dashboard-heading"
        >
          {greeting}, {displayName}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
            data-testid="dashboard-org-context"
          >
            {orgName}
          </span>
          <Badge variant="secondary" data-testid="dashboard-role-badge">
            {roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)}
          </Badge>
          <Badge variant="outline" data-testid="dashboard-plan-badge">
            {org.plan} plan
          </Badge>
        </div>
        <p
          className="mt-2 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
          data-testid="dashboard-personal-summary"
        >
          {personalSummary.assignedTickets === 0 ? (
            'No tickets assigned to you right now.'
          ) : (
            <>
              You have{' '}
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {personalSummary.assignedTickets} ticket
                {personalSummary.assignedTickets !== 1 ? 's' : ''} assigned
              </span>
              {personalSummary.overdueTickets > 0 && (
                <>
                  ,{' '}
                  <span className="font-medium" style={{ color: 'var(--color-danger, #dc2626)' }}>
                    {personalSummary.overdueTickets} overdue
                  </span>
                </>
              )}
              .
            </>
          )}
        </p>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* PIPS Knowledge — overview-level cadence bar */}
      <div className="mb-8">
        <KnowledgeCadenceBar context={dashboardCadenceContext} defaultCollapsed />
      </div>

      {/* Onboarding checklist — shown until all 4 steps complete or dismissed */}
      {stats.totalProjects === 0 && (
        <div className="mb-8">
          <WelcomeCards />
          <div className="mt-6">
            <CreateSampleProject />
          </div>
        </div>
      )}

      {/* Full dashboard — hidden until first project exists */}
      {stats.totalProjects > 0 && (
        <>
          {/* Onboarding checklist — persists until all 4 steps complete or dismissed */}
          <div className="mb-8">
            <WelcomeCards />
          </div>

          {/* Stats cards */}
          <StatCards stats={stats} deltas={deltas} />

          {/* Metrics widgets — completion rate, cycle time, velocity, forms */}
          <div className="mt-6">
            <MetricsWidgets metrics={metrics} />
          </div>

          {/* Org Impact Summary — Phase 0A ROI Visibility */}
          <div className="mt-8">
            <OrgImpactSummaryWidget data={impactSummary} />
          </div>

          {/* Sample project CTA — shown when user has no projects */}
          {stats.activeProjects === 0 && (
            <div className="mt-6">
              <CreateSampleProject />
            </div>
          )}

          {/* Projects by Step chart */}
          <div className="mt-8">
            <ProjectsByStepChart data={stepData} />
          </div>

          {/* Aging Tickets Alert */}
          {agingTickets.length > 0 && (
            <div className="mt-8">
              <AgingTicketsAlert tickets={agingTickets} />
            </div>
          )}

          {/* Methodology Compliance Alert */}
          {complianceAlert && (
            <div className="mt-8">
              <MethodologyComplianceAlert alert={complianceAlert} />
            </div>
          )}

          {/* Recent Activity */}
          <div className="mt-8">
            <RecentActivity items={activity} />
          </div>
        </>
      )}

      <QuickCreateFab />
    </div>
  )
}

export default DashboardPage
