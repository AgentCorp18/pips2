import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeaturesSection } from '../features-section'

describe('FeaturesSection', () => {
  it('renders section heading', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Everything You Need to Improve')).toBeTruthy()
  })

  it('renders heading as h2', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Everything You Need to Improve').tagName).toBe('H2')
  })

  it('renders overline text', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Built for Teams')).toBeTruthy()
  })

  it('renders Interactive Forms card', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Interactive Forms')).toBeTruthy()
  })

  it('renders Knowledge Hub card', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Knowledge Hub')).toBeTruthy()
  })

  it('renders Team Collaboration card', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Team Collaboration')).toBeTruthy()
  })

  it('renders Training Mode card', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Training Mode')).toBeTruthy()
  })

  it('renders Real-time Workshop card', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Real-time Workshop')).toBeTruthy()
  })

  it('renders Reporting & Insights card', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Reporting & Insights')).toBeTruthy()
  })

  it('renders 6 feature cards as h3', () => {
    render(<FeaturesSection />)
    const cards = [
      'Interactive Forms',
      'Knowledge Hub',
      'Team Collaboration',
      'Training Mode',
      'Real-time Workshop',
      'Reporting & Insights',
    ]
    cards.forEach((title) => {
      expect(screen.getByText(title).tagName).toBe('H3')
    })
  })

  it('renders section with features id', () => {
    const { container } = render(<FeaturesSection />)
    expect(container.querySelector('section#features')).toBeTruthy()
  })
})
