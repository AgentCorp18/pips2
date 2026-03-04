'use client'

import { useEffect, useMemo, useReducer, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { WorkshopSession, TimerState } from '@/app/(app)/knowledge/workshop/actions'

// ---------------------------------------------------------------------------
// useWorkshopRealtime — subscribe to Postgres changes on a session row
// ---------------------------------------------------------------------------

type RealtimeState = {
  session: WorkshopSession | null
  isConnected: boolean
}

type RealtimeAction =
  | { type: 'SESSION_UPDATE'; session: WorkshopSession }
  | { type: 'CONNECTION_CHANGE'; isConnected: boolean }

const realtimeReducer = (state: RealtimeState, action: RealtimeAction): RealtimeState => {
  switch (action.type) {
    case 'SESSION_UPDATE':
      return { ...state, session: action.session }
    case 'CONNECTION_CHANGE':
      return { ...state, isConnected: action.isConnected }
  }
}

/**
 * Subscribe to real-time changes on a workshop session.
 * Automatically updates when facilitator changes module, timer, or status.
 */
export const useWorkshopRealtime = (sessionId: string, initialSession: WorkshopSession | null) => {
  const [state, dispatch] = useReducer(realtimeReducer, {
    session: initialSession,
    isConnected: false,
  })
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const supabase = supabaseRef.current

    const channel = supabase
      .channel(`workshop:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workshop_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          dispatch({ type: 'SESSION_UPDATE', session: payload.new as WorkshopSession })
        },
      )
      .subscribe((status) => {
        dispatch({ type: 'CONNECTION_CHANGE', isConnected: status === 'SUBSCRIBED' })
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  // Return latest from Realtime, or fall back to server-provided initial
  const session = state.session ?? initialSession

  return { session, isConnected: state.isConnected }
}

// ---------------------------------------------------------------------------
// useWorkshopTimer — client-side tick based on timer_state
// ---------------------------------------------------------------------------

const computeDisplaySeconds = (ts: TimerState | undefined): number => {
  if (!ts) return 0

  if (!ts.running || !ts.startedAt) {
    if (ts.mode === 'countdown') return ts.remaining ?? ts.duration ?? 0
    return 0
  }

  const elapsed = Math.floor((Date.now() - new Date(ts.startedAt).getTime()) / 1000)

  if (ts.mode === 'countdown') {
    const base = ts.remaining ?? ts.duration ?? 0
    return Math.max(0, base - elapsed)
  }
  return elapsed
}

/**
 * Client-side timer that ticks every second when running.
 * Returns the display time in seconds.
 */
export const useWorkshopTimer = (timerState: TimerState | undefined) => {
  const [, forceRender] = useReducer((x: number) => x + 1, 0)
  const secondsRef = useRef(computeDisplaySeconds(timerState))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const serialized = useMemo(() => JSON.stringify(timerState ?? {}), [timerState])

  useEffect(() => {
    clearTimer()

    secondsRef.current = computeDisplaySeconds(timerState)
    forceRender()

    if (timerState?.running && timerState.startedAt) {
      intervalRef.current = setInterval(() => {
        secondsRef.current = computeDisplaySeconds(timerState)
        forceRender()
      }, 1000)
    }

    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, clearTimer])

  return secondsRef.current
}

// ---------------------------------------------------------------------------
// Formatting helper
// ---------------------------------------------------------------------------

/** Format seconds as MM:SS or HH:MM:SS */
export const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}
