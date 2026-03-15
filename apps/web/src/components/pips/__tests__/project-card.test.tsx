import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectCard } from '../project-card'

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

vi.mock('@pips/shared', () => ({
  PIPS_STEPS: [
    { number: 1, name: 'Identify', color: '#2563EB' },
    { number: 2, name: 'Analyze', color: '#D97706' },
    { number: 3, name: 'Generate', color: '#059669' },
    { number: 4, name: 'Select & Plan', color: '#4338CA' },
    { number: 5, name: 'Implement', color: '#CA8A04' },
    { number: 6, name: 'Evaluate', color: '#0891B2' },
  ],
}))

/* ============================================================
   Helpers
   ============================================================ */

const defaultProps = {
  id: 'proj-1',
  name: 'Reduce Cycle Time',
  description: 'Aim to cut manufacturing cycle time by 20%',
  status: 'active',
  currentStep: 2,
  ownerName: 'Alice',
  stepsCompleted: 1,
  targetDate: '2026-06-15',
}

/* ============================================================
   Tests
   ============================================================ */

describe('ProjectCard', () => {
  it('renders the project name', () => {
    render(<ProjectCard {...defaultProps} />)
    expect(screen.getByText('Reduce Cycle Time')).toBeInTheDocument()
  })

  it('renders the project description', () => {
    render(<ProjectCard {...defaultProps} />)
    expect(screen.getByText('Aim to cut manufacturing cycle time by 20%')).toBeInTheDocument()
  })

  it('does not render description when null', () => {
    render(<ProjectCard {...defaultProps} description={null} />)
    expect(screen.queryByText('Aim to cut manufacturing cycle time by 20%')).not.toBeInTheDocument()
  })

  it('links to the correct project page', () => {
    render(<ProjectCard {...defaultProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/projects/proj-1')
  })

  it('shows the status badge as "Active"', () => {
    render(<ProjectCard {...defaultProps} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows "Completed" badge when status is completed', () => {
    render(<ProjectCard {...defaultProps} status="completed" />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('shows "On Hold" badge when status is on_hold', () => {
    render(<ProjectCard {...defaultProps} status="on_hold" />)
    expect(screen.getByText('On Hold')).toBeInTheDocument()
  })

  it('shows "Cancelled" badge when status is cancelled', () => {
    render(<ProjectCard {...defaultProps} status="cancelled" />)
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })

  it('shows the current step name and number', () => {
    render(<ProjectCard {...defaultProps} />)
    expect(screen.getByText('Step 2: Analyze')).toBeInTheDocument()
  })

  it('shows the owner name', () => {
    render(<ProjectCard {...defaultProps} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('shows the target date', () => {
    render(<ProjectCard {...defaultProps} />)
    // Date renders via toLocaleDateString
    const dateText = new Date('2026-06-15').toLocaleString(undefined, { dateStyle: 'medium' })
    expect(screen.getByText(dateText)).toBeInTheDocument()
  })

  it('does not render target date when null', () => {
    render(<ProjectCard {...defaultProps} targetDate={null} />)
    // No Calendar icon should pair with a date
    const dateText = new Date('2026-06-15').toLocaleString(undefined, { dateStyle: 'medium' })
    expect(screen.queryByText(dateText)).not.toBeInTheDocument()
  })

  it('renders 6 progress bar segments', () => {
    const { container } = render(<ProjectCard {...defaultProps} />)
    // The progress bar has 6 divs with h-1.5 class
    const progressBars = container.querySelectorAll('.h-1\\.5.flex-1')
    expect(progressBars).toHaveLength(6)
  })

  it('falls back to Active for unknown status', () => {
    render(<ProjectCard {...defaultProps} status="unknown_status" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })
})
