import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Badge } from '@/components/ui/badge'
import { StatCards } from '@/components/dashboard/stat-cards'
import { ProjectsByStepChart } from '@/components/dashboard/projects-by-step-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { CreateSampleProject } from './create-sample-project'
import { getDashboardStats, getProjectsByStep, getRecentActivity } from './actions'
import { KnowledgeCadenceBar } from '@/components/knowledge-cadence/knowledge-cadence-bar'
import { WelcomeCards } from '@/components/dashboard/welcome-cards'
import { QuickCreateFab } from '@/components/ui/quick-create-fab'
import type { ProductContext } from '@pips/shared'

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

  // Fetch org plan separately — getCurrentOrg only returns id/name/role
  const { data: org } = await supabase.from('organizations').select('plan').eq('id', orgId).single()

  if (!org) {
    redirect('/onboarding')
  }

  const roleLabel = role as string

  let stats: Awaited<ReturnType<typeof getDashboardStats>> = {
    activeProjects: 0,
    openTickets: 0,
    overdueTickets: 0,
    completedThisMonth: 0,
    teamMembers: 0,
  }
  let stepData: Awaited<ReturnType<typeof getProjectsByStep>> = []
  let activity: Awaited<ReturnType<typeof getRecentActivity>> = []

  try {
    ;[stats, stepData, activity] = await Promise.all([
      getDashboardStats(orgId),
      getProjectsByStep(orgId),
      getRecentActivity(orgId, 10),
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
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
            data-testid="dashboard-heading"
          >
            {orgName}
          </h1>
          <Badge variant="secondary" data-testid="dashboard-role-badge">
            {roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)}
          </Badge>
          <Badge variant="outline" data-testid="dashboard-plan-badge">
            {org.plan} plan
          </Badge>
        </div>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
          data-testid="dashboard-welcome-text"
        >
          Welcome to your PIPS dashboard. Here is an overview of your workspace.
        </p>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* PIPS Knowledge — overview-level cadence bar */}
      <div className="mb-8">
        <KnowledgeCadenceBar context={dashboardCadenceContext} defaultCollapsed />
      </div>

      {/* Conditional rendering: welcome experience vs full dashboard */}
      {stats.activeProjects === 0 && stats.openTickets === 0 ? (
        <>
          <WelcomeCards />
          <div className="mt-6">
            <CreateSampleProject />
          </div>
        </>
      ) : (
        <>
          {/* Stats cards */}
          <StatCards stats={stats} />

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
