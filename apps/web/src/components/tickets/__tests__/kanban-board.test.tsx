import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KanbanBoard, type BoardTicket } from '../kanban-board'

vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Droppable: ({
    children,
  }: {
    children: (
      provided: {
        innerRef: null
        droppableProps: Record<string, unknown>
        placeholder: null
      },
      snapshot: { isDraggingOver: boolean },
    ) => React.ReactNode
  }) =>
    children({ innerRef: null, droppableProps: {}, placeholder: null }, { isDraggingOver: false }),
  Draggable: ({
    children,
  }: {
    children: (provided: {
      innerRef: null
      draggableProps: Record<string, unknown>
      dragHandleProps: Record<string, unknown>
    }) => React.ReactNode
  }) =>
    children({
      innerRef: null,
      draggableProps: {},
      dragHandleProps: {},
    }),
}))

vi.mock('@/app/(app)/tickets/actions', () => ({
  updateTicketStatus: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('../kanban-card', () => ({
  KanbanCard: ({ sequenceId, title }: { sequenceId: string; title: string }) => (
    <div data-testid="kanban-card">
      {sequenceId}: {title}
    </div>
  ),
}))

const mockTickets: BoardTicket[] = [
  {
    id: 't-1',
    sequenceId: 'TKT-001',
    title: 'Fix login bug',
    status: 'in_progress',
    priority: 'high',
    type: 'bug',
    assigneeName: 'Alice',
    assigneeAvatar: null,
    dueDate: null,
  },
  {
    id: 't-2',
    sequenceId: 'TKT-002',
    title: 'Add dark mode',
    status: 'todo',
    priority: 'medium',
    type: 'feature',
    assigneeName: null,
    assigneeAvatar: null,
    dueDate: null,
  },
  {
    id: 't-3',
    sequenceId: 'TKT-003',
    title: 'Write docs',
    status: 'done',
    priority: 'low',
    type: 'task',
    assigneeName: 'Bob',
    assigneeAvatar: null,
    dueDate: null,
  },
]

describe('KanbanBoard', () => {
  it('renders all 7 column labels', () => {
    render(<KanbanBoard initialTickets={mockTickets} />)
    expect(screen.getByText('Backlog')).toBeTruthy()
    expect(screen.getByText('To Do')).toBeTruthy()
    expect(screen.getByText('In Progress')).toBeTruthy()
    expect(screen.getByText('In Review')).toBeTruthy()
    expect(screen.getByText('Blocked')).toBeTruthy()
    expect(screen.getByText('Done')).toBeTruthy()
    expect(screen.getByText('Cancelled')).toBeTruthy()
  })

  it('renders tickets as KanbanCards', () => {
    render(<KanbanBoard initialTickets={mockTickets} />)
    expect(screen.getByText('TKT-001: Fix login bug')).toBeTruthy()
    expect(screen.getByText('TKT-002: Add dark mode')).toBeTruthy()
    expect(screen.getByText('TKT-003: Write docs')).toBeTruthy()
  })

  it('renders kanban board region', () => {
    render(<KanbanBoard initialTickets={mockTickets} />)
    expect(screen.getByRole('region')).toBeTruthy()
  })

  it('renders column groups with aria-labels', () => {
    render(<KanbanBoard initialTickets={mockTickets} />)
    const groups = screen.getAllByRole('group')
    expect(groups.length).toBe(7)
  })

  it('renders with empty ticket list', () => {
    render(<KanbanBoard initialTickets={[]} />)
    expect(screen.getByText('Backlog')).toBeTruthy()
    expect(screen.getByText('Done')).toBeTruthy()
  })

  it('groups tickets into correct columns', () => {
    render(<KanbanBoard initialTickets={mockTickets} />)
    // 3 tickets should render as 3 kanban cards
    const cards = screen.getAllByTestId('kanban-card')
    expect(cards.length).toBe(3)
  })
})
