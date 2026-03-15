import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TicketListTable, type TicketRow } from '../ticket-list-table'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('../bulk-actions-bar', () => ({
  BulkActionsBar: ({ selectedIds }: { selectedIds: string[] }) => (
    <div data-testid="bulk-bar">{selectedIds.length} selected</div>
  ),
}))

vi.mock('../ticket-table-row', () => ({
  TicketTableRow: ({ ticket }: { ticket: { sequenceId: string; title: string } }) => (
    <tr>
      <td>{ticket.sequenceId}</td>
      <td>{ticket.title}</td>
    </tr>
  ),
}))

const mockTickets: TicketRow[] = [
  {
    id: 't-1',
    sequenceId: 'TKT-001',
    title: 'Fix login bug',
    status: 'in_progress',
    priority: 'high',
    type: 'bug',
    assigneeName: 'Alice',
    assigneeAvatar: null,
    dueDate: '2026-04-01',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-05',
    reporterName: 'Bob',
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
    createdAt: '2026-03-02',
    updatedAt: '2026-03-02',
    reporterName: null,
  },
]

describe('TicketListTable', () => {
  it('renders table header columns', () => {
    render(
      <TicketListTable
        tickets={mockTickets}
        total={2}
        page={1}
        perPage={20}
        sortBy="created_at"
        sortOrder="desc"
      />,
    )
    expect(screen.getByText('ID')).toBeTruthy()
    expect(screen.getByText('Title')).toBeTruthy()
    expect(screen.getByText('Status')).toBeTruthy()
    expect(screen.getByText('Priority')).toBeTruthy()
    expect(screen.getByText('Type')).toBeTruthy()
    expect(screen.getByText('Assignee')).toBeTruthy()
    expect(screen.getByText('Due Date')).toBeTruthy()
    expect(screen.getByText('Created')).toBeTruthy()
  })

  it('renders ticket rows', () => {
    render(
      <TicketListTable
        tickets={mockTickets}
        total={2}
        page={1}
        perPage={20}
        sortBy="created_at"
        sortOrder="desc"
      />,
    )
    expect(screen.getByText('TKT-001')).toBeTruthy()
    expect(screen.getByText('Fix login bug')).toBeTruthy()
    expect(screen.getByText('TKT-002')).toBeTruthy()
    expect(screen.getByText('Add dark mode')).toBeTruthy()
  })

  it('renders select all checkbox', () => {
    render(
      <TicketListTable
        tickets={mockTickets}
        total={2}
        page={1}
        perPage={20}
        sortBy="created_at"
        sortOrder="desc"
      />,
    )
    expect(screen.getByLabelText('Select all tickets')).toBeTruthy()
  })

  it('renders pagination showing range', () => {
    render(
      <TicketListTable
        tickets={mockTickets}
        total={50}
        page={1}
        perPage={20}
        sortBy="created_at"
        sortOrder="desc"
      />,
    )
    expect(screen.getByText('Showing 1-20 of 50')).toBeTruthy()
  })

  it('renders Previous and Next page buttons', () => {
    render(
      <TicketListTable
        tickets={mockTickets}
        total={50}
        page={1}
        perPage={20}
        sortBy="created_at"
        sortOrder="desc"
      />,
    )
    expect(screen.getByLabelText('Previous page')).toBeTruthy()
    expect(screen.getByLabelText('Next page')).toBeTruthy()
  })

  it('disables Previous on first page', () => {
    render(
      <TicketListTable
        tickets={mockTickets}
        total={50}
        page={1}
        perPage={20}
        sortBy="created_at"
        sortOrder="desc"
      />,
    )
    expect(screen.getByLabelText('Previous page')).toBeDisabled()
  })

  it('does not show pagination when total is 0', () => {
    render(
      <TicketListTable
        tickets={[]}
        total={0}
        page={1}
        perPage={20}
        sortBy="created_at"
        sortOrder="desc"
      />,
    )
    expect(screen.queryByText(/Showing/)).toBeNull()
  })

  it('does not show bulk actions bar initially', () => {
    render(
      <TicketListTable
        tickets={mockTickets}
        total={2}
        page={1}
        perPage={20}
        sortBy="created_at"
        sortOrder="desc"
      />,
    )
    expect(screen.queryByTestId('bulk-bar')).toBeNull()
  })
})
