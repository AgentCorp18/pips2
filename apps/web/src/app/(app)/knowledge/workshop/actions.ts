'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/permissions'
import { hasPermission, type OrgRole } from '@pips/shared'
import { revalidatePath } from 'next/cache'

import {
  createSessionSchema,
  sessionIdSchema,
  setCurrentModuleSchema,
  updateTimerStateSchema,
  updateParticipantCountSchema,
  type ActionResult,
  type TimerState,
  type WorkshopModule,
  type WorkshopSession,
} from './schemas'

export type { WorkshopSession, TimerState, WorkshopModule, ActionResult } from './schemas'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const requireWorkshopPermission = async () => {
  const org = await getUserOrg()
  if (!org) throw new Error('Not a member of any organization')
  const role = org.role as OrgRole
  if (!hasPermission(role, 'workshop.manage')) {
    throw new Error('Insufficient permissions: requires manager+ role')
  }
  return { orgId: org.org_id, role }
}

const getCurrentUserId = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all workshop sessions for the current user's org */
export const getOrgSessions = async (): Promise<WorkshopSession[]> => {
  const org = await getUserOrg()
  if (!org) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workshop_sessions')
    .select('*')
    .eq('org_id', org.org_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getOrgSessions error:', error)
    return []
  }
  return (data ?? []) as WorkshopSession[]
}

/** Fetch a single session by ID */
export const getSession = async (sessionId: string): Promise<WorkshopSession | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workshop_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('getSession error:', error)
    return null
  }
  return data as WorkshopSession
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Create a new workshop session (manager+ only) */
export const createSession = async (
  title: string,
  modules: WorkshopModule[],
  scenarioId?: string,
): Promise<ActionResult<WorkshopSession>> => {
  try {
    const parsed = createSessionSchema.safeParse({ title, modules, scenarioId })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
    }

    const { orgId } = await requireWorkshopPermission()
    const userId = await getCurrentUserId()

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('workshop_sessions')
      .insert({
        org_id: orgId,
        facilitator_id: userId,
        title,
        scenario_id: scenarioId ?? null,
        modules,
        current_module_index: 0,
        timer_state: {},
        participant_count: 0,
        status: 'draft',
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/knowledge/workshop')
    return { success: true, data: data as WorkshopSession }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/** Start a draft session (manager+ only) */
export const startSession = async (sessionId: string): Promise<ActionResult> => {
  try {
    const parsed = sessionIdSchema.safeParse({ sessionId })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
    }

    await requireWorkshopPermission()
    const supabase = await createClient()

    const { error } = await supabase
      .from('workshop_sessions')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
        timer_state: { mode: 'countup', running: true, startedAt: new Date().toISOString() },
      })
      .eq('id', sessionId)
      .eq('status', 'draft')

    if (error) return { success: false, error: error.message }

    revalidatePath('/knowledge/workshop')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/** Pause an active session */
export const pauseSession = async (sessionId: string): Promise<ActionResult> => {
  try {
    const parsed = sessionIdSchema.safeParse({ sessionId })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
    }

    await requireWorkshopPermission()
    const supabase = await createClient()

    // Get current timer state to calculate remaining
    const { data: current } = await supabase
      .from('workshop_sessions')
      .select('timer_state')
      .eq('id', sessionId)
      .single()

    const ts = (current?.timer_state ?? {}) as TimerState
    const now = Date.now()
    const elapsed = ts.startedAt ? Math.floor((now - new Date(ts.startedAt).getTime()) / 1000) : 0

    const updatedTimer: TimerState = {
      ...ts,
      running: false,
      remaining:
        ts.mode === 'countdown'
          ? Math.max(0, (ts.remaining ?? ts.duration ?? 0) - elapsed)
          : undefined,
      startedAt: undefined,
    }

    const { error } = await supabase
      .from('workshop_sessions')
      .update({ status: 'paused', timer_state: updatedTimer })
      .eq('id', sessionId)
      .eq('status', 'active')

    if (error) return { success: false, error: error.message }

    revalidatePath('/knowledge/workshop')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/** Resume a paused session */
export const resumeSession = async (sessionId: string): Promise<ActionResult> => {
  try {
    const parsed = sessionIdSchema.safeParse({ sessionId })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
    }

    await requireWorkshopPermission()
    const supabase = await createClient()

    const { data: current } = await supabase
      .from('workshop_sessions')
      .select('timer_state')
      .eq('id', sessionId)
      .single()

    const ts = (current?.timer_state ?? {}) as TimerState
    const updatedTimer: TimerState = {
      ...ts,
      running: true,
      startedAt: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('workshop_sessions')
      .update({ status: 'active', timer_state: updatedTimer })
      .eq('id', sessionId)
      .eq('status', 'paused')

    if (error) return { success: false, error: error.message }

    revalidatePath('/knowledge/workshop')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/** Complete a session (active or paused) */
export const completeSession = async (sessionId: string): Promise<ActionResult> => {
  try {
    const parsed = sessionIdSchema.safeParse({ sessionId })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
    }

    await requireWorkshopPermission()
    const supabase = await createClient()

    const { error } = await supabase
      .from('workshop_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        timer_state: { running: false },
      })
      .eq('id', sessionId)
      .in('status', ['active', 'paused'])

    if (error) return { success: false, error: error.message }

    revalidatePath('/knowledge/workshop')
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/** Advance to a specific module index */
export const setCurrentModule = async (
  sessionId: string,
  moduleIndex: number,
): Promise<ActionResult> => {
  try {
    const parsed = setCurrentModuleSchema.safeParse({ sessionId, moduleIndex })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
    }

    await requireWorkshopPermission()
    const supabase = await createClient()

    // Bounds check: reject if moduleIndex is out of range
    const { data: session } = await supabase
      .from('workshop_sessions')
      .select('modules')
      .eq('id', sessionId)
      .single()

    if (!session) return { success: false, error: 'Session not found' }

    const modules = session.modules as WorkshopModule[]
    if (moduleIndex >= modules.length) {
      return {
        success: false,
        error: `Module index ${moduleIndex} is out of range (session has ${modules.length} modules)`,
      }
    }

    const { error } = await supabase
      .from('workshop_sessions')
      .update({ current_module_index: moduleIndex })
      .eq('id', sessionId)

    if (error) return { success: false, error: error.message }
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/** Update timer state (for countdown mode) */
export const updateTimerState = async (
  sessionId: string,
  timerState: TimerState,
): Promise<ActionResult> => {
  try {
    const parsed = updateTimerStateSchema.safeParse({ sessionId, timerState })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
    }

    await requireWorkshopPermission()
    const supabase = await createClient()

    const { error } = await supabase
      .from('workshop_sessions')
      .update({ timer_state: timerState })
      .eq('id', sessionId)

    if (error) return { success: false, error: error.message }
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/** Update participant count */
export const updateParticipantCount = async (
  sessionId: string,
  count: number,
): Promise<ActionResult> => {
  try {
    const parsed = updateParticipantCountSchema.safeParse({ sessionId, count })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
    }

    await requireWorkshopPermission()
    const supabase = await createClient()
    const { error } = await supabase
      .from('workshop_sessions')
      .update({ participant_count: count })
      .eq('id', sessionId)

    if (error) return { success: false, error: error.message }
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
