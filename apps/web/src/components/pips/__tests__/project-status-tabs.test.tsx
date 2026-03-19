import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectStatusTabs } from '../project-status-tabs'

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
    toString: () => '',
  }),
}))

/* ============================================================
   Helpers
   ============================================================ */

const defaultCounts = {
  active: 5,
  completed: 3,
  archived: 1,
  all: 9,
}

/* ============================================================
   Tests
   ============================================================ */

describe('ProjectStatusTabs', () => {
  it('renders all four tabs', () => {
    render(<ProjectStatusTabs counts={defaultCounts} currentStatus="active" />)
    expect(screen.getByTestId('status-tab-active')).toBeInTheDocument()
    expect(screen.getByTestId('status-tab-completed')).toBeInTheDocument()
    expect(screen.getByTestId('status-tab-archived')).toBeInTheDocument()
    expect(screen.getByTestId('status-tab-all')).toBeInTheDocument()
  })

  it('shows count badges for each tab', () => {
    render(<ProjectStatusTabs counts={defaultCounts} currentStatus="active" />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
  })

  it('marks the active tab as selected', () => {
    render(<ProjectStatusTabs counts={defaultCounts} currentStatus="active" />)
    const activeTab = screen.getByTestId('status-tab-active')
    expect(activeTab).toHaveAttribute('aria-selected', 'true')
  })

  it('marks the completed tab as selected when currentStatus is completed', () => {
    render(<ProjectStatusTabs counts={defaultCounts} currentStatus="completed" />)
    const completedTab = screen.getByTestId('status-tab-completed')
    expect(completedTab).toHaveAttribute('aria-selected', 'true')
    const activeTab = screen.getByTestId('status-tab-active')
    expect(activeTab).toHaveAttribute('aria-selected', 'false')
  })

  it('marks the archived tab as selected when currentStatus is archived', () => {
    render(<ProjectStatusTabs counts={defaultCounts} currentStatus="archived" />)
    expect(screen.getByTestId('status-tab-archived')).toHaveAttribute('aria-selected', 'true')
  })

  it('marks the all tab as selected when currentStatus is all', () => {
    render(<ProjectStatusTabs counts={defaultCounts} currentStatus="all" />)
    expect(screen.getByTestId('status-tab-all')).toHaveAttribute('aria-selected', 'true')
  })

  it('active tab links to /projects without status param', () => {
    render(<ProjectStatusTabs counts={defaultCounts} currentStatus="completed" />)
    const activeTab = screen.getByTestId('status-tab-active')
    expect(activeTab).toHaveAttribute('href', '/projects')
  })

  it('completed tab links to /projects?status=completed', () => {
    render(<ProjectStatusTabs counts={defaultCounts} currentStatus="active" />)
    const completedTab = screen.getByTestId('status-tab-completed')
    expect(completedTab).toHaveAttribute('href', '/projects?status=completed')
  })

  it('archived tab links to /projects?status=archived', () => {
    render(<ProjectStatusTabs counts={defaultCounts} currentStatus="active" />)
    const archivedTab = screen.getByTestId('status-tab-archived')
    expect(archivedTab).toHaveAttribute('href', '/projects?status=archived')
  })

  it('all tab links to /projects?status=all', () => {
    render(<ProjectStatusTabs counts={defaultCounts} currentStatus="active" />)
    const allTab = screen.getByTestId('status-tab-all')
    expect(allTab).toHaveAttribute('href', '/projects?status=all')
  })

  it('has tablist role for accessibility', () => {
    render(<ProjectStatusTabs counts={defaultCounts} currentStatus="active" />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })
})
