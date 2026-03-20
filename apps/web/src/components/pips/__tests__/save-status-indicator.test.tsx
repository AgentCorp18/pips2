import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SaveStatusIndicator } from '../save-status-indicator'

/* ============================================================
   Mocks
   ============================================================ */

// useRelativeTime depends on Date.now() and setInterval — use fake timers
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

/* ============================================================
   Tests — SaveStatusIndicator
   ============================================================ */

describe('SaveStatusIndicator', () => {
  describe('idle state', () => {
    it('renders nothing in idle state', () => {
      const { container } = render(<SaveStatusIndicator state="idle" lastSavedAt={null} />)
      expect(container.firstChild).toBeNull()
    })

    it('does not render save-status-indicator testid in idle state', () => {
      render(<SaveStatusIndicator state="idle" lastSavedAt={null} />)
      expect(screen.queryByTestId('save-status-indicator')).not.toBeInTheDocument()
    })
  })

  describe('saving state', () => {
    it('renders the saving indicator', () => {
      render(<SaveStatusIndicator state="saving" lastSavedAt={null} />)
      expect(screen.getByTestId('save-status-indicator')).toBeInTheDocument()
    })

    it('displays "Saving..." text', () => {
      render(<SaveStatusIndicator state="saving" lastSavedAt={null} />)
      expect(screen.getByTestId('save-indicator-saving')).toHaveTextContent('Saving...')
    })

    it('does not show retry button while saving', () => {
      const onRetry = vi.fn()
      render(<SaveStatusIndicator state="saving" lastSavedAt={null} onRetry={onRetry} />)
      expect(screen.queryByTestId('save-indicator-retry')).not.toBeInTheDocument()
    })
  })

  describe('saved state', () => {
    it('renders the saved indicator', () => {
      render(<SaveStatusIndicator state="saved" lastSavedAt={null} />)
      expect(screen.getByTestId('save-status-indicator')).toBeInTheDocument()
    })

    it('displays "Saved" text when no lastSavedAt', () => {
      render(<SaveStatusIndicator state="saved" lastSavedAt={null} />)
      expect(screen.getByTestId('save-indicator-saved')).toHaveTextContent('Saved')
    })

    it('displays "Saved · just now" when lastSavedAt is very recent', () => {
      const date = new Date()
      // 5 seconds later
      vi.setSystemTime(date.getTime() + 5000)
      render(<SaveStatusIndicator state="saved" lastSavedAt={date} />)
      expect(screen.getByTestId('save-indicator-saved')).toHaveTextContent('Saved · just now')
    })

    it('displays "Saved · N min ago" after sufficient time passes', () => {
      const date = new Date()
      vi.setSystemTime(date.getTime() + 3 * 60 * 1000)
      render(<SaveStatusIndicator state="saved" lastSavedAt={date} />)
      expect(screen.getByTestId('save-indicator-saved')).toHaveTextContent('Saved · 3 min ago')
    })

    it('does not show retry button in saved state', () => {
      render(<SaveStatusIndicator state="saved" lastSavedAt={null} />)
      expect(screen.queryByTestId('save-indicator-retry')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('renders the error indicator', () => {
      render(<SaveStatusIndicator state="error" lastSavedAt={null} />)
      expect(screen.getByTestId('save-status-indicator')).toBeInTheDocument()
    })

    it('displays "Save failed" text', () => {
      render(<SaveStatusIndicator state="error" lastSavedAt={null} />)
      expect(screen.getByTestId('save-indicator-error')).toHaveTextContent('Save failed')
    })

    it('renders Retry button when onRetry is provided', () => {
      const onRetry = vi.fn()
      render(<SaveStatusIndicator state="error" lastSavedAt={null} onRetry={onRetry} />)
      expect(screen.getByTestId('save-indicator-retry')).toBeInTheDocument()
    })

    it('calls onRetry when Retry button is clicked', () => {
      const onRetry = vi.fn()
      render(<SaveStatusIndicator state="error" lastSavedAt={null} onRetry={onRetry} />)
      fireEvent.click(screen.getByTestId('save-indicator-retry'))
      expect(onRetry).toHaveBeenCalledOnce()
    })

    it('does not render Retry button when onRetry is not provided', () => {
      render(<SaveStatusIndicator state="error" lastSavedAt={null} />)
      expect(screen.queryByTestId('save-indicator-retry')).not.toBeInTheDocument()
    })
  })
})
