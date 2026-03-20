'use client'

import { AlertTriangle, Check, Loader2, RefreshCw } from 'lucide-react'
import { useRelativeTime } from '@/hooks/use-relative-time'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

type Props = {
  state: SaveState
  lastSavedAt: Date | null
  onRetry?: () => void
}

/**
 * Persistent save status indicator for PIPS forms.
 *
 * States:
 * - idle:   Nothing shown (auto-save enabled, no recent activity)
 * - saving: Spinner + "Saving..."
 * - saved:  Green check + "Saved" + relative timestamp ("2 min ago")
 * - error:  Red warning + "Save failed" + optional Retry button
 */
export const SaveStatusIndicator = ({ state, lastSavedAt, onRetry }: Props) => {
  const relativeTime = useRelativeTime(lastSavedAt)

  if (state === 'idle') return null

  if (state === 'saving') {
    return (
      <span
        data-testid="save-status-indicator"
        className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]"
      >
        <Loader2 size={12} className="animate-spin" aria-hidden="true" />
        <span data-testid="save-indicator-saving">Saving...</span>
      </span>
    )
  }

  if (state === 'saved') {
    return (
      <span
        data-testid="save-status-indicator"
        className="flex items-center gap-1.5 text-xs text-[var(--color-success)]"
      >
        <Check size={12} aria-hidden="true" />
        <span data-testid="save-indicator-saved">
          Saved{relativeTime ? ` · ${relativeTime}` : ''}
        </span>
      </span>
    )
  }

  // error state
  return (
    <span
      data-testid="save-status-indicator"
      className="flex items-center gap-1.5 text-xs text-[var(--color-destructive)]"
    >
      <AlertTriangle size={12} aria-hidden="true" />
      <span data-testid="save-indicator-error">Save failed</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          data-testid="save-indicator-retry"
          className="flex items-center gap-1 underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          aria-label="Retry save"
        >
          <RefreshCw size={10} aria-hidden="true" />
          Retry
        </button>
      )}
    </span>
  )
}
