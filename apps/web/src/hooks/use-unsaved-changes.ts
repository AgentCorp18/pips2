'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type UseUnsavedChangesOptions = {
  /** Whether the form currently has unsaved changes */
  isDirty: boolean
  /**
   * Called when the user confirms they want to discard changes and
   * navigate away. The caller is responsible for the actual navigation.
   */
  onConfirmDiscard?: () => void
}

export type UseUnsavedChangesReturn = {
  /** Whether the confirmation dialog should be open */
  showDialog: boolean
  /** Call this to programmatically confirm the discard and proceed */
  confirmDiscard: () => void
  /** Call this to dismiss the dialog and keep editing */
  cancelDiscard: () => void
  /**
   * Wrap a navigation action (e.g. `router.push(href)`) with this guard.
   * If the form is dirty the dialog will open instead of navigating.
   * If the form is clean the action runs immediately.
   */
  guardNavigation: (action: () => void) => void
}

/**
 * Intercepts navigation when a form has unsaved changes.
 *
 * - Attaches a `beforeunload` listener so the browser warns on tab/window close.
 * - Exposes `guardNavigation` so client-side link clicks can also be intercepted.
 * - Returns dialog state (`showDialog`, `confirmDiscard`, `cancelDiscard`) for
 *   use with `UnsavedChangesDialog`.
 */
export const useUnsavedChanges = ({
  isDirty,
  onConfirmDiscard,
}: UseUnsavedChangesOptions): UseUnsavedChangesReturn => {
  const [showDialog, setShowDialog] = useState(false)
  /** Stores the navigation action to run after the user confirms. */
  const pendingActionRef = useRef<(() => void) | null>(null)
  /** Sync ref so the beforeunload handler always reads the latest value
   *  without waiting for a React re-render cycle. */
  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  /* ── browser tab / window close ─────────────────────────────────── */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  /* ── client-side navigation guard ───────────────────────────────── */
  const guardNavigation = useCallback(
    (action: () => void) => {
      if (!isDirty) {
        action()
        return
      }
      pendingActionRef.current = action
      setShowDialog(true)
    },
    [isDirty],
  )

  /* ── dialog actions ──────────────────────────────────────────────── */
  const confirmDiscard = useCallback(() => {
    setShowDialog(false)
    onConfirmDiscard?.()
    const pending = pendingActionRef.current
    pendingActionRef.current = null
    pending?.()
  }, [onConfirmDiscard])

  const cancelDiscard = useCallback(() => {
    pendingActionRef.current = null
    setShowDialog(false)
  }, [])

  return { showDialog, confirmDiscard, cancelDiscard, guardNavigation }
}
