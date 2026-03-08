import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProblemSolutionSection } from '../problem-solution-section'

describe('ProblemSolutionSection', () => {
  it('renders section heading', () => {
    render(<ProblemSolutionSection />)
    expect(screen.getByText('The Gap Between Intent and Impact')).toBeTruthy()
  })

  it('renders heading as h2', () => {
    render(<ProblemSolutionSection />)
    expect(screen.getByText('The Gap Between Intent and Impact').tagName).toBe('H2')
  })

  it('renders overline text', () => {
    render(<ProblemSolutionSection />)
    expect(screen.getByText('Why PIPS?')).toBeTruthy()
  })

  it('renders The Problem card', () => {
    render(<ProblemSolutionSection />)
    expect(screen.getByText('The Problem')).toBeTruthy()
  })

  it('renders The Solution card', () => {
    render(<ProblemSolutionSection />)
    expect(screen.getByText('The Solution')).toBeTruthy()
  })

  it('renders problem items', () => {
    render(<ProblemSolutionSection />)
    expect(screen.getByText(/scattered spreadsheets/)).toBeTruthy()
    expect(screen.getByText(/No consistency in methodology/)).toBeTruthy()
    expect(screen.getByText(/Institutional knowledge is lost/)).toBeTruthy()
  })

  it('renders solution items', () => {
    render(<ProblemSolutionSection />)
    expect(screen.getByText(/Structured digital forms/)).toBeTruthy()
    expect(screen.getByText(/Guided workflows/)).toBeTruthy()
    expect(screen.getByText(/knowledge hub that captures/)).toBeTruthy()
  })

  it('renders section element', () => {
    const { container } = render(<ProblemSolutionSection />)
    expect(container.querySelector('section')).toBeTruthy()
  })
})
