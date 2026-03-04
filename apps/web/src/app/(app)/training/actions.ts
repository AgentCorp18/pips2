'use server'

import { createClient } from '@/lib/supabase/server'

export type TrainingPathRow = {
  id: string
  title: string
  description: string
  estimated_hours: number
  target_audience: string
  sort_order: number
  is_active: boolean
}

export type TrainingModuleRow = {
  id: string
  path_id: string
  title: string
  description: string
  estimated_minutes: number
  sort_order: number
  content_node_ids: string[]
  prerequisites: string[]
}

export type TrainingProgressRow = {
  id: string
  path_id: string
  module_id: string
  status: string
  started_at: string | null
  completed_at: string | null
  assessment_score: number | null
  time_spent_minutes: number
}

/** Get all active training paths */
export const getTrainingPaths = async (): Promise<TrainingPathRow[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('training_paths')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    console.error('getTrainingPaths error:', error)
    return []
  }
  return data ?? []
}

/** Get modules for a training path */
export const getTrainingModules = async (pathId: string): Promise<TrainingModuleRow[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('training_modules')
    .select('*')
    .eq('path_id', pathId)
    .order('sort_order')

  if (error) {
    console.error('getTrainingModules error:', error)
    return []
  }
  return data ?? []
}

/** Get user's training progress */
export const getUserTrainingProgress = async (): Promise<TrainingProgressRow[]> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('training_progress')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    console.error('getUserTrainingProgress error:', error)
    return []
  }
  return data ?? []
}

/** Start or update training progress for a module */
export const updateTrainingProgress = async (
  pathId: string,
  moduleId: string,
  status: 'not_started' | 'in_progress' | 'completed',
  timeSpentMinutes?: number,
  assessmentScore?: number,
): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const now = new Date().toISOString()
  const update: Record<string, unknown> = {
    user_id: user.id,
    path_id: pathId,
    module_id: moduleId,
    status,
    updated_at: now,
  }

  if (status === 'in_progress' && !update.started_at) {
    update.started_at = now
  }
  if (status === 'completed') {
    update.completed_at = now
  }
  if (timeSpentMinutes !== undefined) {
    update.time_spent_minutes = timeSpentMinutes
  }
  if (assessmentScore !== undefined) {
    update.assessment_score = assessmentScore
  }

  await supabase.from('training_progress').upsert(update, { onConflict: 'user_id,module_id' })
}

/** Get a single training path by slug/ID */
export const getTrainingPath = async (pathId: string): Promise<TrainingPathRow | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('training_paths')
    .select('*')
    .eq('id', pathId)
    .single()

  if (error) return null
  return data
}
