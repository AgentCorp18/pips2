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

  it('renders Guided Methodology card', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Guided Methodology')).toBeTruthy()
  })

  it('renders Integrated Ticketing card', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Integrated Ticketing')).toBeTruthy()
  })

  it('renders Team Collaboration card', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Team Collaboration')).toBeTruthy()
  })

  it('renders Data-Driven Decisions card', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Data-Driven Decisions')).toBeTruthy()
  })

  it('renders 4 feature cards', () => {
    render(<FeaturesSection />)
    const cards = [
      'Guided Methodology',
      'Integrated Ticketing',
      'Team Collaboration',
      'Data-Driven Decisions',
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
