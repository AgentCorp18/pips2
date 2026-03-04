'use client'

import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { WorkshopTimer } from './workshop-timer'
import { WorkshopModuleNavigator } from './workshop-module-navigator'
import { useWorkshopRealtime } from '@/hooks/use-workshop-realtime'
import type { WorkshopSession } from '@/app/(app)/knowledge/workshop/actions'

type ParticipantViewProps = {
  initialSession: WorkshopSession
}

export const WorkshopParticipantView = ({ initialSession }: ParticipantViewProps) => {
  const { session, isConnected } = useWorkshopRealtime(initialSession.id, initialSession)

  if (!session) return null

  const isLive = session.status === 'active' || session.status === 'paused'
  const isCompleted = session.status === 'completed'
  const isDraft = session.status === 'draft'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{session.title}</h1>
        <div className="mt-1 flex items-center gap-2">
          {isConnected && (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Connected
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
            <Users size={12} />
            {session.participant_count} participants
          </span>
        </div>
      </div>

      {isDraft && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
          <Badge variant="outline">Waiting to Start</Badge>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            The facilitator hasn&apos;t started this session yet. Stay on this page — it will update
            automatically when the session begins.
          </p>
        </div>
      )}

      {isLive && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Left: Current module & agenda */}
          <div>
            <WorkshopModuleNavigator
              modules={session.modules}
              currentIndex={session.current_module_index}
              showControls={false}
            />
          </div>

          {/* Right: Timer (read-only) */}
          <div>
            <WorkshopTimer timerState={session.timer_state} showControls={false} />
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            This session has ended. Thank you for participating!
          </p>
        </div>
      )}
    </div>
  )
}
