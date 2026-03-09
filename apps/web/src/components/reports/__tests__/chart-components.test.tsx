import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepFunnelChart } from '../step-funnel-chart'
import type { StepFunnelData } from '../step-funnel-chart'
import { ActivityTimelineChart } from '../activity-timeline-chart'
import type { ActivityTimelineData } from '../activity-timeline-chart'
import { TeamContributionsChart } from '../team-contributions-chart'
import type { TeamContributionData } from '../team-contributions-chart'
import { TicketVelocityChart } from '../ticket-velocity-chart'
import type { TicketVelocityData } from '../ticket-velocity-chart'
import { ToolPopularityChart } from '../tool-popularity-chart'
import type { ToolPopularityData } from '../tool-popularity-chart'
import { FormCompletionChart } from '../form-completion-chart'
import type { FormCompletionData } from '../form-completion-chart'
import { StepDurationChart } from '../step-duration-chart'
import type { StepDurationData } from '../step-duration-chart'
import { StepProgressChart } from '../step-progress-chart'
import type { StepProgressData } from '../step-progress-chart'

// Mock recharts to avoid rendering SVG in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  Cell: () => <div data-testid="cell" />,
}))

// ─── Mock Data ──────────────────────────────────────────────────────────────

const funnelData: StepFunnelData[] = [
  { name: 'Step 1', percentage: 100, color: '#3B82F6' },
  { name: 'Step 2', percentage: 80, color: '#F59E0B' },
  { name: 'Step 3', percentage: 60, color: '#10B981' },
]

const emptyFunnelData: StepFunnelData[] = [
  { name: 'Step 1', percentage: 0, color: '#3B82F6' },
  { name: 'Step 2', percentage: 0, color: '#F59E0B' },
]

const timelineData: ActivityTimelineData[] = [
  { date: 'Jan 1', actions: 5 },
  { date: 'Jan 2', actions: 12 },
  { date: 'Jan 3', actions: 8 },
]

const emptyTimelineData: ActivityTimelineData[] = [
  { date: 'Jan 1', actions: 0 },
  { date: 'Jan 2', actions: 0 },
]

const teamData: TeamContributionData[] = [
  { name: 'Alice', completed: 10 },
  { name: 'Bob', completed: 7 },
  { name: 'Charlie', completed: 3 },
]

const emptyTeamData: TeamContributionData[] = [
  { name: 'Alice', completed: 0 },
  { name: 'Bob', completed: 0 },
]

const velocityData: TicketVelocityData[] = [
  { week: 'Week 1', created: 5, completed: 3 },
  { week: 'Week 2', created: 8, completed: 6 },
]

const emptyVelocityData: TicketVelocityData[] = [
  { week: 'Week 1', created: 0, completed: 0 },
  { week: 'Week 2', created: 0, completed: 0 },
]

const toolData: ToolPopularityData[] = [
  { name: 'Fishbone', count: 15 },
  { name: 'Five Why', count: 10 },
  { name: 'Checksheet', count: 5 },
]

const emptyToolData: ToolPopularityData[] = [
  { name: 'Fishbone', count: 0 },
  { name: 'Five Why', count: 0 },
]

const formData: FormCompletionData[] = [
  { step: 'Identify', started: 10, completed: 8 },
  { step: 'Analyze', started: 7, completed: 5 },
]

const emptyFormData: FormCompletionData[] = [
  { step: 'Identify', started: 0, completed: 0 },
  { step: 'Analyze', started: 0, completed: 0 },
]

const durationData: StepDurationData[] = [
  { name: 'Identify', avgDays: 3.5, color: '#3B82F6' },
  { name: 'Analyze', avgDays: 5.2, color: '#F59E0B' },
  { name: 'Generate', avgDays: 2.1, color: '#10B981' },
]

const emptyDurationData: StepDurationData[] = [
  { name: 'Identify', avgDays: 0, color: '#3B82F6' },
  { name: 'Analyze', avgDays: 0, color: '#F59E0B' },
]

