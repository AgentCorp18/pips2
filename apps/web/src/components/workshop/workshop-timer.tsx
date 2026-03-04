'use client'

import { useState } from 'react'
import { Play, Pause, RotateCcw, Timer, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkshopTimer, formatTime } from '@/hooks/use-workshop-realtime'
import type { TimerState } from '@/app/(app)/knowledge/workshop/actions'

type WorkshopTimerProps = {
  timerState: TimerState
  /** true = show controls (facilitator), false = display only (participant) */
  showControls?: boolean
  /** Large display for presentation mode */
  large?: boolean
  onStartCountdown?: (seconds: number) => void
  onStartCountup?: () => void
  onPause?: () => void
  onResume?: () => void
  onReset?: () => void
}

const PRESET_DURATIONS = [
  { label: '5m', seconds: 5 * 60 },
  { label: '10m', seconds: 10 * 60 },
  { label: '15m', seconds: 15 * 60 },
  { label: '20m', seconds: 20 * 60 },
  { label: '30m', seconds: 30 * 60 },
]

export const WorkshopTimer = ({
  timerState,
  showControls = false,
  large = false,
  onStartCountdown,
  onStartCountup,
  onPause,
  onResume,
  onReset,
}: WorkshopTimerProps) => {
  const displaySeconds = useWorkshopTimer(timerState)
  const [customMinutes, setCustomMinutes] = useState('')

  const isRunning = timerState.running === true
  const isCountdown = timerState.mode === 'countdown'
  const isExpired = isCountdown && displaySeconds === 0 && isRunning

  const timeDisplay = formatTime(displaySeconds)

  return (
    <div className="space-y-3">
      {/* Timer Display */}
      <div
        className={`flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] ${
          large ? 'py-8' : 'py-4'
        } ${isExpired ? 'animate-pulse border-red-400 bg-red-50 dark:bg-red-950/20' : ''}`}
      >
        <div className="flex items-center gap-3">
          {isCountdown ? (
            <Timer size={large ? 28 : 18} className="text-[var(--color-text-tertiary)]" />
          ) : (
            <Clock size={large ? 28 : 18} className="text-[var(--color-text-tertiary)]" />
          )}
          <span
            className={`font-mono font-bold tabular-nums text-[var(--color-text-primary)] ${
              large ? 'text-6xl' : 'text-3xl'
            } ${isExpired ? 'text-red-600 dark:text-red-400' : ''}`}
          >
            {timeDisplay}
          </span>
        </div>
      </div>

      {isExpired && (
        <p className="text-center text-sm font-medium text-red-600 dark:text-red-400">
          Time&apos;s up!
        </p>
      )}

      {/* Controls (facilitator only) */}
      {showControls && (
        <div className="space-y-2">
          {/* Play/Pause/Reset */}
          <div className="flex items-center justify-center gap-2">
            {isRunning ? (
              <Button variant="outline" size="sm" onClick={onPause}>
                <Pause size={14} />
                Pause
              </Button>
            ) : timerState.mode ? (
              <Button variant="default" size="sm" onClick={onResume}>
                <Play size={14} />
                Resume
              </Button>
            ) : null}
            {timerState.mode && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                <RotateCcw size={14} />
                Reset
              </Button>
            )}
          </div>

          {/* Timer mode selection (when no timer is active) */}
          {!timerState.mode && (
            <div className="space-y-2">
              <p className="text-center text-xs text-[var(--color-text-tertiary)]">
                Start a countdown timer
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {PRESET_DURATIONS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="xs"
                    onClick={() => onStartCountdown?.(preset.seconds)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={180}
                  placeholder="Min"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="w-16 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text-primary)]"
                />
                <Button
                  variant="outline"
                  size="xs"
                  disabled={!customMinutes || Number(customMinutes) < 1}
                  onClick={() => {
                    onStartCountdown?.(Number(customMinutes) * 60)
                    setCustomMinutes('')
                  }}
                >
                  Start
                </Button>
              </div>
              <div className="flex justify-center">
                <Button variant="ghost" size="xs" onClick={onStartCountup}>
                  <Clock size={12} />
                  Start Stopwatch
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
