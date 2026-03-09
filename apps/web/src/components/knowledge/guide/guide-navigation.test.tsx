import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GuideNavigation } from './guide-navigation'

describe('GuideNavigation', () => {
  it('renders without crashing', () => {
    render(<GuideNavigation currentStep={3} />)
    expect(screen.getByTestId('guide-navigation')).toBeInTheDocument()
  })

  it('renders prev and next links for a middle step', () => {
    render(<GuideNavigation currentStep={3} />)
    expect(screen.getByTestId('guide-nav-prev')).toBeInTheDocument()
    expect(screen.getByTestId('guide-nav-next')).toBeInTheDocument()
  })

  it('shows previous step name', () => {
    render(<GuideNavigation currentStep={3} />)
    const prev = screen.getByTestId('guide-nav-prev')
    expect(prev.textContent).toContain('Analyze')
  })

  it('shows next step name', () => {
    render(<GuideNavigation currentStep={3} />)
    const next = screen.getByTestId('guide-nav-next')
    expect(next.textContent).toContain('Select')
  })

  it('has no previous link on step 1', () => {
    render(<GuideNavigation currentStep={1} />)
    const prev = screen.getByTestId('guide-nav-prev')
    expect(prev.tagName).not.toBe('A')
  })

  it('shows start over on step 6', () => {
    render(<GuideNavigation currentStep={6} />)
    const next = screen.getByTestId('guide-nav-next')
    expect(next.textContent).toContain('Start Over')
  })

  it('links to correct step URLs', () => {
    render(<GuideNavigation currentStep={3} />)
    const prev = screen.getByTestId('guide-nav-prev')
    const next = screen.getByTestId('guide-nav-next')
    expect(prev.getAttribute('href')).toBe('/knowledge/guide/step/2')
    expect(next.getAttribute('href')).toBe('/knowledge/guide/step/4')
  })

  it('renders quick links', () => {
    render(<GuideNavigation currentStep={1} />)
    expect(screen.getByText('Tools Library')).toBeInTheDocument()
    expect(screen.getByText('Roles')).toBeInTheDocument()
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Glossary')).toBeInTheDocument()
  })

  it('renders the pips cycle diagram', () => {
    render(<GuideNavigation currentStep={2} />)
    expect(screen.getByTestId('pips-cycle-diagram')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<GuideNavigation currentStep={1} className="my-nav" />)
    expect(screen.getByTestId('guide-navigation')).toHaveClass('my-nav')
  })
})
