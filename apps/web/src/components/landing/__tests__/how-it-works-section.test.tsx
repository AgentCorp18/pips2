import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HowItWorksSection } from '../how-it-works-section'

describe('HowItWorksSection', () => {
  it('renders section heading', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText('How It Works')).toBeTruthy()
  })

  it('renders heading as h2', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText('How It Works').tagName).toBe('H2')
  })

  it('renders overline text', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText('Quick Start')).toBeTruthy()
  })

  it('renders description', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText(/Get up and running in minutes/)).toBeTruthy()
  })

  it('renders Create a Project step', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText('Create a Project')).toBeTruthy()
  })

  it('renders Follow the Steps step', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText('Follow the Steps')).toBeTruthy()
  })

  it('renders Measure Results step', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText('Measure Results')).toBeTruthy()
  })

  it('renders step numbers 01, 02, 03', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText('01')).toBeTruthy()
    expect(screen.getByText('02')).toBeTruthy()
    expect(screen.getByText('03')).toBeTruthy()
  })

  it('renders 3 step titles as h3', () => {
    render(<HowItWorksSection />)
    const titles = ['Create a Project', 'Follow the Steps', 'Measure Results']
    titles.forEach((title) => {
      expect(screen.getByText(title).tagName).toBe('H3')
    })
  })

  it('renders section with how-it-works id', () => {
    const { container } = render(<HowItWorksSection />)
    expect(container.querySelector('section#how-it-works')).toBeTruthy()
  })
})
