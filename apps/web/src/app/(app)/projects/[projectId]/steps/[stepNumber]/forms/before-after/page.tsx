import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { BeforeAfterForm } from './before-after-form'
import type { BeforeAfterData } from '@/lib/form-schemas'

const BeforeAfterPage = async ({
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

  const saved = await loadFormData(projectId, 6, 'before_after')
  const initialData = (saved ?? null) as BeforeAfterData | null

  return <BeforeAfterForm projectId={projectId} initialData={initialData} />
}

export default BeforeAfterPage
