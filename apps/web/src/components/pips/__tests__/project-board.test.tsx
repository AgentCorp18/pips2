import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectBoard } from '../project-board'
import type { BoardProject } from '../project-board'

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

const mockProjects: BoardProject[] = [
  {
    id: 'proj-1',
    name: 'Reduce Cycle Time',
    description: 'Cut cycle time by 20%',
    status: 'active',
    currentStep: 2,
    stepsCompleted: 1,
    ownerName: 'Alice',
    targetDate: '2026-06-15',
  },
  {
    id: 'proj-2',
    name: 'Improve Quality',
    description: null,
    status: 'completed',
    currentStep: 6,
    stepsCompleted: 6,
    ownerName: 'Bob',
    targetDate: null,
  },
  {
    id: 'proj-3',
    name: 'Reduce Waste',
    description: 'Lean initiative',
    status: 'on_hold',
    currentStep: 3,
    stepsCompleted: 2,
    ownerName: 'Carol',
    targetDate: '2026-09-01',
  },
]

/* ============================================================
   Tests — Column View (default layout: status as columns)
   ============================================================ */

describe('ProjectBoard — ColumnView', () => {
  it('renders the board with data-testid', () => {
    render(<ProjectBoard projects={mockProjects} />)
    expect(screen.getByTestId('project-board')).toBeInTheDocument()
  })

  it('renders all four status columns', () => {
    render(<ProjectBoard projects={mockProjects} />)
    expect(screen.getByTestId('project-board-column-active')).toBeInTheDocument()
    expect(screen.getByTestId('project-board-column-on_hold')).toBeInTheDocument()
    expect(screen.getByTestId('project-board-column-completed')).toBeInTheDocument()
    expect(screen.getByTestId('project-board-column-cancelled')).toBeInTheDocument()
  })

  it('renders column labels', () => {
    render(<ProjectBoard projects={mockProjects} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('On Hold')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })

  it('shows correct count in column badges', () => {
    render(<ProjectBoard projects={mockProjects} />)
    expect(screen.getByTestId('project-board-count-active')).toHaveTextContent('1')
    expect(screen.getByTestId('project-board-count-on_hold')).toHaveTextContent('1')
    expect(screen.getByTestId('project-board-count-completed')).toHaveTextContent('1')
    expect(screen.getByTestId('project-board-count-cancelled')).toHaveTextContent('0')
  })

  it('renders project names in the board', () => {
    render(<ProjectBoard projects={mockProjects} />)
    expect(screen.getByText('Reduce Cycle Time')).toBeInTheDocument()
    expect(screen.getByText('Improve Quality')).toBeInTheDocument()
    expect(screen.getByText('Reduce Waste')).toBeInTheDocument()
  })

  it('renders project links correctly', () => {
    render(<ProjectBoard projects={mockProjects} />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('/projects/proj-1')
    expect(hrefs).toContain('/projects/proj-2')
    expect(hrefs).toContain('/projects/proj-3')
  })

  it('renders current step info in board cards', () => {
    render(<ProjectBoard projects={mockProjects} />)
    expect(screen.getByText('Step 2: Analyze')).toBeInTheDocument()
    expect(screen.getByText('Step 6: Evaluate')).toBeInTheDocument()
    expect(screen.getByText('Step 3: Generate')).toBeInTheDocument()
  })

  it('renders owner names in board cards', () => {
    render(<ProjectBoard projects={mockProjects} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Carol')).toBeInTheDocument()
  })

  it('has region role with aria-label', () => {
    render(<ProjectBoard projects={mockProjects} />)
    expect(screen.getByRole('region', { name: 'Project board by status' })).toBeInTheDocument()
  })

  it('handles unknown status by grouping into active', () => {
    const unknownProject: BoardProject = {
      id: 'proj-x',
      name: 'Unknown Status Project',
      description: null,
      status: 'some_unknown_status',
      currentStep: 1,
      stepsCompleted: 0,
      ownerName: 'Dan',
      targetDate: null,
    }
    render(<ProjectBoard projects={[unknownProject]} />)
    expect(screen.getByTestId('project-board-count-active')).toHaveTextContent('1')
    expect(screen.getByText('Unknown Status Project')).toBeInTheDocument()
  })

  it('renders empty board when no projects', () => {
    render(<ProjectBoard projects={[]} />)
    expect(screen.getByTestId('project-board')).toBeInTheDocument()
    expect(screen.getByTestId('project-board-count-active')).toHaveTextContent('0')
    expect(screen.getByTestId('project-board-count-completed')).toHaveTextContent('0')
  })
})

/* ============================================================
   Tests — Swim Lane View (status rows, step columns)
   ============================================================ */

describe('ProjectBoard — SwimLaneView', () => {
  it('renders the board with data-testid', () => {
    render(<ProjectBoard projects={mockProjects} layout="swimlanes" />)
    expect(screen.getByTestId('project-board')).toBeInTheDocument()
  })

  it('has correct region aria-label', () => {
    render(<ProjectBoard projects={mockProjects} layout="swimlanes" />)
    expect(
      screen.getByRole('region', { name: 'Project board by step and status' }),
    ).toBeInTheDocument()
  })

  it('renders a row for each status', () => {
    render(<ProjectBoard projects={mockProjects} layout="swimlanes" />)
    expect(screen.getByTestId('swimlane-row-active')).toBeInTheDocument()
    expect(screen.getByTestId('swimlane-row-on_hold')).toBeInTheDocument()
    expect(screen.getByTestId('swimlane-row-completed')).toBeInTheDocument()
    expect(screen.getByTestId('swimlane-row-cancelled')).toBeInTheDocument()
  })

  it('renders step column headers', () => {
    render(<ProjectBoard projects={mockProjects} layout="swimlanes" />)
    expect(screen.getByText('Identify')).toBeInTheDocument()
    expect(screen.getByText('Analyze')).toBeInTheDocument()
    expect(screen.getByText('Generate')).toBeInTheDocument()
    expect(screen.getByText('Select & Plan')).toBeInTheDocument()
    expect(screen.getByText('Implement')).toBeInTheDocument()
    expect(screen.getByText('Evaluate')).toBeInTheDocument()
  })

  it('renders status row labels', () => {
    render(<ProjectBoard projects={mockProjects} layout="swimlanes" />)
    // Row labels appear inside the swimlane rows (not column headers)
    const activeRow = screen.getByTestId('swimlane-row-active')
    expect(activeRow).toHaveTextContent('Active')
    const onHoldRow = screen.getByTestId('swimlane-row-on_hold')
    expect(onHoldRow).toHaveTextContent('On Hold')
  })

  it('places projects in the correct cell (status row, step column)', () => {
    render(<ProjectBoard projects={mockProjects} layout="swimlanes" />)
    // proj-1: active status, step 2 → cell active-2
    const activeStep2Cell = screen.getByTestId('swimlane-cell-active-2')
    expect(activeStep2Cell).toHaveTextContent('Reduce Cycle Time')

    // proj-2: completed status, step 6 → cell completed-6
    const completedStep6Cell = screen.getByTestId('swimlane-cell-completed-6')
    expect(completedStep6Cell).toHaveTextContent('Improve Quality')

    // proj-3: on_hold status, step 3 → cell on_hold-3
    const onHoldStep3Cell = screen.getByTestId('swimlane-cell-on_hold-3')
    expect(onHoldStep3Cell).toHaveTextContent('Reduce Waste')
  })

  it('shows row project totals in row labels', () => {
    render(<ProjectBoard projects={mockProjects} layout="swimlanes" />)
    const activeRow = screen.getByTestId('swimlane-row-active')
    expect(activeRow).toHaveTextContent('1 project')
    const onHoldRow = screen.getByTestId('swimlane-row-on_hold')
    expect(onHoldRow).toHaveTextContent('1 project')
    const cancelledRow = screen.getByTestId('swimlane-row-cancelled')
    expect(cancelledRow).toHaveTextContent('0 projects')
  })

  it('renders project links in swimlane cells', () => {
    render(<ProjectBoard projects={mockProjects} layout="swimlanes" />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('/projects/proj-1')
    expect(hrefs).toContain('/projects/proj-2')
    expect(hrefs).toContain('/projects/proj-3')
  })

  it('handles unknown status by placing into active row', () => {
    const unknownProject: BoardProject = {
      id: 'proj-x',
      name: 'Unknown Status Project',
      description: null,
      status: 'some_unknown_status',
      currentStep: 1,
      stepsCompleted: 0,
      ownerName: 'Dan',
      targetDate: null,
    }
    render(<ProjectBoard projects={[unknownProject]} layout="swimlanes" />)
    const activeStep1Cell = screen.getByTestId('swimlane-cell-active-1')
    expect(activeStep1Cell).toHaveTextContent('Unknown Status Project')
  })

  it('renders empty swimlane board when no projects', () => {
    render(<ProjectBoard projects={[]} layout="swimlanes" />)
    expect(screen.getByTestId('project-board')).toBeInTheDocument()
    expect(screen.getByTestId('swimlane-row-active')).toBeInTheDocument()
    expect(screen.getByTestId('swimlane-row-completed')).toBeInTheDocument()
    // All cells should contain no project cards
    const activeStep1Cell = screen.getByTestId('swimlane-cell-active-1')
    expect(activeStep1Cell.querySelectorAll('a')).toHaveLength(0)
  })
})
