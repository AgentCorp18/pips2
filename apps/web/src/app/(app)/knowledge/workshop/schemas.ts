import { z } from 'zod'

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const workshopModuleSchema = z.object({
  title: z.string().min(1, 'Module title is required'),
  duration: z.string().min(1, 'Module duration is required'),
  notes: z.string(),
})

export const createSessionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  modules: z.array(workshopModuleSchema),
  scenarioId: z.string().uuid('Scenario ID must be a valid UUID').optional(),
})

export const sessionIdSchema = z.object({
  sessionId: z.string().uuid('Session ID must be a valid UUID'),
})

export const setCurrentModuleSchema = z.object({
  sessionId: z.string().uuid('Session ID must be a valid UUID'),
  moduleIndex: z
    .number()
    .int('Module index must be an integer')
    .min(0, 'Module index must be non-negative'),
})

export const timerStateSchema = z.object({
  mode: z.enum(['countdown', 'countup']).optional(),
  duration: z.number().optional(),
  remaining: z.number().optional(),
  running: z.boolean().optional(),
  startedAt: z.string().optional(),
})

export const updateTimerStateSchema = z.object({
  sessionId: z.string().uuid('Session ID must be a valid UUID'),
  timerState: timerStateSchema,
})

export const updateParticipantCountSchema = z.object({
  sessionId: z.string().uuid('Session ID must be a valid UUID'),
  count: z.number().int('Count must be an integer').min(0, 'Count must be non-negative'),
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WorkshopSession = {
  id: string
  org_id: string
  facilitator_id: string
  title: string
  scenario_id: string | null
  current_module_index: number
  timer_state: TimerState
  participant_count: number
  status: 'draft' | 'active' | 'paused' | 'completed'
  modules: WorkshopModule[]
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type TimerState = {
  mode?: 'countdown' | 'countup'
  duration?: number // total seconds for countdown
  remaining?: number // remaining seconds
  running?: boolean
  startedAt?: string // ISO timestamp when timer was last started/resumed
}

export type WorkshopModule = {
  title: string
  duration: string
  notes: string
}

export type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string }
