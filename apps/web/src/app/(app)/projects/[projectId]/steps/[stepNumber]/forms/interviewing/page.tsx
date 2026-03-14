import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { InterviewingForm } from './interviewing-form'

const InterviewingPage = async ({
  params,
}: {
  params: Promise<{ projectId: string; stepNumber: string }>
}) => {
  const { projectId, stepNumber: stepStr } = await params
  const stepNumber = parseInt(stepStr, 10)

  if (stepNumber !== 3) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const saved = await loadFormData(projectId, stepNumber, 'interviewing')

  return <InterviewingForm projectId={projectId} stepNumber={stepNumber} initialData={saved} />
}

export default InterviewingPage
