import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingFooter } from '../landing-footer'

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

describe('LandingFooter', () => {
  it('renders PIPS logo text', () => {
    render(<LandingFooter />)
    expect(screen.getByText('PIPS')).toBeTruthy()
  })

  it('renders brand description', () => {
    render(<LandingFooter />)
    expect(screen.getByText(/6-step process improvement methodology/)).toBeTruthy()
  })

  it('renders Product section heading', () => {
    render(<LandingFooter />)
    expect(screen.getByText('Product')).toBeTruthy()
  })

  it('renders Account section heading', () => {
    render(<LandingFooter />)
    expect(screen.getByText('Account')).toBeTruthy()
  })

  it('renders Legal section heading', () => {
    render(<LandingFooter />)
    expect(screen.getByText('Legal')).toBeTruthy()
  })

  it('renders Sign Up link pointing to /signup', () => {
    render(<LandingFooter />)
    expect(screen.getByText('Sign Up').closest('a')?.getAttribute('href')).toBe('/signup')
  })

  it('renders Privacy Policy link', () => {
    render(<LandingFooter />)
    expect(screen.getByText('Privacy Policy').closest('a')?.getAttribute('href')).toBe('/privacy')
  })

  it('renders Terms of Service link', () => {
    render(<LandingFooter />)
    expect(screen.getByText('Terms of Service').closest('a')?.getAttribute('href')).toBe('/terms')
  })

  it('renders copyright text', () => {
    render(<LandingFooter />)
    expect(screen.getByText(/All rights reserved/)).toBeTruthy()
  })

  it('renders footer element', () => {
    const { container } = render(<LandingFooter />)
    expect(container.querySelector('footer')).toBeTruthy()
  })
})
