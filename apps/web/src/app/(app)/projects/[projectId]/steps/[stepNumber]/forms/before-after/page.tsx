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

  // Load before-after data + problem statement from Step 1 for context
  const [saved, ps] = await Promise.all([
    loadFormData(projectId, 6, 'before_after'),
    loadFormData(projectId, 1, 'problem_statement'),
  ])
  const initialData = (saved ?? null) as BeforeAfterData | null
  const problemStatementFromStep1 = (ps?.problemStatement as string) ?? ''

  return (
    <BeforeAfterForm
      projectId={projectId}
      initialData={initialData}
      problemStatementFromStep1={problemStatementFromStep1}
    />
  )
}

export default BeforeAfterPage
