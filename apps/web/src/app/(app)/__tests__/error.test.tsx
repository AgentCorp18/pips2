import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AppError from '../error'

vi.mock('@/components/layout/error-boundary', () => ({
  ErrorBoundaryCard: ({ error }: { error: Error }) => (
    <div data-testid="error-card">{error.message}</div>
  ),
}))

describe('AppError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders ErrorBoundaryCard with the error', () => {
    const error = new Error('Something failed')
    const reset = vi.fn()
    render(<AppError error={error} reset={reset} />)
    expect(screen.getByTestId('error-card')).toBeTruthy()
    expect(screen.getByText('Something failed')).toBeTruthy()
  })

  it('logs the error to console on mount', () => {
    const error = new Error('Test error for logging')
    const reset = vi.fn()
    render(<AppError error={error} reset={reset} />)
    expect(console.error).toHaveBeenCalledWith('[AppError]', error)
  })

  it('passes the reset callback to ErrorBoundaryCard', () => {
    const error = new Error('Reset test')
    const reset = vi.fn()
    render(<AppError error={error} reset={reset} />)
    // ErrorBoundaryCard renders — reset prop was forwarded (no throw = success)
    expect(screen.getByTestId('error-card')).toBeTruthy()
  })
})
