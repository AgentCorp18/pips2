import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUnsavedChanges } from '../use-unsaved-changes'

/* ============================================================
   Mocks
   ============================================================ */

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}))

/* ============================================================
   Helpers
   ============================================================ */

const renderClean = () => renderHook(() => useUnsavedChanges({ isDirty: false }))
const renderDirty = (onConfirmDiscard?: () => void) =>
  renderHook(() => useUnsavedChanges({ isDirty: true, onConfirmDiscard }))

/* ============================================================
   Tests
   ============================================================ */

describe('useUnsavedChanges', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Ensure event listeners are cleaned up between tests
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('starts with showDialog false', () => {
      const { result } = renderClean()
      expect(result.current.showDialog).toBe(false)
    })

    it('exposes confirmDiscard, cancelDiscard and guardNavigation', () => {
      const { result } = renderClean()
      expect(typeof result.current.confirmDiscard).toBe('function')
      expect(typeof result.current.cancelDiscard).toBe('function')
      expect(typeof result.current.guardNavigation).toBe('function')
    })
  })

  describe('guardNavigation', () => {
    it('runs action immediately when form is clean', () => {
      const action = vi.fn()
      const { result } = renderClean()
      act(() => {
        result.current.guardNavigation(action)
      })
      expect(action).toHaveBeenCalledOnce()
      expect(result.current.showDialog).toBe(false)
    })

    it('opens dialog and does NOT run action when form is dirty', () => {
      const action = vi.fn()
      const { result } = renderDirty()
      act(() => {
        result.current.guardNavigation(action)
      })
      expect(action).not.toHaveBeenCalled()
      expect(result.current.showDialog).toBe(true)
    })
  })

  describe('confirmDiscard', () => {
    it('closes dialog and runs the pending navigation action', () => {
      const action = vi.fn()
      const { result } = renderDirty()

      // Open the dialog via guardNavigation
      act(() => {
        result.current.guardNavigation(action)
      })
      expect(result.current.showDialog).toBe(true)

      // Confirm discard
      act(() => {
        result.current.confirmDiscard()
      })
      expect(result.current.showDialog).toBe(false)
      expect(action).toHaveBeenCalledOnce()
    })

    it('calls onConfirmDiscard callback when provided', () => {
      const onConfirmDiscard = vi.fn()
      const action = vi.fn()
      const { result } = renderDirty(onConfirmDiscard)

      act(() => {
        result.current.guardNavigation(action)
      })
      act(() => {
        result.current.confirmDiscard()
      })
      expect(onConfirmDiscard).toHaveBeenCalledOnce()
    })

    it('does not call onConfirmDiscard when it is not provided', () => {
      const action = vi.fn()
      const { result } = renderDirty()

      act(() => {
        result.current.guardNavigation(action)
      })
      // Should not throw when no callback provided
      expect(() => {
        act(() => {
          result.current.confirmDiscard()
        })
      }).not.toThrow()
    })
  })

  describe('cancelDiscard', () => {
    it('closes dialog without running the pending action', () => {
      const action = vi.fn()
      const { result } = renderDirty()

      act(() => {
        result.current.guardNavigation(action)
      })
      expect(result.current.showDialog).toBe(true)

      act(() => {
        result.current.cancelDiscard()
      })
      expect(result.current.showDialog).toBe(false)
      expect(action).not.toHaveBeenCalled()
    })
  })

  describe('beforeunload event', () => {
    it('calls preventDefault on BeforeUnloadEvent when dirty', () => {
      renderDirty()
      const event = new Event('beforeunload') as BeforeUnloadEvent
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      window.dispatchEvent(event)
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('does NOT call preventDefault when form is clean', () => {
      renderClean()
      const event = new Event('beforeunload') as BeforeUnloadEvent
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      window.dispatchEvent(event)
      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })

    it('removes the beforeunload listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = renderDirty()
      unmount()
      expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
    })
  })
})
