import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
    const links = screen.getAllByText('Methodology')
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders Book nav link', () => {
    render(<LandingNav />)
    const links = screen.getAllByText('Book')
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders Pricing nav link', () => {
    render(<LandingNav />)
    const links = screen.getAllByText('Pricing')
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders Sign In links pointing to /login', () => {
    render(<LandingNav />)
    const signInLinks = screen.getAllByText('Sign In')
    expect(signInLinks.length).toBeGreaterThan(0)
    signInLinks.forEach((el) => {
      expect(el.closest('a')?.getAttribute('href')).toBe('/login')
    })
  })

  it('renders Start Free links pointing to /signup', () => {
    render(<LandingNav />)
    const startFreeLinks = screen.getAllByText('Start Free')
    expect(startFreeLinks.length).toBeGreaterThan(0)
    startFreeLinks.forEach((el) => {
      expect(el.closest('a')?.getAttribute('href')).toBe('/signup')
    })
  })

  it('renders header element', () => {
    const { container } = render(<LandingNav />)
    expect(container.querySelector('header')).toBeTruthy()
  })

  it('renders nav element', () => {
    const { container } = render(<LandingNav />)
    expect(container.querySelector('nav')).toBeTruthy()
  })

  it('renders hamburger button with accessible label', () => {
    render(<LandingNav />)
    const button = screen.getByRole('button', { name: /open menu/i })
    expect(button).toBeTruthy()
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('toggles mobile menu open when hamburger is clicked', () => {
    render(<LandingNav />)
    const button = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(button)
    expect(screen.getByRole('button', { name: /close menu/i })).toBeTruthy()
  })

  it('shows close icon after hamburger is clicked', () => {
    render(<LandingNav />)
    const button = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(button)
    const closeButton = screen.getByRole('button', { name: /close menu/i })
    expect(closeButton.getAttribute('aria-expanded')).toBe('true')
  })

  it('collapses mobile menu when a mobile nav link is clicked', () => {
    const { container } = render(<LandingNav />)
    const openButton = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(openButton)
    // Click the Methodology link inside the mobile nav panel specifically
    const mobileNav = container.querySelector('#mobile-nav')
    const mobileMethodologyLink = mobileNav?.querySelector('a[href="/methodology"]')
    expect(mobileMethodologyLink).toBeTruthy()
    fireEvent.click(mobileMethodologyLink!)
    expect(screen.getByRole('button', { name: /open menu/i })).toBeTruthy()
  })

  it('mobile nav panel has correct aria id', () => {
    const { container } = render(<LandingNav />)
    expect(container.querySelector('#mobile-nav')).toBeTruthy()
  })
})
