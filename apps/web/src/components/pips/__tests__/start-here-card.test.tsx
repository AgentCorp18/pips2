import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StartHereCard } from '../start-here-card'

describe('StartHereCard', () => {
  it('renders the start here heading', () => {
    render(<StartHereCard projectId="proj-1" />)
    expect(screen.getByText(/Start here: Define your problem/)).toBeTruthy()
  })

  it('renders the begin step 1 link', () => {
    render(<StartHereCard projectId="proj-1" />)
    const link = screen.getByTestId('start-here-link')
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toBe('/projects/proj-1/steps/1/forms/problem_statement')
  })

  it('has the correct test id', () => {
    render(<StartHereCard projectId="proj-1" />)
    expect(screen.getByTestId('start-here-card')).toBeTruthy()
  })
})
