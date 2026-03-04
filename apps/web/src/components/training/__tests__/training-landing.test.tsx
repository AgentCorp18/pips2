import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrainingLanding } from '../training-landing'
import type {
  TrainingPathRow,
  TrainingProgressRow,
  PathModuleCounts,
} from '@/app/(app)/training/actions'

const mockPaths: TrainingPathRow[] = [
  {
    id: 'path-quick-start',
    title: 'Quick Start',
    description: 'Get up and running with PIPS in under an hour.',
    estimated_hours: 1,
    target_audience: 'First-time users',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'path-fundamentals',
    title: 'PIPS Fundamentals',
    description: 'A thorough walk-through of every PIPS step.',
    estimated_hours: 5,
    target_audience: 'New team members',
    sort_order: 2,
    is_active: true,
  },
]

const mockModuleCounts: PathModuleCounts = {
  'path-quick-start': 3,
  'path-fundamentals': 8,
}

const emptyProgress: TrainingProgressRow[] = []

const mockProgress: TrainingProgressRow[] = [
  {
    id: 'p1',
    path_id: 'path-quick-start',
    module_id: 'mod-qs-1',
    status: 'completed',
    started_at: '2026-03-01T10:00:00Z',
    completed_at: '2026-03-01T10:30:00Z',
    assessment_score: 90,
    time_spent_minutes: 15,
  },
  {
    id: 'p2',
    path_id: 'path-quick-start',
    module_id: 'mod-qs-2',
    status: 'in_progress',
    started_at: '2026-03-01T11:00:00Z',
    completed_at: null,
    assessment_score: null,
    time_spent_minutes: 10,
  },
]

describe('TrainingLanding', () => {
  it('renders the Training heading', () => {
    render(
      <TrainingLanding
        paths={mockPaths}
        progress={emptyProgress}
        moduleCounts={mockModuleCounts}
      />,
    )
    expect(screen.getByText('Training')).toBeTruthy()
  })

  it('renders all path titles', () => {
    render(
      <TrainingLanding
        paths={mockPaths}
        progress={emptyProgress}
        moduleCounts={mockModuleCounts}
      />,
    )
    expect(screen.getByText('Quick Start')).toBeTruthy()
    expect(screen.getByText('PIPS Fundamentals')).toBeTruthy()
  })

  it('shows module counts per path', () => {
    render(
      <TrainingLanding
        paths={mockPaths}
        progress={emptyProgress}
        moduleCounts={mockModuleCounts}
      />,
    )
    expect(screen.getByText('3 modules')).toBeTruthy()
    expect(screen.getByText('8 modules')).toBeTruthy()
  })

  it('shows Start button when no progress', () => {
    render(
      <TrainingLanding
        paths={mockPaths}
        progress={emptyProgress}
        moduleCounts={mockModuleCounts}
      />,
    )
    const startButtons = screen.getAllByText('Start')
    expect(startButtons.length).toBe(2)
  })

  it('shows Continue button when path has progress', () => {
    render(
      <TrainingLanding paths={mockPaths} progress={mockProgress} moduleCounts={mockModuleCounts} />,
    )
    expect(screen.getByText('Continue')).toBeTruthy()
  })

  it('shows progress percentage for started paths', () => {
    render(
      <TrainingLanding paths={mockPaths} progress={mockProgress} moduleCounts={mockModuleCounts} />,
    )
    // 1 out of 3 completed = 33%
    expect(screen.getByText('33%')).toBeTruthy()
  })

  it('shows stats row when user has progress', () => {
    render(
      <TrainingLanding paths={mockPaths} progress={mockProgress} moduleCounts={mockModuleCounts} />,
    )
    expect(screen.getByText('Modules completed')).toBeTruthy()
    expect(screen.getByText('In progress')).toBeTruthy()
    expect(screen.getByText('Time spent')).toBeTruthy()
  })

  it('hides stats row when no progress', () => {
    render(
      <TrainingLanding
        paths={mockPaths}
        progress={emptyProgress}
        moduleCounts={mockModuleCounts}
      />,
    )
    expect(screen.queryByText('Modules completed')).toBeNull()
  })

  it('shows empty state when no paths', () => {
    render(<TrainingLanding paths={[]} progress={emptyProgress} moduleCounts={{}} />)
    expect(screen.getByText('No training paths available yet')).toBeTruthy()
  })

  it('shows My Progress link', () => {
    const { container } = render(
      <TrainingLanding
        paths={mockPaths}
        progress={emptyProgress}
        moduleCounts={mockModuleCounts}
      />,
    )
    const progressLink = container.querySelector('a[href="/training/progress"]')
    expect(progressLink).toBeTruthy()
  })
})
