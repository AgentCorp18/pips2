import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { RaciForm } from './raci-form'
import type { RaciData } from '@/lib/form-schemas'

const RaciPage = async ({
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

  const saved = await loadFormData(projectId, 4, 'raci')
  const initialData = (saved?.data ?? null) as RaciData | null

  return <RaciForm projectId={projectId} initialData={initialData} />
}

export default RaciPage
