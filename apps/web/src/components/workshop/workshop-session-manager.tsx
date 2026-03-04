'use client'

import { useTransition } from 'react'
import { Play, Pause, Square, Users, Link2, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WorkshopTimer } from './workshop-timer'
import { WorkshopModuleNavigator } from './workshop-module-navigator'
import { useWorkshopRealtime } from '@/hooks/use-workshop-realtime'
import {
  startSession,
  pauseSession,
  resumeSession,
  completeSession,
  setCurrentModule,
  updateTimerState,
  type WorkshopSession,
  type TimerState,
} from '@/app/(app)/knowledge/workshop/actions'

type SessionManagerProps = {
  initialSession: WorkshopSession
}

const STATUS_STYLES: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  draft: { label: 'Draft', variant: 'outline' },
  active: { label: 'Active', variant: 'default' },
  paused: { label: 'Paused', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'outline' },
}

export const WorkshopSessionManager = ({ initialSession }: SessionManagerProps) => {
  const { session, isConnected } = useWorkshopRealtime(initialSession.id, initialSession)
  const [isPending, startTransition] = useTransition()

  if (!session) return null

  const status = STATUS_STYLES[session.status] ?? { label: 'Draft', variant: 'outline' as const }

  const handleStart = () =>
    startTransition(async () => {
      await startSession(session.id)
    })

  const handlePause = () =>
    startTransition(async () => {
      await pauseSession(session.id)
    })

  const handleResume = () =>
    startTransition(async () => {
      await resumeSession(session.id)
    })

  const handleComplete = () =>
    startTransition(async () => {
      await completeSession(session.id)
    })

  const handleNavigate = (index: number) =>
    startTransition(async () => {
      await setCurrentModule(session.id, index)
    })

  const handleStartCountdown = (seconds: number) =>
    startTransition(async () => {
      const ts: TimerState = {
        mode: 'countdown',
        duration: seconds,
        remaining: seconds,
        running: true,
        startedAt: new Date().toISOString(),
      }
      await updateTimerState(session.id, ts)
    })

  const handleStartCountup = () =>
    startTransition(async () => {
      const ts: TimerState = {
        mode: 'countup',
        running: true,
        startedAt: new Date().toISOString(),
      }
      await updateTimerState(session.id, ts)
    })

  const handleTimerPause = () =>
    startTransition(async () => {
      // Calculate remaining for countdown
      const ts = session.timer_state
      const now = Date.now()
      const elapsed = ts.startedAt ? Math.floor((now - new Date(ts.startedAt).getTime()) / 1000) : 0
      const updated: TimerState = {
        ...ts,
        running: false,
        remaining:
          ts.mode === 'countdown'
            ? Math.max(0, (ts.remaining ?? ts.duration ?? 0) - elapsed)
            : undefined,
        startedAt: undefined,
      }
      await updateTimerState(session.id, updated)
    })

  const handleTimerResume = () =>
    startTransition(async () => {
      const updated: TimerState = {
        ...session.timer_state,
        running: true,
        startedAt: new Date().toISOString(),
      }
      await updateTimerState(session.id, updated)
    })

  const handleTimerReset = () =>
    startTransition(async () => {
      await updateTimerState(session.id, {})
    })

  const participantUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/knowledge/workshop/${session.id}/participant`
      : ''

  const presentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/knowledge/workshop/${session.id}/present`
      : ''

  const isLive = session.status === 'active' || session.status === 'paused'
  const isDraft = session.status === 'draft'
  const isCompleted = session.status === 'completed'

  return (
    <div className="space-y-6" data-testid="session-manager">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            data-testid="session-title"
            className="text-xl font-bold text-[var(--color-text-primary)]"
          >
            {session.title}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            {isConnected && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
              <Users size={12} />
              {session.participant_count} participants
            </span>
          </div>
        </div>

        {/* Session control buttons */}
        <div className="flex items-center gap-2" data-testid="session-controls">
          {isDraft && (
            <Button data-testid="btn-start" onClick={handleStart} disabled={isPending}>
              <Play size={14} />
              Start Session
            </Button>
          )}
          {session.status === 'active' && (
            <Button
              data-testid="btn-pause"
              variant="outline"
              onClick={handlePause}
              disabled={isPending}
            >
              <Pause size={14} />
              Pause
            </Button>
          )}
          {session.status === 'paused' && (
            <Button data-testid="btn-resume" onClick={handleResume} disabled={isPending}>
              <Play size={14} />
              Resume
            </Button>
          )}
          {isLive && (
            <Button
              data-testid="btn-end"
              variant="destructive"
              onClick={handleComplete}
              disabled={isPending}
            >
              <Square size={14} />
              End Session
            </Button>
          )}
        </div>
      </div>

      {/* Share links */}
      {isLive && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(participantUrl)}
          >
            <Link2 size={14} />
            Copy Participant Link
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(presentUrl, '_blank')}>
            <Maximize2 size={14} />
            Presentation Mode
          </Button>
        </div>
      )}

      {/* Main content area */}
      {!isCompleted && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left: Module navigator */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Agenda</h2>
            <WorkshopModuleNavigator
              modules={session.modules}
              currentIndex={session.current_module_index}
              showControls={isLive}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Right: Timer */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Timer</h2>
            <WorkshopTimer
              timerState={session.timer_state}
              showControls={isLive}
              onStartCountdown={handleStartCountdown}
              onStartCountup={handleStartCountup}
              onPause={handleTimerPause}
              onResume={handleTimerResume}
              onReset={handleTimerReset}
            />
          </div>
        </div>
      )}

      {/* Completed state */}
      {isCompleted && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            This session has been completed.
          </p>
          {session.completed_at && (
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              Ended at {new Date(session.completed_at).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
