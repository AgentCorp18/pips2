import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TicketCard } from '../ticket-card'

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

const defaultProps = {
  id: 'ticket-1',
  sequenceId: 'PIPS-42',
  title: 'Fix database migration',
  status: 'in_progress' as const,
  priority: 'high' as const,
  type: 'bug' as const,
  assigneeName: 'Bob',
  assigneeAvatar: null,
  dueDate: '2026-06-30',
}

/* ============================================================
   Tests
   ============================================================ */

describe('TicketCard', () => {
  it('renders the ticket title', () => {
    render(<TicketCard {...defaultProps} />)
    expect(screen.getByText('Fix database migration')).toBeInTheDocument()
  })

  it('renders the sequence ID', () => {
    render(<TicketCard {...defaultProps} />)
    expect(screen.getByText('PIPS-42')).toBeInTheDocument()
  })

  it('links to the correct ticket detail page', () => {
    render(<TicketCard {...defaultProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/tickets/ticket-1')
  })

  it('renders the status badge', () => {
    render(<TicketCard {...defaultProps} />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('renders different status badges correctly', () => {
    const statuses = [
      { value: 'backlog' as const, label: 'Backlog' },
      { value: 'todo' as const, label: 'Todo' },
      { value: 'in_review' as const, label: 'In Review' },
      { value: 'blocked' as const, label: 'Blocked' },
      { value: 'done' as const, label: 'Done' },
      { value: 'cancelled' as const, label: 'Cancelled' },
    ]

    statuses.forEach(({ value, label }) => {
      const { unmount } = render(<TicketCard {...defaultProps} status={value} />)
      expect(screen.getByText(label)).toBeInTheDocument()
      unmount()
    })
  })

  it('renders priority dot with correct title', () => {
    const { container } = render(<TicketCard {...defaultProps} />)
    const dot = container.querySelector('[title="High"]')
    expect(dot).toBeInTheDocument()
  })

  it('renders assignee name', () => {
    render(<TicketCard {...defaultProps} />)
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('does not render assignee when null', () => {
    render(<TicketCard {...defaultProps} assigneeName={null} />)
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })

  it('renders the due date', () => {
    render(<TicketCard {...defaultProps} />)
    // Use local-midnight parsing to match FormattedDate's timezone-safe behaviour:
    // bare YYYY-MM-DD strings are rewritten to YYYY-MM-DDT00:00:00 (no offset) so
    // the date never shifts for users west of UTC.
    const dateStr = new Date('2026-06-30T00:00:00').toLocaleString(undefined, {
      dateStyle: 'medium',
    })
    expect(screen.getByText(dateStr)).toBeInTheDocument()
  })

  it('does not render due date when null', () => {
    render(<TicketCard {...defaultProps} dueDate={null} />)
    const dateStr = new Date('2026-06-30T00:00:00').toLocaleString(undefined, {
      dateStyle: 'medium',
    })
    expect(screen.queryByText(dateStr)).not.toBeInTheDocument()
  })

  it('renders type icon as SVG', () => {
    render(<TicketCard {...defaultProps} />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('renders all priority levels without error', () => {
    const priorities = ['critical', 'high', 'medium', 'low', 'none'] as const
    priorities.forEach((p) => {
      const { unmount } = render(<TicketCard {...defaultProps} priority={p} />)
      expect(screen.getByText('Fix database migration')).toBeInTheDocument()
      unmount()
    })
  })

  it('renders all ticket types without error', () => {
    const types = ['task', 'bug', 'feature', 'general', 'pips_project'] as const
    types.forEach((t) => {
      const { unmount } = render(<TicketCard {...defaultProps} type={t} />)
      expect(screen.getByText('Fix database migration')).toBeInTheDocument()
      unmount()
    })
  })

  it('does not show Blocked badge by default', () => {
    render(<TicketCard {...defaultProps} />)
    expect(screen.queryByTestId('ticket-card-blocked-badge')).not.toBeInTheDocument()
  })

  it('shows Blocked badge when isBlocked is true', () => {
    render(<TicketCard {...defaultProps} isBlocked />)
    expect(screen.getByTestId('ticket-card-blocked-badge')).toBeInTheDocument()
    expect(screen.getByText('Blocked')).toBeInTheDocument()
  })

  it('does not show Blocked badge when isBlocked is false', () => {
    render(<TicketCard {...defaultProps} isBlocked={false} />)
    expect(screen.queryByTestId('ticket-card-blocked-badge')).not.toBeInTheDocument()
  })
})
