import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { FiveWhyForm } from './five-why-form'

const FiveWhyPage = async ({
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

  const saved = await loadFormData(projectId, stepNumber, 'five_why')
  const ps = await loadFormData(projectId, 1, 'problem_statement')
  const problemStatement = (ps?.problemStatement as string) ?? ''

  return (
    <FiveWhyForm
      projectId={projectId}
      stepNumber={stepNumber}
      initialData={saved}
      problemStatementFromStep1={problemStatement}
    />
  )
}

export default FiveWhyPage
