import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/reports/kpi-card'
import { FormCompletionChart } from '@/components/reports/form-completion-chart'
import { StepDurationChart } from '@/components/reports/step-duration-chart'
import { ToolPopularityChart } from '@/components/reports/tool-popularity-chart'
import { StepBreakdownTable } from '@/components/reports/step-breakdown-table'
import { BookOpen, Clock, Wrench, TrendingUp, ArrowLeft } from 'lucide-react'
import {
  getMethodologyKpis,
  getFormCompletionByStep,
  getStepDurations,
  getToolPopularity,
  getStepBreakdownTable,
} from '../actions'

export const metadata: Metadata = {
  title: 'Methodology Insights',
  description: 'Analyze PIPS methodology adoption, tool usage, and step completion patterns.',
}

const MethodologyInsightsPage = async () => {
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

  const [kpis, formCompletion, durations, toolData, stepRows] = await Promise.all([
    getMethodologyKpis(orgId),
    getFormCompletionByStep(orgId),
    getStepDurations(orgId),
    getToolPopularity(orgId),
    getStepBreakdownTable(orgId),
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
          data-testid="methodology-insights-heading"
        >
          Methodology Insights
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Analyze PIPS methodology adoption, tool usage, and step completion patterns.
        </p>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Forms Completed"
          value={kpis.totalFormsCompleted}
          icon={BookOpen}
          color="#3B82F6"
        />
        <KpiCard
          title="Avg Time per Step"
          value={kpis.avgTimePerStep > 0 ? `${kpis.avgTimePerStep}d` : '--'}
          icon={Clock}
          color="#F59E0B"
          subtitle={kpis.avgTimePerStep > 0 ? 'days average' : 'No completed steps'}
        />
        <KpiCard title="Most Used Tool" value={kpis.mostUsedTool} icon={Wrench} color="#0891B2" />
        <KpiCard
          title="Completion Rate"
          value={`${kpis.completionRate}%`}
          icon={TrendingUp}
          color="#10B981"
          subtitle="of projects completed"
        />
      </div>

      {/* Charts row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <FormCompletionChart data={formCompletion} />
        <StepDurationChart data={durations} />
      </div>

      {/* Tool popularity */}
      <div className="mb-8">
        <ToolPopularityChart data={toolData} />
      </div>

      {/* Step breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle
            className="text-lg font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Step Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepBreakdownTable rows={stepRows} />
        </CardContent>
      </Card>
    </div>
  )
}

export default MethodologyInsightsPage
