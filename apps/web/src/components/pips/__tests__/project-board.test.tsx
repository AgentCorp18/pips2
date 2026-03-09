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
   Tests
   ============================================================ */

describe('ProjectBoard', () => {
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
