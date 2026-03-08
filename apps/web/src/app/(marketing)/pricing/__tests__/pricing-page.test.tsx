import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PricingPage } from '../page'

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

describe('PricingPage', () => {
  it('renders page heading', () => {
    render(<PricingPage />)
    expect(screen.getByText('Simple, Transparent Pricing')).toBeTruthy()
  })

  it('renders heading as h1', () => {
    render(<PricingPage />)
    expect(screen.getByText('Simple, Transparent Pricing').tagName).toBe('H1')
  })

  it('renders Free tier', () => {
    render(<PricingPage />)
    expect(screen.getByText('Free')).toBeTruthy()
    expect(screen.getByText('$0')).toBeTruthy()
  })

  it('renders Professional tier', () => {
    render(<PricingPage />)
    expect(screen.getByText('Professional')).toBeTruthy()
    expect(screen.getByText('$25')).toBeTruthy()
  })

  it('renders Enterprise tier', () => {
    render(<PricingPage />)
    expect(screen.getByText('Enterprise')).toBeTruthy()
    expect(screen.getByText('Custom')).toBeTruthy()
  })

  it('renders Coming Soon badge on Professional tier', () => {
    render(<PricingPage />)
    const comingSoonElements = screen.getAllByText('Coming Soon')
    expect(comingSoonElements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Free tier features', () => {
    render(<PricingPage />)
    expect(screen.getByText('1 project')).toBeTruthy()
    expect(screen.getByText('3 team members')).toBeTruthy()
    expect(screen.getByText('Core 6-step workflow')).toBeTruthy()
    expect(screen.getByText('Knowledge Hub access')).toBeTruthy()
    expect(screen.getByText('18 interactive tools')).toBeTruthy()
  })

  it('renders Professional tier features', () => {
    render(<PricingPage />)
    expect(screen.getByText('Unlimited projects')).toBeTruthy()
    expect(screen.getByText('Unlimited team members')).toBeTruthy()
    expect(screen.getByText('Training mode')).toBeTruthy()
    expect(screen.getByText('Workshop facilitation')).toBeTruthy()
    expect(screen.getByText('Reporting dashboard')).toBeTruthy()
  })

  it('renders Enterprise tier features', () => {
    render(<PricingPage />)
    expect(screen.getByText('Everything in Professional')).toBeTruthy()
    expect(screen.getByText('Custom branding')).toBeTruthy()
    expect(screen.getByText('SSO / SAML (coming soon)')).toBeTruthy()
    expect(screen.getByText('API access')).toBeTruthy()
  })

  it('renders Start Free CTA linking to /signup', () => {
    render(<PricingPage />)
    const startFreeLinks = screen.getAllByText('Start Free')
    expect(startFreeLinks.length).toBeGreaterThanOrEqual(2)
    expect(startFreeLinks[0]!.closest('a')?.getAttribute('href')).toBe('/signup')
  })

  it('renders Contact Us CTA for Enterprise', () => {
    render(<PricingPage />)
    expect(screen.getByText('Contact Us')).toBeTruthy()
    expect(screen.getByText('Contact Us').closest('a')?.getAttribute('href')).toBe(
      'mailto:hello@pips-app.com',
    )
  })

  it('renders disabled Coming Soon button for Professional', () => {
    render(<PricingPage />)
    const comingSoonBtn = screen.getByRole('button', { name: 'Coming Soon' })
    expect(comingSoonBtn).toBeTruthy()
    expect(comingSoonBtn.hasAttribute('disabled')).toBe(true)
  })

  it('renders main element', () => {
    const { container } = render(<PricingPage />)
    expect(container.querySelector('main')).toBeTruthy()
  })
})
