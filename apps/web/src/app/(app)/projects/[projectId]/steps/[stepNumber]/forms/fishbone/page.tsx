import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { FishboneForm } from './fishbone-form'

const FishbonePage = async ({
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

  // Load fishbone data
  const saved = await loadFormData(projectId, stepNumber, 'fishbone')

  // Also load problem statement from Step 1 for context
  const ps = await loadFormData(projectId, 1, 'problem_statement')
  const problemStatement = (ps?.problemStatement as string) ?? ''

  return (
    <FishboneForm
      projectId={projectId}
      stepNumber={stepNumber}
      initialData={saved}
      problemStatementFromStep1={problemStatement}
    />
  )
}

export default FishbonePage
