import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GlobalError from '../global-error'

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}))

describe('GlobalError', () => {
  it('renders the error message', () => {
    const error = new Error('Test error')
    const reset = vi.fn()
    render(<GlobalError error={error} reset={reset} />)
    expect(screen.getByText('Something went wrong')).toBeTruthy()
  })

  it('renders a Try again button', () => {
    const error = new Error('Test error')
    const reset = vi.fn()
    render(<GlobalError error={error} reset={reset} />)
    expect(screen.getByText('Try again')).toBeTruthy()
  })

  it('calls reset when Try again is clicked', () => {
    const error = new Error('Test error')
    const reset = vi.fn()
    render(<GlobalError error={error} reset={reset} />)
    fireEvent.click(screen.getByText('Try again'))
    expect(reset).toHaveBeenCalled()
  })
})
