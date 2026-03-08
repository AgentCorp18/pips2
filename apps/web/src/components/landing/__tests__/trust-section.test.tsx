import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrustSection } from '../trust-section'

describe('TrustSection', () => {
  it('renders section heading', () => {
    render(<TrustSection />)
    expect(screen.getByText('Grounded in Real-World Practice')).toBeTruthy()
  })

  it('renders heading as h2', () => {
    render(<TrustSection />)
    expect(screen.getByText('Grounded in Real-World Practice').tagName).toBe('H2')
  })

  it('renders overline text', () => {
    render(<TrustSection />)
    expect(screen.getByText('Built on Proven Methodology')).toBeTruthy()
  })

  it('renders 205+ resources stat', () => {
    render(<TrustSection />)
    expect(screen.getByText('205+')).toBeTruthy()
    expect(screen.getByText('Learning Resources')).toBeTruthy()
  })

  it('renders 18 tools stat', () => {
    render(<TrustSection />)
    expect(screen.getByText('18')).toBeTruthy()
    expect(screen.getByText('Interactive Tools')).toBeTruthy()
  })

  it('renders 4 training paths stat', () => {
    render(<TrustSection />)
    expect(screen.getByText('4')).toBeTruthy()
    expect(screen.getByText('Training Paths')).toBeTruthy()
  })

  it('renders 1 proven methodology stat', () => {
    render(<TrustSection />)
    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('Proven Methodology')).toBeTruthy()
  })

  it('renders section element', () => {
    const { container } = render(<TrustSection />)
    expect(container.querySelector('section')).toBeTruthy()
  })
})
