import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { MilestoneTrackerForm } from './milestone-tracker-form'
import type { MilestoneTrackerData } from '@/lib/form-schemas'

const MilestoneTrackerPage = async ({
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

  const saved = await loadFormData(projectId, 5, 'milestone_tracker')
  const initialData = (saved ?? null) as MilestoneTrackerData | null

  return <MilestoneTrackerForm projectId={projectId} initialData={initialData} />
}

export default MilestoneTrackerPage
