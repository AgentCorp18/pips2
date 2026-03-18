import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricsWidgets } from '../metrics-widgets'
import type { DashboardMetrics } from '@/app/(app)/dashboard/actions'

const BASE_METRICS: DashboardMetrics = {
  completionRate: 45,
  avgCycleTimeDays: 3.2,
  ticketsClosedThisWeek: 12,
  ticketsCreatedThisWeek: 8,
  formsCompletedCount: 37,
}

describe('MetricsWidgets', () => {
  it('renders the metrics container', () => {
    render(<MetricsWidgets metrics={BASE_METRICS} />)
    expect(screen.getByTestId('metrics-widgets')).toBeTruthy()
  })

  it('shows completion rate', () => {
    render(<MetricsWidgets metrics={BASE_METRICS} />)
    expect(screen.getByTestId('metric-completion-rate')).toBeTruthy()
    expect(screen.getByText('45%')).toBeTruthy()
    expect(screen.getByText('Project Completion Rate')).toBeTruthy()
  })

  it('shows average cycle time', () => {
    render(<MetricsWidgets metrics={BASE_METRICS} />)
    expect(screen.getByTestId('metric-avg-cycle-time')).toBeTruthy()
    expect(screen.getByText('3.2d')).toBeTruthy()
    expect(screen.getByText('Avg Cycle Time (90d)')).toBeTruthy()
  })

  it('shows -- when cycle time is null', () => {
    render(<MetricsWidgets metrics={{ ...BASE_METRICS, avgCycleTimeDays: null }} />)
    expect(screen.getByText('--')).toBeTruthy()
  })

  it('shows ticket velocity (closed / created)', () => {
    render(<MetricsWidgets metrics={BASE_METRICS} />)
    expect(screen.getByTestId('metric-ticket-velocity')).toBeTruthy()
    // Shows "12 / 8" format
    expect(screen.getByText('12')).toBeTruthy()
    expect(screen.getByText(/\/ 8/)).toBeTruthy()
    expect(screen.getByText('Closed / Created This Week')).toBeTruthy()
  })

  it('shows forms completed count', () => {
    render(<MetricsWidgets metrics={BASE_METRICS} />)
    expect(screen.getByTestId('metric-forms-completed')).toBeTruthy()
    expect(screen.getByText('37')).toBeTruthy()
    expect(screen.getByText('Methodology Forms')).toBeTruthy()
  })

  it('shows 0% completion rate', () => {
    render(<MetricsWidgets metrics={{ ...BASE_METRICS, completionRate: 0 }} />)
    expect(screen.getByText('0%')).toBeTruthy()
  })

  it('shows 100% completion rate', () => {
    render(<MetricsWidgets metrics={{ ...BASE_METRICS, completionRate: 100 }} />)
    expect(screen.getByText('100%')).toBeTruthy()
  })

  it('handles zero velocity', () => {
    render(
      <MetricsWidgets
        metrics={{ ...BASE_METRICS, ticketsClosedThisWeek: 0, ticketsCreatedThisWeek: 0 }}
      />,
    )
    expect(screen.getByTestId('metric-ticket-velocity')).toBeTruthy()
  })

  it('renders all four metric cards', () => {
    render(<MetricsWidgets metrics={BASE_METRICS} />)
    expect(screen.getByTestId('metric-completion-rate')).toBeTruthy()
    expect(screen.getByTestId('metric-avg-cycle-time')).toBeTruthy()
    expect(screen.getByTestId('metric-ticket-velocity')).toBeTruthy()
    expect(screen.getByTestId('metric-forms-completed')).toBeTruthy()
  })
})
