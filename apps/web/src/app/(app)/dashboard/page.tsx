import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { StatCards } from '@/components/dashboard/stat-cards'
import { ProjectsByStepChart } from '@/components/dashboard/projects-by-step-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { getDashboardStats, getProjectsByStep, getRecentActivity } from './actions'

export const metadata: Metadata = {
  title: 'Dashboard - PIPS',
  description: 'Your PIPS dashboard overview',
}

const DashboardPage = async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!membership) {
    redirect('/onboarding')
  }

  const { data: org } = await supabase
    .from('organizations')
    .select('name, slug, plan')
    .eq('id', membership.org_id)
    .single()

  if (!org) {
    redirect('/onboarding')
  }

  const orgId = membership.org_id
  const roleLabel = membership.role as string

  const [stats, stepData, activity] = await Promise.all([
    getDashboardStats(orgId),
    getProjectsByStep(orgId),
    getRecentActivity(orgId, 10),
  ])

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Welcome header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {org.name}
          </h1>
          <Badge variant="secondary">
            {roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)}
          </Badge>
          <Badge variant="outline">{org.plan} plan</Badge>
        </div>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Welcome to your PIPS dashboard. Here is an overview of your workspace.
        </p>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* Stats cards */}
      <StatCards stats={stats} />

      {/* Projects by Step chart */}
      <div className="mt-8">
        <ProjectsByStepChart data={stepData} />
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <RecentActivity items={activity} />
      </div>
    </div>
  )
}

export default DashboardPage
