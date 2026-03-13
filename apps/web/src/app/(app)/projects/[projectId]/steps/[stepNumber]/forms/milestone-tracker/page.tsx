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

  // Load milestone tracker data + implementation plan from Step 4 for context
  const [saved, ip] = await Promise.all([
    loadFormData(projectId, 5, 'milestone_tracker'),
    loadFormData(projectId, 4, 'implementation_plan'),
  ])
  const initialData = (saved ?? null) as MilestoneTrackerData | null
  const selectedSolutionFromStep4 = (ip?.selectedSolution as string) ?? ''

  return (
    <MilestoneTrackerForm
      projectId={projectId}
      initialData={initialData}
      selectedSolutionFromStep4={selectedSolutionFromStep4}
    />
  )
}

export default MilestoneTrackerPage
