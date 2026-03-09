import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '../empty-state'
import { FolderKanban, Ticket, Search } from 'lucide-react'

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
   Tests
   ============================================================ */

describe('EmptyState', () => {
  it('renders the title', () => {
    render(
      <EmptyState
        icon={FolderKanban}
        title="No projects"
        description="Create your first project"
      />,
    )
    expect(screen.getByText('No projects')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(
      <EmptyState
        icon={FolderKanban}
        title="No projects"
        description="Start by creating a new project"
      />,
    )
    expect(screen.getByText('Start by creating a new project')).toBeInTheDocument()
  })

  it('renders the icon as an SVG', () => {
    render(<EmptyState icon={Ticket} title="No tickets" description="Create your first ticket" />)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders the action button with correct href when action is provided', () => {
    render(
      <EmptyState
        icon={FolderKanban}
        title="No projects"
        description="Get started with PIPS"
        action={{ label: 'New Project', href: '/projects/new' }}
      />,
    )
    const link = screen.getByRole('link', { name: 'New Project' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/projects/new')
  })

  it('does not render a button when no action is provided', () => {
    render(<EmptyState icon={Search} title="No results" description="Try a different search" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders different icons correctly', () => {
    const { rerender } = render(
      <EmptyState icon={Ticket} title="Empty" description="Nothing here" />,
    )
    expect(document.querySelector('svg')).toBeInTheDocument()

    rerender(<EmptyState icon={Search} title="Empty" description="Nothing here" />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('has role="status" for accessibility', () => {
    render(
      <EmptyState
        icon={FolderKanban}
        title="No projects"
        description="Create your first project"
      />,
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has aria-label matching the title', () => {
    render(
      <EmptyState
        icon={FolderKanban}
        title="No projects"
        description="Create your first project"
      />,
    )
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'No projects')
  })

  it('has data-testid="empty-state"', () => {
    render(
      <EmptyState
        icon={FolderKanban}
        title="No projects"
        description="Create your first project"
      />,
    )
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })
})
