import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { ParetoForm } from './pareto-form'
import type { ParetoData } from '@/lib/form-schemas'

const ParetoPage = async ({
  params,
}: {
  params: Promise<{ projectId: string; stepNumber: string }>
}) => {
  const { projectId, stepNumber: stepStr } = await params
  const stepNumber = parseInt(stepStr, 10)

  if (stepNumber !== 2) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const saved = await loadFormData(projectId, 2, 'pareto')
  const initialData = (saved ?? null) as ParetoData | null

  return <ParetoForm projectId={projectId} stepNumber={stepNumber} initialData={initialData} />
}

export default ParetoPage
