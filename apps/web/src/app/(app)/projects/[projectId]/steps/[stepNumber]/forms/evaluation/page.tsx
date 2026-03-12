import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { EvaluationForm } from './evaluation-form'
import type { EvaluationData } from '@/lib/form-schemas'

const EvaluationPage = async ({
  params,
}: {
  params: Promise<{ projectId: string; stepNumber: string }>
}) => {
  const { projectId, stepNumber } = await params

  if (stepNumber !== '6') notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const saved = await loadFormData(projectId, 6, 'evaluation')
  const initialData = (saved ?? null) as EvaluationData | null

  return <EvaluationForm projectId={projectId} initialData={initialData} />
}

export default EvaluationPage
