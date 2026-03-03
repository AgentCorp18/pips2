import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { PairedComparisonsForm } from './paired-comparisons-form'
import type { PairedComparisonsData } from '@/lib/form-schemas'

const PairedComparisonsPage = async ({
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

  const saved = await loadFormData(projectId, 4, 'paired_comparisons')
  const initialData = (saved?.data ?? null) as PairedComparisonsData | null

  return <PairedComparisonsForm projectId={projectId} initialData={initialData} />
}

export default PairedComparisonsPage
