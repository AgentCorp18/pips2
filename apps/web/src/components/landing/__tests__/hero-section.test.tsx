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
    expect(screen.getByText('Transform How Your Team Solves Problems')).toBeTruthy()
  })

  it('renders headline as h1', () => {
    render(<HeroSection />)
    expect(screen.getByText('Transform How Your Team Solves Problems').tagName).toBe('H1')
  })

  it('renders overline text', () => {
    render(<HeroSection />)
    expect(screen.getByText('6-Step Process Improvement Methodology')).toBeTruthy()
  })

  it('renders subtitle', () => {
    render(<HeroSection />)
    expect(screen.getByText(/embeds a proven methodology/)).toBeTruthy()
  })

  it('renders Start Free CTA linking to /signup', () => {
    render(<HeroSection />)
    expect(screen.getByText('Start Free').closest('a')?.getAttribute('href')).toBe('/signup')
  })

  it('renders See the Methodology link to /methodology', () => {
    render(<HeroSection />)
    expect(screen.getByText('See the Methodology').closest('a')?.getAttribute('href')).toBe(
      '/methodology',
    )
  })

  it('renders 6 step numbers in stepper', () => {
    render(<HeroSection />)
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(String(i))).toBeTruthy()
    }
  })

  it('renders section element', () => {
    const { container } = render(<HeroSection />)
    expect(container.querySelector('section')).toBeTruthy()
  })
})