const progressData: StepProgressData[] = [
  { step: '1', name: 'Identify', count: 4, color: '#3B82F6' },
  { step: '2', name: 'Analyze', count: 3, color: '#F59E0B' },
  { step: '3', name: 'Generate', count: 1, color: '#10B981' },
]

const emptyProgressData: StepProgressData[] = [
  { step: '1', name: 'Identify', count: 0, color: '#3B82F6' },
  { step: '2', name: 'Analyze', count: 0, color: '#F59E0B' },
]

// ─── StepFunnelChart ────────────────────────────────────────────────────────

describe('StepFunnelChart', () => {
  it('renders the title', () => {
    render(<StepFunnelChart data={funnelData} />)
    expect(screen.getByText('Step Completion Funnel')).toBeTruthy()
  })

  it('renders chart when data has values', () => {
    render(<StepFunnelChart data={funnelData} />)
    expect(screen.getByTestId('bar-chart')).toBeTruthy()
  })

  it('renders empty state when all percentages are zero', () => {
    render(<StepFunnelChart data={emptyFunnelData} />)
    expect(screen.getByText(/No step completion data yet/)).toBeTruthy()
  })

  it('does not render chart in empty state', () => {
    render(<StepFunnelChart data={emptyFunnelData} />)
    expect(screen.queryByTestId('bar-chart')).toBeNull()
  })
})

// ─── ActivityTimelineChart ──────────────────────────────────────────────────

describe('ActivityTimelineChart', () => {
  it('renders the title', () => {
    render(<ActivityTimelineChart data={timelineData} />)
    expect(screen.getByText('Activity Over Time')).toBeTruthy()
  })

  it('renders chart when data has values', () => {
    render(<ActivityTimelineChart data={timelineData} />)
    expect(screen.getByTestId('area-chart')).toBeTruthy()
  })

  it('renders empty state when all actions are zero', () => {
    render(<ActivityTimelineChart data={emptyTimelineData} />)
    expect(screen.getByText(/No activity data yet/)).toBeTruthy()
  })

  it('does not render chart in empty state', () => {
    render(<ActivityTimelineChart data={emptyTimelineData} />)
    expect(screen.queryByTestId('area-chart')).toBeNull()
  })
})

// ─── TeamContributionsChart ─────────────────────────────────────────────────

describe('TeamContributionsChart', () => {
  it('renders the default title', () => {
    render(<TeamContributionsChart data={teamData} />)
    expect(screen.getByText('Contributions by Member')).toBeTruthy()
  })

  it('renders a custom title', () => {
    render(<TeamContributionsChart data={teamData} title="Team Output" />)
    expect(screen.getByText('Team Output')).toBeTruthy()
  })

  it('renders chart when data has values', () => {
    render(<TeamContributionsChart data={teamData} />)
    expect(screen.getByTestId('bar-chart')).toBeTruthy()
  })

  it('renders empty state when all completed are zero', () => {
    render(<TeamContributionsChart data={emptyTeamData} />)
    expect(screen.getByText(/No contribution data yet/)).toBeTruthy()
  })

  it('does not render chart in empty state', () => {
    render(<TeamContributionsChart data={emptyTeamData} />)
    expect(screen.queryByTestId('bar-chart')).toBeNull()
  })
})

// ─── TicketVelocityChart ────────────────────────────────────────────────────

describe('TicketVelocityChart', () => {
  it('renders the title', () => {
    render(<TicketVelocityChart data={velocityData} />)
    expect(screen.getByText('Ticket Velocity')).toBeTruthy()
  })

  it('renders chart when data has values', () => {
    render(<TicketVelocityChart data={velocityData} />)
    expect(screen.getByTestId('line-chart')).toBeTruthy()
  })

  it('renders empty state when all values are zero', () => {
    render(<TicketVelocityChart data={emptyVelocityData} />)
    expect(screen.getByText(/No ticket data yet/)).toBeTruthy()
  })

  it('does not render chart in empty state', () => {
    render(<TicketVelocityChart data={emptyVelocityData} />)
    expect(screen.queryByTestId('line-chart')).toBeNull()
  })
})

