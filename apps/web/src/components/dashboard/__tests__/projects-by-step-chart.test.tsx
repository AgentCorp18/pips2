import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectsByStepChart } from '../projects-by-step-chart'
import type { StepDistribution } from '@/app/(app)/dashboard/actions'

// Mock recharts to avoid rendering SVG in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Cell: () => <div />,
}))

const CHART_DATA: StepDistribution[] = [
  { step: '1', name: 'Identify', count: 3, color: '#3B82F6' },
  { step: '2', name: 'Analyze', count: 2, color: '#F59E0B' },
  { step: '3', name: 'Generate', count: 0, color: '#10B981' },
]

const EMPTY_DATA: StepDistribution[] = [
  { step: '1', name: 'Identify', count: 0, color: '#3B82F6' },
  { step: '2', name: 'Analyze', count: 0, color: '#F59E0B' },
]

describe('ProjectsByStepChart', () => {
  it('renders Projects by Step heading', () => {
    render(<ProjectsByStepChart data={CHART_DATA} />)
    expect(screen.getByText('Projects by Step')).toBeTruthy()
  })

  it('renders chart when data has counts', () => {
    render(<ProjectsByStepChart data={CHART_DATA} />)
    expect(screen.getByTestId('bar-chart')).toBeTruthy()
  })

  it('renders empty state when all counts are zero', () => {
    render(<ProjectsByStepChart data={EMPTY_DATA} />)
    expect(screen.getByText(/No active projects yet/)).toBeTruthy()
  })

  it('does not render chart in empty state', () => {
    render(<ProjectsByStepChart data={EMPTY_DATA} />)
    expect(screen.queryByTestId('bar-chart')).toBeNull()
  })
})
