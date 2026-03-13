import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { LessonsLearnedForm } from './lessons-learned-form'
import type { LessonsLearnedData } from '@/lib/form-schemas'

const LessonsLearnedPage = async ({
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

  const saved = await loadFormData(projectId, 6, 'lessons_learned')
  const initialData = (saved ?? null) as LessonsLearnedData | null

  return <LessonsLearnedForm projectId={projectId} initialData={initialData} />
}

export default LessonsLearnedPage
