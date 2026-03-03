import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { ImpactAssessmentForm } from './impact-assessment-form'

const ImpactAssessmentPage = async ({
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

  const saved = await loadFormData(projectId, stepNumber, 'impact_assessment')

  return <ImpactAssessmentForm projectId={projectId} stepNumber={stepNumber} initialData={saved} />
}

export default ImpactAssessmentPage
