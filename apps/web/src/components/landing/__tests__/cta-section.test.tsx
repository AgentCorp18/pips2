import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CtaSection } from '../cta-section'

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

describe('CtaSection', () => {
  it('renders heading', () => {
    render(<CtaSection />)
    expect(screen.getByText('Ready to Improve Your Processes?')).toBeTruthy()
  })

  it('renders heading as h2', () => {
    render(<CtaSection />)
    expect(screen.getByText('Ready to Improve Your Processes?').tagName).toBe('H2')
  })

  it('renders description', () => {
    render(<CtaSection />)
    expect(screen.getByText(/Join teams using PIPS/)).toBeTruthy()
  })

  it('renders Get Started Free CTA', () => {
    render(<CtaSection />)
    expect(screen.getByText('Get Started Free')).toBeTruthy()
  })

  it('links CTA to /signup', () => {
    render(<CtaSection />)
    expect(screen.getByText('Get Started Free').closest('a')?.getAttribute('href')).toBe('/signup')
  })

  it('renders section element', () => {
    const { container } = render(<CtaSection />)
    expect(container.querySelector('section')).toBeTruthy()
  })
})
