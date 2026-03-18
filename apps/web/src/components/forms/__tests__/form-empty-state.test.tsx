import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

/* ============================================================
   Mocks
   ============================================================ */

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

/* ============================================================
   Import after mocks
   ============================================================ */

import { FormEmptyState } from '../form-empty-state'

/* ============================================================
   Tests
   ============================================================ */

describe('FormEmptyState', () => {
  it('renders heading', () => {
    render(<FormEmptyState />)
    expect(screen.getByText('No forms found')).toBeTruthy()
  })

  it('renders description', () => {
    render(<FormEmptyState />)
    expect(
      screen.getByText(
        'Start by creating a project and filling out PIPS forms, or try sandbox mode to practice.',
      ),
    ).toBeTruthy()
  })

  it('contains link to create project', () => {
    render(<FormEmptyState />)
    const link = screen.getByText('Create Project').closest('a')
    expect(link).toBeTruthy()
    expect(link?.getAttribute('href')).toBe('/projects/new')
  })

  it('contains link to sandbox view', () => {
    render(<FormEmptyState />)
    const link = screen.getByText('Try Sandbox').closest('a')
    expect(link).toBeTruthy()
    expect(link?.getAttribute('href')).toBe('/forms?view=sandbox')
  })

  it('renders two action buttons', () => {
    render(<FormEmptyState />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(2)
  })
})
