import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InitiativeCard } from '../initiative-card'
import type { InitiativeStatus } from '@/types/initiatives'

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
   Fixtures
   ============================================================ */

const baseInitiative = {
  id: 'init-1',
  title: 'Reduce Customer Churn',
  description: 'A strategic initiative to reduce monthly churn below 5%',
  status: 'active' as InitiativeStatus,
  color: '#4F46E5',
  target_metric: 'Monthly churn rate',
  target_end: '2026-12-31',
  project_count: 3,
  step_progress: 75,
  owner: { id: 'user-1', display_name: 'Alice Johnson' },
}

/* ============================================================
   InitiativeCard
   ============================================================ */

describe('InitiativeCard', () => {
  it('renders initiative title', () => {
    render(<InitiativeCard initiative={baseInitiative} />)
    expect(screen.getByText('Reduce Customer Churn')).toBeTruthy()
  })

  it('renders status badge with correct label', () => {
    render(<InitiativeCard initiative={baseInitiative} />)
    expect(screen.getByText('Active')).toBeTruthy()
  })

  it('renders status badge for each status variant', () => {
    const statuses: Array<{ status: InitiativeStatus; label: string }> = [
      { status: 'draft', label: 'Draft' },
      { status: 'active', label: 'Active' },
      { status: 'on_hold', label: 'On Hold' },
      { status: 'completed', label: 'Completed' },
      { status: 'archived', label: 'Archived' },
    ]

    for (const { status, label } of statuses) {
      const { unmount } = render(<InitiativeCard initiative={{ ...baseInitiative, status }} />)
      expect(screen.getByText(label)).toBeTruthy()
      unmount()
    }
  })

  it('renders target metric when present', () => {
    render(<InitiativeCard initiative={baseInitiative} />)
    expect(screen.getByText('Monthly churn rate')).toBeTruthy()
  })

  it('does not render target metric section when null', () => {
    render(<InitiativeCard initiative={{ ...baseInitiative, target_metric: null }} />)
    expect(screen.queryByText('Monthly churn rate')).toBeNull()
  })

  it('renders project count with plural label', () => {
    render(<InitiativeCard initiative={baseInitiative} />)
    expect(screen.getByText('3 projects')).toBeTruthy()
  })

  it('renders project count with singular label when count is 1', () => {
    render(<InitiativeCard initiative={{ ...baseInitiative, project_count: 1 }} />)
    expect(screen.getByText('1 project')).toBeTruthy()
  })

  it('renders project count of zero', () => {
    render(<InitiativeCard initiative={{ ...baseInitiative, project_count: 0 }} />)
    expect(screen.getByText('0 projects')).toBeTruthy()
  })

  it('renders target end date when present', () => {
    render(<InitiativeCard initiative={baseInitiative} />)
    // Use local-midnight parsing to match FormattedDate's timezone-safe behaviour
    const dateText = new Date('2026-12-31T00:00:00').toLocaleString(undefined, {
      dateStyle: 'medium',
    })
    expect(screen.getByText(dateText)).toBeTruthy()
  })

  it('does not render date when target_end is null', () => {
    render(<InitiativeCard initiative={{ ...baseInitiative, target_end: null }} />)
    const dateText = new Date('2026-12-31T00:00:00').toLocaleString(undefined, {
      dateStyle: 'medium',
    })
    expect(screen.queryByText(dateText)).toBeNull()
  })

  it('renders owner display name', () => {
    render(<InitiativeCard initiative={baseInitiative} />)
    expect(screen.getByText('Alice Johnson')).toBeTruthy()
  })

  it('renders description when present', () => {
    render(<InitiativeCard initiative={baseInitiative} />)
    expect(screen.getByText('A strategic initiative to reduce monthly churn below 5%')).toBeTruthy()
  })

  it('does not render description paragraph when null', () => {
    render(<InitiativeCard initiative={{ ...baseInitiative, description: null }} />)
    expect(screen.queryByText('A strategic initiative to reduce monthly churn below 5%')).toBeNull()
  })

  it('links to initiative detail page', () => {
    render(<InitiativeCard initiative={baseInitiative} />)
    const link = screen.getByTestId('initiative-card')
    expect(link.getAttribute('href')).toBe('/initiatives/init-1')
  })

  it('renders data-testid attribute on card element', () => {
    render(<InitiativeCard initiative={baseInitiative} />)
    expect(screen.getByTestId('initiative-card')).toBeTruthy()
  })

  it('renders progress bar when project_count is greater than zero', () => {
    render(<InitiativeCard initiative={baseInitiative} />)
    expect(screen.getByTestId('initiative-progress')).toBeTruthy()
    expect(screen.getByTestId('initiative-progress-pct')).toBeTruthy()
    expect(screen.getByText('75%')).toBeTruthy()
  })

  it('does not render progress bar when project_count is zero', () => {
    render(
      <InitiativeCard initiative={{ ...baseInitiative, project_count: 0, step_progress: 0 }} />,
    )
    expect(screen.queryByTestId('initiative-progress')).toBeNull()
  })

  it('renders green progress color for progress above 66', () => {
    render(<InitiativeCard initiative={{ ...baseInitiative, step_progress: 80 }} />)
    const pct = screen.getByTestId('initiative-progress-pct')
    // JSDOM converts hex to rgb in inline styles
    expect(pct.getAttribute('style')).toContain('rgb(22, 163, 74)')
  })

  it('renders yellow progress color for progress between 33 and 66 inclusive', () => {
    render(<InitiativeCard initiative={{ ...baseInitiative, step_progress: 50 }} />)
    const pct = screen.getByTestId('initiative-progress-pct')
    expect(pct.getAttribute('style')).toContain('rgb(202, 138, 4)')
  })

  it('renders red progress color for progress below 33', () => {
    render(<InitiativeCard initiative={{ ...baseInitiative, step_progress: 20 }} />)
    const pct = screen.getByTestId('initiative-progress-pct')
    expect(pct.getAttribute('style')).toContain('rgb(220, 38, 38)')
  })

  it('renders step progress label', () => {
    render(<InitiativeCard initiative={baseInitiative} />)
    expect(screen.getByText('Step progress')).toBeTruthy()
  })
})
