'use client'

import { useEffect, useCallback } from 'react'
import { WorkshopTimer } from './workshop-timer'
import { useWorkshopRealtime } from '@/hooks/use-workshop-realtime'
import type { WorkshopSession } from '@/app/(app)/knowledge/workshop/actions'

type SlideViewProps = {
  initialSession: WorkshopSession
}

export const WorkshopSlideView = ({ initialSession }: SlideViewProps) => {
  const { session } = useWorkshopRealtime(initialSession.id, initialSession)

  // Keyboard shortcuts for navigation (ESC to exit)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        window.close()
      }
    }
    if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!session) return null

  const currentModule = session.modules[session.current_module_index]
  const isCompleted = session.status === 'completed'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-deep,#1B1340)] p-4 sm:p-8 text-white">
      {/* Progress indicator */}
      <div className="absolute left-0 top-0 h-1 w-full bg-white/10">
        <div
          className="h-full bg-[var(--color-primary)] transition-all duration-500"
          style={{
            width: `${((session.current_module_index + 1) / Math.max(session.modules.length, 1)) * 100}%`,
          }}
        />
      </div>

      {isCompleted ? (
        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl font-bold">Session Complete</h1>
          <p className="mt-4 text-xl text-white/60">Thank you for participating!</p>
        </div>
      ) : currentModule ? (
        <>
          {/* Module step indicator */}
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-white/40">
            {session.current_module_index + 1} / {session.modules.length}
          </p>

          {/* Module title */}
          <h1 className="max-w-3xl text-center text-3xl sm:text-5xl font-bold leading-tight">
            {currentModule.title}
          </h1>

          {/* Duration */}
          <p className="mt-4 text-xl text-white/60">{currentModule.duration}</p>

          {/* Notes/Instructions */}
          {currentModule.notes && (
            <p className="mt-6 max-w-2xl text-center text-lg sm:text-2xl leading-relaxed text-white/80">
              {currentModule.notes}
            </p>
          )}

          {/* Timer */}
          <div className="mt-10 w-full max-w-sm">
            <div className="[&_*]:!text-white [&_*]:!border-white/20 [&_*]:!bg-transparent">
              <WorkshopTimer timerState={session.timer_state} showControls={false} large />
            </div>
          </div>
        </>
      ) : (
        <h1 className="text-xl sm:text-3xl font-bold">No modules in this session</h1>
      )}

      {/* Keyboard hint */}
      <p className="absolute bottom-4 right-4 text-xs text-white/20">
        F = fullscreen &middot; ESC = exit
      </p>
    </div>
  )
}
