import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { CostBenefitForm } from './cost-benefit-form'
import type { CostBenefitData } from '@/lib/form-schemas'

const CostBenefitPage = async ({
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

  const saved = await loadFormData(projectId, 4, 'cost_benefit')
  const initialData = (saved ?? null) as CostBenefitData | null

  return <CostBenefitForm projectId={projectId} initialData={initialData} />
}

export default CostBenefitPage
