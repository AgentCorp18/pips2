import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KanbanCard, type KanbanCardProps } from '../kanban-card'

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

const defaultProps: KanbanCardProps = {
  id: 'ticket-1',
  sequenceId: 'PIPS-42',
  title: 'Fix authentication timeout',
  priority: 'high',
  type: 'bug',
  assigneeName: 'Alice',
  assigneeAvatar: null,
  dueDate: '2026-12-31',
}

/* ============================================================
   Tests
   ============================================================ */

describe('KanbanCard', () => {
  it('renders the ticket title', () => {
    render(<KanbanCard {...defaultProps} />)
    expect(screen.getByText('Fix authentication timeout')).toBeInTheDocument()
  })

  it('renders the sequence ID', () => {
    render(<KanbanCard {...defaultProps} />)
    expect(screen.getByText('PIPS-42')).toBeInTheDocument()
  })

  it('links to the correct ticket page', () => {
    render(<KanbanCard {...defaultProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/tickets/ticket-1')
  })

  it('renders the assignee initial when assigneeName is provided', () => {
    render(<KanbanCard {...defaultProps} />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('does not render assignee when assigneeName is null', () => {
    render(<KanbanCard {...defaultProps} assigneeName={null} />)
    expect(screen.queryByText('A')).not.toBeInTheDocument()
  })

  it('renders the due date', () => {
    render(<KanbanCard {...defaultProps} />)
    // Use local-midnight parsing to match FormattedDate's timezone-safe behaviour
    const dateStr = new Date('2026-12-31T00:00:00').toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
    expect(screen.getByText(dateStr)).toBeInTheDocument()
  })

  it('does not render due date when null', () => {
    render(<KanbanCard {...defaultProps} dueDate={null} />)
    const dateStr = new Date('2026-12-31T00:00:00').toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
    expect(screen.queryByText(dateStr)).not.toBeInTheDocument()
  })

  it('renders the priority dot with aria-label', () => {
    const { container } = render(<KanbanCard {...defaultProps} />)
    const dot = container.querySelector('[aria-label="Priority: high"]')
    expect(dot).toBeInTheDocument()
  })

  it('renders type icon (SVG) for bugs', () => {
    render(<KanbanCard {...defaultProps} type="bug" />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows overdue styling when due date is in the past', () => {
    const pastDate = '2020-01-01'
    render(<KanbanCard {...defaultProps} dueDate={pastDate} />)
    const dateStr = new Date(`${pastDate}T00:00:00`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
    const dateEl = screen.getByText(dateStr)
    // The parent span gets the red color — jsdom converts hex to rgb
    const parent = dateEl.closest('span[style]')
    expect(parent).not.toBeNull()
    // #EF4444 = rgb(239, 68, 68)
    expect(parent?.getAttribute('style')).toContain('rgb(239, 68, 68)')
  })

  it('does not show overdue styling when due date is in the future', () => {
    const futureDate = '2099-12-31'
    const { container } = render(<KanbanCard {...defaultProps} dueDate={futureDate} />)
    // Find the date display span that contains the calendar icon
    const dateSpans = container.querySelectorAll('[style]')
    const overdue = Array.from(dateSpans).filter(
      (el) => el.getAttribute('style')?.includes('#EF4444') && el.textContent?.includes('Dec'),
    )
    expect(overdue).toHaveLength(0)
  })

  it('renders different ticket types', () => {
    const types: KanbanCardProps['type'][] = ['task', 'bug', 'feature', 'general', 'pips_project']
    types.forEach((type) => {
      const { unmount } = render(<KanbanCard {...defaultProps} type={type} />)
      expect(screen.getByText('Fix authentication timeout')).toBeInTheDocument()
      unmount()
    })
  })

  it('renders different priorities', () => {
    const priorities: KanbanCardProps['priority'][] = ['critical', 'high', 'medium', 'low', 'none']
    priorities.forEach((priority) => {
      const { unmount, container } = render(<KanbanCard {...defaultProps} priority={priority} />)
      const dot = container.querySelector(`[aria-label="Priority: ${priority}"]`)
      expect(dot).toBeInTheDocument()
      unmount()
    })
  })

  it('does not show Blocked badge by default', () => {
    render(<KanbanCard {...defaultProps} />)
    expect(screen.queryByTestId('kanban-card-blocked-badge')).not.toBeInTheDocument()
  })

  it('shows Blocked badge when isBlocked is true', () => {
    render(<KanbanCard {...defaultProps} isBlocked />)
    expect(screen.getByTestId('kanban-card-blocked-badge')).toBeInTheDocument()
    expect(screen.getByText('Blocked')).toBeInTheDocument()
  })

  it('does not show Blocked badge when isBlocked is false', () => {
    render(<KanbanCard {...defaultProps} isBlocked={false} />)
    expect(screen.queryByTestId('kanban-card-blocked-badge')).not.toBeInTheDocument()
  })
})
