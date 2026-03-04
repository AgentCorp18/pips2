import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TicketFilterPanel } from '../ticket-filter-panel'

const mockPush = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}))

vi.mock('@/components/tickets/ticket-config', () => ({
  ALL_STATUSES: ['backlog', 'todo', 'in_progress', 'done'],
  ALL_PRIORITIES: ['critical', 'high', 'medium', 'low', 'none'],
  STATUS_CONFIG: {
    backlog: { label: 'Backlog' },
    todo: { label: 'Todo' },
    in_progress: { label: 'In Progress' },
    done: { label: 'Done' },
  },
  PRIORITY_CONFIG: {
    critical: { label: 'Critical' },
    high: { label: 'High' },
    medium: { label: 'Medium' },
    low: { label: 'Low' },
    none: { label: 'None' },
  },
  TYPE_CONFIG: {
    general: { label: 'General' },
    task: { label: 'Task' },
    bug: { label: 'Bug' },
    feature: { label: 'Feature' },
    pips_project: { label: 'PIPS Project' },
  },
}))

const MEMBERS = [{ user_id: 'u1', display_name: 'Alice' }]
const PROJECTS = [{ id: 'p1', name: 'Project Alpha' }]

describe('TicketFilterPanel', () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockSearchParams = new URLSearchParams()
  })

  it('renders Advanced Filters button', () => {
    render(<TicketFilterPanel members={MEMBERS} projects={PROJECTS} />)
    expect(screen.getByText('Advanced Filters')).toBeTruthy()
  })

  it('does not show filter panel when collapsed', () => {
    render(<TicketFilterPanel members={MEMBERS} projects={PROJECTS} />)
    expect(screen.queryByText('Status')).toBeNull()
  })

  it('shows filter panel when expanded', () => {
    render(<TicketFilterPanel members={MEMBERS} projects={PROJECTS} />)
    fireEvent.click(screen.getByText('Advanced Filters'))
    expect(screen.getByText('Status')).toBeTruthy()
    expect(screen.getByText('Priority')).toBeTruthy()
    expect(screen.getByText('Type')).toBeTruthy()
  })

  it('renders status filter chips when expanded', () => {
    render(<TicketFilterPanel members={MEMBERS} projects={PROJECTS} />)
    fireEvent.click(screen.getByText('Advanced Filters'))
    expect(screen.getByText('Backlog')).toBeTruthy()
    expect(screen.getByText('Todo')).toBeTruthy()
    expect(screen.getByText('In Progress')).toBeTruthy()
    expect(screen.getByText('Done')).toBeTruthy()
  })

  it('renders priority filter chips when expanded', () => {
    render(<TicketFilterPanel members={MEMBERS} projects={PROJECTS} />)
    fireEvent.click(screen.getByText('Advanced Filters'))
    expect(screen.getByText('Critical')).toBeTruthy()
    expect(screen.getByText('High')).toBeTruthy()
  })

  it('renders assignee dropdown with members', () => {
    render(<TicketFilterPanel members={MEMBERS} projects={PROJECTS} />)
    fireEvent.click(screen.getByText('Advanced Filters'))
    expect(screen.getByText('All members')).toBeTruthy()
    expect(screen.getByText('Alice')).toBeTruthy()
  })

  it('renders project dropdown with projects', () => {
    render(<TicketFilterPanel members={MEMBERS} projects={PROJECTS} />)
    fireEvent.click(screen.getByText('Advanced Filters'))
    expect(screen.getByText('All projects')).toBeTruthy()
    expect(screen.getByText('Project Alpha')).toBeTruthy()
  })

  it('navigates when clicking a status chip', () => {
    render(<TicketFilterPanel members={MEMBERS} projects={PROJECTS} />)
    fireEvent.click(screen.getByText('Advanced Filters'))
    fireEvent.click(screen.getByText('Todo'))
    expect(mockPush).toHaveBeenCalledWith('/tickets?status=todo')
  })

  it('shows active count badge when filters are active', () => {
    mockSearchParams = new URLSearchParams('status=todo')
    render(<TicketFilterPanel members={MEMBERS} projects={PROJECTS} />)
    expect(screen.getByText('1')).toBeTruthy()
  })

  it('shows Clear all button when filters are active', () => {
    mockSearchParams = new URLSearchParams('status=todo')
    render(<TicketFilterPanel members={MEMBERS} projects={PROJECTS} />)
    expect(screen.getByText('Clear all')).toBeTruthy()
  })

  it('does not show Clear all when no filters active', () => {
    render(<TicketFilterPanel members={MEMBERS} projects={PROJECTS} />)
    expect(screen.queryByText('Clear all')).toBeNull()
  })

  it('uses custom basePath', () => {
    render(<TicketFilterPanel members={MEMBERS} projects={PROJECTS} basePath="/tickets/board" />)
    fireEvent.click(screen.getByText('Advanced Filters'))
    fireEvent.click(screen.getByText('Todo'))
    expect(mockPush).toHaveBeenCalledWith('/tickets/board?status=todo')
  })
})