// ─── ToolPopularityChart ────────────────────────────────────────────────────

describe('ToolPopularityChart', () => {
  it('renders the title', () => {
    render(<ToolPopularityChart data={toolData} />)
    expect(screen.getByText('Most Popular Tools')).toBeTruthy()
  })

  it('renders chart when data has values', () => {
    render(<ToolPopularityChart data={toolData} />)
    expect(screen.getByTestId('bar-chart')).toBeTruthy()
  })

  it('renders empty state when all counts are zero', () => {
    render(<ToolPopularityChart data={emptyToolData} />)
    expect(screen.getByText(/No tool usage data yet/)).toBeTruthy()
  })

  it('does not render chart in empty state', () => {
    render(<ToolPopularityChart data={emptyToolData} />)
    expect(screen.queryByTestId('bar-chart')).toBeNull()
  })
})

// ─── FormCompletionChart ────────────────────────────────────────────────────

describe('FormCompletionChart', () => {
  it('renders the default title', () => {
    render(<FormCompletionChart data={formData} />)
    expect(screen.getByText('Form Completion by Step')).toBeTruthy()
  })

  it('renders a custom title', () => {
    render(<FormCompletionChart data={formData} title="Completion Rates" />)
    expect(screen.getByText('Completion Rates')).toBeTruthy()
  })

  it('renders chart when data has values', () => {
    render(<FormCompletionChart data={formData} />)
    expect(screen.getByTestId('bar-chart')).toBeTruthy()
  })

  it('renders empty state when all values are zero', () => {
    render(<FormCompletionChart data={emptyFormData} />)
    expect(screen.getByText(/No form data yet/)).toBeTruthy()
  })

  it('does not render chart in empty state', () => {
    render(<FormCompletionChart data={emptyFormData} />)
    expect(screen.queryByTestId('bar-chart')).toBeNull()
  })
})

// ─── StepDurationChart ──────────────────────────────────────────────────────

describe('StepDurationChart', () => {
  it('renders the title', () => {
    render(<StepDurationChart data={durationData} />)
    expect(screen.getByText('Average Days per Step')).toBeTruthy()
  })

  it('renders chart when data has values', () => {
    render(<StepDurationChart data={durationData} />)
    expect(screen.getByTestId('bar-chart')).toBeTruthy()
  })

  it('renders empty state when all avgDays are zero', () => {
    render(<StepDurationChart data={emptyDurationData} />)
    expect(screen.getByText(/No step duration data yet/)).toBeTruthy()
  })

  it('does not render chart in empty state', () => {
    render(<StepDurationChart data={emptyDurationData} />)
    expect(screen.queryByTestId('bar-chart')).toBeNull()
  })
})

// ─── StepProgressChart ──────────────────────────────────────────────────────

describe('StepProgressChart', () => {
  it('renders the default title', () => {
    render(<StepProgressChart data={progressData} />)
    expect(screen.getByText('Projects by PIPS Step')).toBeTruthy()
  })

  it('renders a custom title', () => {
    render(<StepProgressChart data={progressData} title="Step Distribution" />)
    expect(screen.getByText('Step Distribution')).toBeTruthy()
  })

  it('renders chart when data has values', () => {
    render(<StepProgressChart data={progressData} />)
    expect(screen.getByTestId('bar-chart')).toBeTruthy()
  })

  it('renders empty state when all counts are zero', () => {
    render(<StepProgressChart data={emptyProgressData} />)
    expect(screen.getByText(/No project data yet/)).toBeTruthy()
  })

  it('does not render chart in empty state', () => {
    render(<StepProgressChart data={emptyProgressData} />)
    expect(screen.queryByTestId('bar-chart')).toBeNull()
  })
})
