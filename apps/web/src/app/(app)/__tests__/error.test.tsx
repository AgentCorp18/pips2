import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AppError from '../error'

vi.mock('@/components/layout/error-boundary', () => ({
  ErrorBoundaryCard: ({ error }: { error: Error }) => (
    <div data-testid="error-card">{error.message}</div>
  ),
}))

describe('AppError', () => {
  it('renders ErrorBoundaryCard with the error', () => {
    const error = new Error('Something failed')
    const reset = vi.fn()
    render(<AppError error={error} reset={reset} />)
    expect(screen.getByTestId('error-card')).toBeTruthy()
    expect(screen.getByText('Something failed')).toBeTruthy()
  })
})
