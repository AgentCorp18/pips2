import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from '../not-found'

vi.mock('@pips/shared', () => ({
  PIPS_STEPS: [
    { number: 1, color: '#3B82F6', name: 'Identify' },
    { number: 2, color: '#F59E0B', name: 'Analyze' },
  ],
}))

describe('NotFound (root)', () => {
  it('renders the page not found heading', () => {
    render(<NotFound />)
    expect(screen.getByText('Page not found')).toBeTruthy()
  })

  it('renders a Go to Dashboard link', () => {
    render(<NotFound />)
    expect(screen.getByText('Go to Dashboard')).toBeTruthy()
  })

  it('renders the descriptive sub-text', () => {
    render(<NotFound />)
    expect(screen.getByText(/doesn't exist or has been moved/i)).toBeTruthy()
  })
})
