import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { ImpactMetricsForm } from './impact-metrics-form'

const ImpactMetricsPage = async ({
  params,
}: {
  params: Promise<{ projectId: string; stepNumber: string }>
}) => {
  const { projectId, stepNumber: stepStr } = await params
  const stepNumber = parseInt(stepStr, 10)

  if (stepNumber !== 1) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const saved = await loadFormData(projectId, stepNumber, 'impact_metrics')

  return <ImpactMetricsForm projectId={projectId} stepNumber={stepNumber} initialData={saved} />
}

export default ImpactMetricsPage
