import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { ImplementationPlanForm } from './implementation-plan-form'
import type { ImplementationPlanData } from '@/lib/form-schemas'

const ImplementationPlanPage = async ({
  params,
}: {
  params: Promise<{ projectId: string; stepNumber: string }>
}) => {
  const { projectId, stepNumber } = await params

  if (stepNumber !== '4') notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const saved = await loadFormData(projectId, 4, 'implementation_plan')
  const initialData = (saved ?? null) as ImplementationPlanData | null

  return <ImplementationPlanForm projectId={projectId} initialData={initialData} />
}

export default ImplementationPlanPage
