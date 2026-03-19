import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { ResultsMetricsForm } from './results-metrics-form'

const ResultsMetricsPage = async ({
  params,
}: {
  params: Promise<{ projectId: string; stepNumber: string }>
}) => {
  const { projectId, stepNumber: stepStr } = await params
  const stepNumber = parseInt(stepStr, 10)

  if (stepNumber !== 6) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [saved, impactMetricsData, problemStatementData] = await Promise.all([
    loadFormData(projectId, stepNumber, 'results_metrics'),
    loadFormData(projectId, 1, 'impact_metrics'),
    loadFormData(projectId, 1, 'problem_statement'),
  ])

  return (
    <ResultsMetricsForm
      projectId={projectId}
      stepNumber={stepNumber}
      initialData={saved}
      impactMetricsData={impactMetricsData}
      problemStatementData={problemStatementData}
    />
  )
}

export default ResultsMetricsPage
