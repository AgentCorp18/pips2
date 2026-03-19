import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/reports/kpi-card'
import {
  LazyFormCompletionChart as FormCompletionChart,
  LazyStepDurationChart as StepDurationChart,
  LazyToolPopularityChart as ToolPopularityChart,
  LazyDepthTrendChart as DepthTrendChart,
  LazyToolEffectivenessChart as ToolEffectivenessChart,
} from '@/components/reports/lazy-charts'
import { FormUsageHeatmap } from '@/components/reports/form-usage-heatmap'
import { AdoptionFunnelChart } from '@/components/reports/adoption-funnel-chart'
import { StepBreakdownTable } from '@/components/reports/step-breakdown-table'
import { BookOpen, Clock, TrendingUp, ArrowLeft, BarChart2 } from 'lucide-react'
import {
  getMethodologyKpis,
  getFormCompletionByStep,
  getStepDurations,
  getToolPopularity,
  getStepBreakdownTable,
  getMethodologyAdoption,
} from '../actions'

export const metadata: Metadata = {
  title: 'Methodology Adoption',
  description:
    'Analyze PIPS methodology adoption, depth trends, form usage heatmap, and tool effectiveness.',
}

const MethodologyInsightsPage = async () => {
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

  const orgId = currentOrg.orgId

  const [kpis, formCompletion, durations, toolData, stepRows, adoption] = await Promise.all([
    getMethodologyKpis(orgId),
    getFormCompletionByStep(orgId),
    getStepDurations(orgId),
    getToolPopularity(orgId),
    getStepBreakdownTable(orgId),
    getMethodologyAdoption(orgId),
  ])

  const totalProjects = adoption.stepCompletionFunnel[0]?.projectsReached ?? 0

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
          Methodology Adoption
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Depth trends, form usage heatmap, step funnel, and tool effectiveness — across all your
          projects.
        </p>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Avg Depth Score"
          value={adoption.avgDepthScore > 0 ? `${adoption.avgDepthScore}%` : '--'}
          icon={BarChart2}
          color="#4F46E5"
          subtitle={adoption.avgDepthScore > 0 ? 'across all projects' : 'No forms completed yet'}
        />
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
        <KpiCard
          title="Completion Rate"
          value={`${kpis.completionRate}%`}
          icon={TrendingUp}
          color="#10B981"
          subtitle="of projects completed"
        />
      </div>

      {/* Depth Trend + Step Funnel */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <DepthTrendChart data={adoption.depthTrend} />
        <AdoptionFunnelChart data={adoption.stepCompletionFunnel} totalProjects={totalProjects} />
      </div>

      {/* Form Usage Heatmap */}
      <div className="mb-8">
        <FormUsageHeatmap data={adoption.formUsageHeatmap} />
      </div>

      {/* Tool Effectiveness + Tool Popularity */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <ToolEffectivenessChart data={adoption.topToolsByEffectiveness} />
        <ToolPopularityChart data={toolData} />
      </div>

      {/* Legacy charts row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <FormCompletionChart data={formCompletion} />
        <StepDurationChart data={durations} />
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
