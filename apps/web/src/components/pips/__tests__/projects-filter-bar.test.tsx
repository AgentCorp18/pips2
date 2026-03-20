import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectsFilterBar } from '../projects-filter-bar'

/* ============================================================
   Mocks
   ============================================================ */

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    toString: () => 'view=cards',
    get: (key: string) => (key === 'view' ? 'cards' : null),
  }),
}))

/* ============================================================
   Tests
   ============================================================ */

describe('ProjectsFilterBar', () => {
  it('renders both filter controls', () => {
    render(
      <ProjectsFilterBar currentSort="" currentFilter="" atRiskCount={0} />,
    )
    expect(screen.getByTestId('sort-health-button')).toBeInTheDocument()
    expect(screen.getByTestId('filter-at-risk-button')).toBeInTheDocument()
  })

  it('shows sort button with active styling when currentSort is "health"', () => {
    render(
      <ProjectsFilterBar currentSort="health" currentFilter="" atRiskCount={0} />,
    )
    const btn = screen.getByTestId('sort-health-button')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows sort button as inactive when currentSort is empty', () => {
    render(
      <ProjectsFilterBar currentSort="" currentFilter="" atRiskCount={0} />,
    )
    const btn = screen.getByTestId('sort-health-button')
    expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows filter button with active styling when currentFilter is "at-risk"', () => {
    render(
      <ProjectsFilterBar currentSort="" currentFilter="at-risk" atRiskCount={3} />,
    )
    const btn = screen.getByTestId('filter-at-risk-button')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows at-risk badge count when atRiskCount > 0', () => {
    render(
      <ProjectsFilterBar currentSort="" currentFilter="" atRiskCount={5} />,
    )
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('does not show at-risk badge when atRiskCount is 0', () => {
    render(
      <ProjectsFilterBar currentSort="" currentFilter="" atRiskCount={0} />,
    )
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('sort button href clears sort param when sort is already active', () => {
    render(
      <ProjectsFilterBar currentSort="health" currentFilter="" atRiskCount={0} />,
    )
    const btn = screen.getByTestId('sort-health-button')
    // When sort=health is active, clicking should remove it — href should not have sort=health
    const href = btn.getAttribute('href') ?? ''
    expect(href).not.toContain('sort=health')
  })

  it('sort button href sets sort=health when sort is not active', () => {
    render(
      <ProjectsFilterBar currentSort="" currentFilter="" atRiskCount={0} />,
    )
    const btn = screen.getByTestId('sort-health-button')
    expect(btn.getAttribute('href')).toContain('sort=health')
  })

  it('filter button href sets filter=at-risk when filter is not active', () => {
    render(
      <ProjectsFilterBar currentSort="" currentFilter="" atRiskCount={2} />,
    )
    const btn = screen.getByTestId('filter-at-risk-button')
    expect(btn.getAttribute('href')).toContain('filter=at-risk')
  })

  it('filter button href clears filter param when filter is already active', () => {
    render(
      <ProjectsFilterBar currentSort="" currentFilter="at-risk" atRiskCount={2} />,
    )
    const btn = screen.getByTestId('filter-at-risk-button')
    const href = btn.getAttribute('href') ?? ''
    expect(href).not.toContain('filter=at-risk')
  })

  it('has accessible toolbar role', () => {
    render(
      <ProjectsFilterBar currentSort="" currentFilter="" atRiskCount={0} />,
    )
    expect(screen.getByRole('toolbar')).toBeInTheDocument()
  })
})
