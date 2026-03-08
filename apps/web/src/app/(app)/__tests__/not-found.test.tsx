import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AppNotFound from '../not-found'

describe('AppNotFound', () => {
  it('renders page not found heading', () => {
    render(<AppNotFound />)
    expect(screen.getByText('Page not found')).toBeTruthy()
  })

  it('renders Go to Dashboard link', () => {
    render(<AppNotFound />)
    expect(screen.getByText('Go to Dashboard')).toBeTruthy()
  })
})
