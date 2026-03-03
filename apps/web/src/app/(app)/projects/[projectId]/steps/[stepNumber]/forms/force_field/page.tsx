import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { ForceFieldForm } from './force-field-form'

const ForceFieldPage = async ({
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

  const saved = await loadFormData(projectId, stepNumber, 'force_field')
  const ps = await loadFormData(projectId, 1, 'problem_statement')
  const problemStatement = (ps?.problemStatement as string) ?? ''

  return (
    <ForceFieldForm
      projectId={projectId}
      stepNumber={stepNumber}
      initialData={saved}
      problemStatementFromStep1={problemStatement}
    />
  )
}

export default ForceFieldPage
