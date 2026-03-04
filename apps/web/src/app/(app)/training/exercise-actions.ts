'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTrainingProgress } from './actions'

export type TrainingExerciseRow = {
  id: string
  module_id: string
  type: 'multiple-choice' | 'fill-form' | 'reflection' | 'scenario-practice'
  title: string
  instructions: string
  scenario_id: string | null
  form_type: string | null
  expected_minutes: number
  sort_order: number
  config: Record<string, unknown>
}

export type TrainingExerciseDataRow = {
  id: string
  exercise_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  data: Record<string, unknown>
  score: number | null
  attempts: number
  last_attempt_at: string | null
}

/** Get exercises for a module */
export const getModuleExercises = async (moduleId: string): Promise<TrainingExerciseRow[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('training_exercises')
    .select('*')
    .eq('module_id', moduleId)
    .order('sort_order')

  if (error) {
    console.error('getModuleExercises error:', error)
    return []
  }
  return data ?? []
}

/** Get user's exercise data for a set of exercises */
export const getUserExerciseData = async (
  exerciseIds: string[],
): Promise<TrainingExerciseDataRow[]> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || exerciseIds.length === 0) return []

  const { data, error } = await supabase
    .from('training_exercise_data')
    .select('*')
    .eq('user_id', user.id)
    .in('exercise_id', exerciseIds)

  if (error) {
    console.error('getUserExerciseData error:', error)
    return []
  }
  return data ?? []
}

/** Complete or update an exercise */
export const completeExercise = async (
  exerciseId: string,
  exerciseData: Record<string, unknown>,
  score?: number,
): Promise<{ success: boolean }> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const now = new Date().toISOString()

  const { error } = await supabase.from('training_exercise_data').upsert(
    {
      user_id: user.id,
      exercise_id: exerciseId,
      status: 'completed' as const,
      data: exerciseData,
      score: score ?? null,
      attempts: 1,
      last_attempt_at: now,
      updated_at: now,
    },
    { onConflict: 'user_id,exercise_id' },
  )

  if (error) {
    console.error('completeExercise error:', error)
    return { success: false }
  }
  return { success: true }
}

/** Check if all exercises in a module are completed, and if so mark module complete */
export const completeModule = async (
  pathId: string,
  moduleId: string,
): Promise<{ completed: boolean }> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { completed: false }

  const { data: exercises } = await supabase
    .from('training_exercises')
    .select('id')
    .eq('module_id', moduleId)

  if (!exercises || exercises.length === 0) return { completed: false }

  const exerciseIds = exercises.map((e) => e.id)
  const { data: exerciseData } = await supabase
    .from('training_exercise_data')
    .select('exercise_id, status')
    .eq('user_id', user.id)
    .in('exercise_id', exerciseIds)
    .eq('status', 'completed')

  const completedCount = exerciseData?.length ?? 0
  const allDone = completedCount === exercises.length

  if (allDone) {
    await updateTrainingProgress(pathId, moduleId, 'completed')
    return { completed: true }
  }

  if (completedCount > 0) {
    await updateTrainingProgress(pathId, moduleId, 'in_progress')
  }
  return { completed: false }
}

/** Calculate path progress percentage */
export const calculatePathProgress = async (
  pathId: string,
): Promise<{ completed: number; total: number; percentage: number }> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { completed: 0, total: 0, percentage: 0 }

  const { data: modules } = await supabase
    .from('training_modules')
    .select('id')
    .eq('path_id', pathId)

  if (!modules || modules.length === 0) return { completed: 0, total: 0, percentage: 0 }

  const total = modules.length

  const { data: progress } = await supabase
    .from('training_progress')
    .select('module_id, status')
    .eq('user_id', user.id)
    .eq('path_id', pathId)
    .eq('status', 'completed')

  const completed = progress?.length ?? 0
  const percentage = Math.round((completed / total) * 100)

  return { completed, total, percentage }
}

/** Check if module prerequisites are met */
export const checkPrerequisitesMet = async (modulePrerequisites: string[]): Promise<boolean> => {
  if (modulePrerequisites.length === 0) return true

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('training_progress')
    .select('module_id')
    .eq('user_id', user.id)
    .in('module_id', modulePrerequisites)
    .eq('status', 'completed')

  const completedIds = new Set(data?.map((d) => d.module_id) ?? [])
  return modulePrerequisites.every((id) => completedIds.has(id))
}
