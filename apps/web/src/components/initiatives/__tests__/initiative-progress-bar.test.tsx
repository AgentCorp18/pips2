import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InitiativeProgressBar } from '../initiative-progress-bar'
import type { InitiativeProgress } from '@/types/initiatives'

/* ============================================================
   Fixtures
   ============================================================ */

const baseProgress: InitiativeProgress = {
  total_projects: 4,
  completed_projects: 2,
  in_progress_projects: 1,
  total_tickets: 20,
  completed_tickets: 10,
  weighted_progress: 65,
}

/* ============================================================
   InitiativeProgressBar
   ============================================================ */

describe('InitiativeProgressBar', () => {
  it('renders weighted progress percentage', () => {
    render(<InitiativeProgressBar progress={baseProgress} color="#4F46E5" />)
    expect(screen.getByText('65%')).toBeTruthy()
  })

  it('renders 0% when weighted_progress is 0', () => {
    render(
      <InitiativeProgressBar
        progress={{ ...baseProgress, weighted_progress: 0 }}
        color="#4F46E5"
      />,
    )
    expect(screen.getByText('0%')).toBeTruthy()
  })

  it('renders 100% when weighted_progress is 100', () => {
    render(
      <InitiativeProgressBar
        progress={{ ...baseProgress, weighted_progress: 100 }}
        color="#4F46E5"
      />,
    )
    expect(screen.getByText('100%')).toBeTruthy()
  })

  it('renders Overall Progress label', () => {
    render(<InitiativeProgressBar progress={baseProgress} color="#4F46E5" />)
    expect(screen.getByText('Overall Progress')).toBeTruthy()
  })

  it('renders "Weighted by project priority" helper text', () => {
    render(<InitiativeProgressBar progress={baseProgress} color="#4F46E5" />)
    expect(screen.getByText('Weighted by project priority')).toBeTruthy()
  })

  it('renders Projects stat with total_projects value', () => {
    render(<InitiativeProgressBar progress={baseProgress} color="#4F46E5" />)
    expect(screen.getByText('Projects')).toBeTruthy()
    expect(screen.getByText('4')).toBeTruthy()
  })

  it('renders Completed stat with completed_projects value', () => {
    render(<InitiativeProgressBar progress={baseProgress} color="#4F46E5" />)
    expect(screen.getByText('Completed')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('renders Tickets stat with total_tickets value', () => {
    render(<InitiativeProgressBar progress={baseProgress} color="#4F46E5" />)
    expect(screen.getByText('Tickets')).toBeTruthy()
    expect(screen.getByText('20')).toBeTruthy()
  })

  it('renders Done stat with completed_tickets value', () => {
    render(<InitiativeProgressBar progress={baseProgress} color="#4F46E5" />)
    expect(screen.getByText('Done')).toBeTruthy()
    expect(screen.getByText('10')).toBeTruthy()
  })

  it('renders all four stat labels in the grid', () => {
    render(<InitiativeProgressBar progress={baseProgress} color="#4F46E5" />)
    expect(screen.getByText('Projects')).toBeTruthy()
    expect(screen.getByText('Completed')).toBeTruthy()
    expect(screen.getByText('Tickets')).toBeTruthy()
    expect(screen.getByText('Done')).toBeTruthy()
  })

  it('renders zero values for empty progress', () => {
    const emptyProgress: InitiativeProgress = {
      total_projects: 0,
      completed_projects: 0,
      in_progress_projects: 0,
      total_tickets: 0,
      completed_tickets: 0,
      weighted_progress: 0,
    }
    render(<InitiativeProgressBar progress={emptyProgress} color="#4F46E5" />)
    // All stat values should be 0 — find the "0%" plus the four "0" stat values
    const zeros = screen.getAllByText('0')
    // Projects=0, Completed=0, Tickets=0, Done=0 → four "0" values
    expect(zeros.length).toBeGreaterThanOrEqual(4)
  })
})
