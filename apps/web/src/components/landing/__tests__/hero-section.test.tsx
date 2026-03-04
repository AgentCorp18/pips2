import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSection } from '../hero-section'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: { children: React.ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

describe('HeroSection', () => {
  it('renders headline', () => {
    render(<HeroSection />)
    expect(screen.getByText('Process Improvement Made Simple')).toBeTruthy()
  })

  it('renders headline as h1', () => {
    render(<HeroSection />)
    expect(screen.getByText('Process Improvement Made Simple').tagName).toBe('H1')
  })

  it('renders overline text', () => {
    render(<HeroSection />)
    expect(screen.getByText('6-Step Process Improvement Methodology')).toBeTruthy()
  })

  it('renders subtitle', () => {
    render(<HeroSection />)
    expect(screen.getByText(/PIPS guides your team through six proven steps/)).toBeTruthy()
  })

  it('renders Get Started Free CTA', () => {
    render(<HeroSection />)
    expect(screen.getByText('Get Started Free')).toBeTruthy()
  })

  it('links Get Started Free to /signup', () => {
    render(<HeroSection />)
    expect(screen.getByText('Get Started Free').closest('a')?.getAttribute('href')).toBe('/signup')
  })

  it('renders See How It Works link', () => {
    render(<HeroSection />)
    expect(screen.getByText('See How It Works')).toBeTruthy()
  })

  it('links See How It Works to #methodology', () => {
    render(<HeroSection />)
    expect(screen.getByText('See How It Works').closest('a')?.getAttribute('href')).toBe(
      '#methodology',
    )
  })

  it('renders section element', () => {
    const { container } = render(<HeroSection />)
    expect(container.querySelector('section')).toBeTruthy()
  })

  it('renders 6 pip dots', () => {
    const { container } = render(<HeroSection />)
    const dots = container.querySelectorAll('span.rounded-full')
    expect(dots.length).toBeGreaterThanOrEqual(6)
  })
})
