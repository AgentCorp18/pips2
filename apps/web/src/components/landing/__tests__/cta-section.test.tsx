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
    expect(screen.getByText('Ready to improve how your team improves?')).toBeTruthy()
  })

  it('renders heading as h2', () => {
    render(<CtaSection />)
    expect(screen.getByText('Ready to improve how your team improves?').tagName).toBe('H2')
  })

  it('renders description', () => {
    render(<CtaSection />)
    expect(screen.getByText(/Start free — no credit card required/)).toBeTruthy()
  })

  it('renders Start Free CTA', () => {
    render(<CtaSection />)
    expect(screen.getByText('Start Free')).toBeTruthy()
  })

  it('links CTA to /signup', () => {
    render(<CtaSection />)
    expect(screen.getByText('Start Free').closest('a')?.getAttribute('href')).toBe('/signup')
  })

  it('renders section element', () => {
    const { container } = render(<CtaSection />)
    expect(container.querySelector('section')).toBeTruthy()
  })
})
