import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingNav } from '../landing-nav'

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

describe('LandingNav', () => {
  it('renders PIPS logo text', () => {
    render(<LandingNav />)
    expect(screen.getByText('PIPS')).toBeTruthy()
  })

  it('renders Methodology nav link', () => {
    render(<LandingNav />)
    expect(screen.getByText('Methodology')).toBeTruthy()
  })

  it('renders Features nav link', () => {
    render(<LandingNav />)
    expect(screen.getByText('Features')).toBeTruthy()
  })

  it('renders How It Works nav link', () => {
    render(<LandingNav />)
    expect(screen.getByText('How It Works')).toBeTruthy()
  })

  it('renders Sign In link', () => {
    render(<LandingNav />)
    const signIn = screen.getByText('Sign In')
    expect(signIn.closest('a')?.getAttribute('href')).toBe('/login')
  })

  it('renders Get Started button', () => {
    render(<LandingNav />)
    const getStarted = screen.getByText('Get Started')
    expect(getStarted.closest('a')?.getAttribute('href')).toBe('/signup')
  })

  it('renders header element', () => {
    const { container } = render(<LandingNav />)
    expect(container.querySelector('header')).toBeTruthy()
  })

  it('renders nav element', () => {
    const { container } = render(<LandingNav />)
    expect(container.querySelector('nav')).toBeTruthy()
  })
})
