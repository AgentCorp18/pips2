import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundaryCard } from '../error-boundary'

/* ============================================================
   Mocks
   ============================================================ */

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

/* ============================================================
   Helpers
   ============================================================ */

const makeError = (message: string, digest?: string): Error & { digest?: string } => {
  const err = new Error(message) as Error & { digest?: string }
  if (digest) err.digest = digest
  return err
}

/* ============================================================
   Tests
   ============================================================ */

describe('ErrorBoundaryCard', () => {
  it('renders the "Something went wrong" heading', () => {
    const reset = vi.fn()
    render(<ErrorBoundaryCard error={makeError('Boom')} reset={reset} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    const reset = vi.fn()
    render(<ErrorBoundaryCard error={makeError('Boom')} reset={reset} />)
    expect(
      screen.getByText(
        'An unexpected error occurred. Please try again or return to the dashboard.',
      ),
    ).toBeInTheDocument()
  })

  it('renders the "Try again" button', () => {
    const reset = vi.fn()
    render(<ErrorBoundaryCard error={makeError('Boom')} reset={reset} />)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('calls reset when "Try again" is clicked', () => {
    const reset = vi.fn()
    render(<ErrorBoundaryCard error={makeError('Boom')} reset={reset} />)
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(reset).toHaveBeenCalledTimes(1)
  })

  it('renders the "Go to Dashboard" link pointing to /dashboard', () => {
    const reset = vi.fn()
    render(<ErrorBoundaryCard error={makeError('Boom')} reset={reset} />)
    const link = screen.getByRole('link', { name: /go to dashboard/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('shows error message in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    // @ts-expect-error -- we need to test dev behavior
    process.env.NODE_ENV = 'development'

    const reset = vi.fn()
    render(<ErrorBoundaryCard error={makeError('Database connection failed')} reset={reset} />)
    expect(screen.getByText('Database connection failed')).toBeInTheDocument()

    // @ts-expect-error -- restore
    process.env.NODE_ENV = originalEnv
  })

  it('hides error message in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    // @ts-expect-error -- we need to test prod behavior
    process.env.NODE_ENV = 'production'

    const reset = vi.fn()
    render(<ErrorBoundaryCard error={makeError('Secret error details')} reset={reset} />)
    expect(screen.queryByText('Secret error details')).not.toBeInTheDocument()

    // @ts-expect-error -- restore
    process.env.NODE_ENV = originalEnv
  })

  it('renders the alert triangle icon', () => {
    const reset = vi.fn()
    render(<ErrorBoundaryCard error={makeError('Boom')} reset={reset} />)
    // Lucide icons render as SVG
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
