import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectListTable } from '../project-list-table'
import type { ProjectRow } from '../project-list-table'

/* ============================================================
   Mocks
   ============================================================ */

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
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

const mockProjects: ProjectRow[] = [
  {
    id: 'proj-1',
    name: 'Reduce Cycle Time',
    status: 'active',
    currentStep: 2,
    stepsCompleted: 1,
    ownerName: 'Alice',
    targetDate: '2026-06-15',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'proj-2',
    name: 'Improve Quality',
    status: 'completed',
    currentStep: 6,
    stepsCompleted: 6,
    ownerName: 'Bob',
    targetDate: null,
    createdAt: '2026-02-01T00:00:00Z',
  },
]

/* ============================================================
   Tests
   ============================================================ */

describe('ProjectListTable', () => {
  beforeEach(() => {
    mockPush.mockReset()
  })

  it('renders the table with data-testid', () => {
    render(<ProjectListTable projects={mockProjects} />)
    expect(screen.getByTestId('project-list-table')).toBeInTheDocument()
  })

  it('renders column headers', () => {
    render(<ProjectListTable projects={mockProjects} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Current Step')).toBeInTheDocument()
    expect(screen.getByText('Steps Completed')).toBeInTheDocument()
    expect(screen.getByText('Owner')).toBeInTheDocument()
    expect(screen.getByText('Target Date')).toBeInTheDocument()
  })

  it('renders project names', () => {
    render(<ProjectListTable projects={mockProjects} />)
    expect(screen.getByText('Reduce Cycle Time')).toBeInTheDocument()
    expect(screen.getByText('Improve Quality')).toBeInTheDocument()
  })

  it('renders status badges', () => {
    render(<ProjectListTable projects={mockProjects} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders current step info', () => {
    render(<ProjectListTable projects={mockProjects} />)
    expect(screen.getByText('Step 2: Analyze')).toBeInTheDocument()
    expect(screen.getByText('Step 6: Evaluate')).toBeInTheDocument()
  })

  it('renders steps completed fractions', () => {
    render(<ProjectListTable projects={mockProjects} />)
    expect(screen.getByText('1/6')).toBeInTheDocument()
    expect(screen.getByText('6/6')).toBeInTheDocument()
  })

  it('renders owner names', () => {
    render(<ProjectListTable projects={mockProjects} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows dash when target date is null', () => {
    render(<ProjectListTable projects={mockProjects} />)
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('navigates to project detail on row click', () => {
    render(<ProjectListTable projects={mockProjects} />)
    fireEvent.click(screen.getByTestId('project-row-proj-1'))
    expect(mockPush).toHaveBeenCalledWith('/projects/proj-1')
  })

  it('renders empty table when no projects', () => {
    render(<ProjectListTable projects={[]} />)
    expect(screen.getByTestId('project-list-table')).toBeInTheDocument()
    expect(screen.queryByText('Reduce Cycle Time')).not.toBeInTheDocument()
  })
})
