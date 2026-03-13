import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BookLandingPage } from '../page'

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

describe('BookLandingPage', () => {
  it('renders page heading', () => {
    render(<BookLandingPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    expect(screen.getByText('The Never-Ending Quest')).toBeTruthy()
  })

  it('renders Table of Contents section', () => {
    render(<BookLandingPage />)
    expect(screen.getByText('Table of Contents')).toBeTruthy()
  })

  it('all chapter links navigate to /book/[chapterSlug] — never to /pricing or /', () => {
    render(<BookLandingPage />)
    const chapterLinks = screen.getAllByTestId(/^chapter-link-/)
    expect(chapterLinks.length).toBeGreaterThan(0)

    for (const link of chapterLinks) {
      const href = link.getAttribute('href') ?? ''
      expect(href).toMatch(/^\/book\/[a-z0-9-]+$/)
      expect(href).not.toBe('/pricing')
      expect(href).not.toBe('/')
      expect(href).not.toBe('/signup')
    }
  })

  it('free chapters (foreword, introduction, ch01) have correct href', () => {
    render(<BookLandingPage />)
    expect(screen.getByTestId('chapter-link-foreword').getAttribute('href')).toBe('/book/foreword')
    expect(screen.getByTestId('chapter-link-introduction').getAttribute('href')).toBe(
      '/book/introduction',
    )
    expect(screen.getByTestId('chapter-link-ch01').getAttribute('href')).toBe('/book/ch01')
  })

  it('email-gated chapters (ch02–ch04) link to chapter pages, not to landing page', () => {
    render(<BookLandingPage />)
    expect(screen.getByTestId('chapter-link-ch02').getAttribute('href')).toBe('/book/ch02')
    expect(screen.getByTestId('chapter-link-ch03').getAttribute('href')).toBe('/book/ch03')
    expect(screen.getByTestId('chapter-link-ch04').getAttribute('href')).toBe('/book/ch04')
  })

  it('locked chapters (ch05+) link to chapter pages, not to /pricing', () => {
    render(<BookLandingPage />)
    expect(screen.getByTestId('chapter-link-ch05').getAttribute('href')).toBe('/book/ch05')
    expect(screen.getByTestId('chapter-link-ch06').getAttribute('href')).toBe('/book/ch06')
    expect(screen.getByTestId('chapter-link-ch15').getAttribute('href')).toBe('/book/ch15')
  })

  it('renders Free badge for free chapters', () => {
    render(<BookLandingPage />)
    const freeBadges = screen.getAllByText('Free')
    expect(freeBadges.length).toBeGreaterThanOrEqual(3)
  })

  it('renders Free with signup badge for email-gated chapters', () => {
    render(<BookLandingPage />)
    const gatedBadges = screen.getAllByText('Free with signup')
    expect(gatedBadges.length).toBe(3) // ch02, ch03, ch04
  })

  it('renders Sign Up Free CTA linking to /signup', () => {
    render(<BookLandingPage />)
    expect(screen.getByText('Sign Up Free').closest('a')?.getAttribute('href')).toBe('/signup')
  })

  it('renders Get full access section', () => {
    render(<BookLandingPage />)
    expect(screen.getByText('Get full access to all chapters')).toBeTruthy()
  })
})
