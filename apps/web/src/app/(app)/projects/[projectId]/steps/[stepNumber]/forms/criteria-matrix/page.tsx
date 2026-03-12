import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { CriteriaMatrixForm } from './criteria-matrix-form'
import type { CriteriaMatrixData } from '@/lib/form-schemas'

const CriteriaMatrixPage = async ({
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

  const saved = await loadFormData(projectId, 4, 'criteria_matrix')
  const initialData = (saved ?? null) as CriteriaMatrixData | null

  return <CriteriaMatrixForm projectId={projectId} initialData={initialData} />
}

export default CriteriaMatrixPage
