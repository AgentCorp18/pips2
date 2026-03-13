import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { ImplementationChecklistForm } from './implementation-checklist-form'
import type { ImplementationChecklistData } from '@/lib/form-schemas'

const ImplementationChecklistPage = async ({
  params,
}: {
  params: Promise<{ projectId: string; stepNumber: string }>
}) => {
  const { projectId, stepNumber } = await params

  if (stepNumber !== '5') notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const saved = await loadFormData(projectId, 5, 'implementation_checklist')
  const initialData = (saved ?? null) as ImplementationChecklistData | null

  return <ImplementationChecklistForm projectId={projectId} initialData={initialData} />
}

export default ImplementationChecklistPage
