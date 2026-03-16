import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TicketTableRow } from '../ticket-table-row'
import type { TicketRow } from '../ticket-list-table'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/components/ui/formatted-date', () => ({
  FormattedDate: ({ date, fallback }: { date?: string; fallback?: string }) =>
    date ? <span>{date}</span> : <span>{fallback ?? '--'}</span>,
}))

const TICKET: TicketRow = {
  id: 't-1',
  sequenceId: 'TK-42',
  title: 'Fix login button',
  status: 'todo',
  priority: 'high',
  type: 'bug',
  assigneeName: 'Alice',
  assigneeAvatar: null,
  dueDate: '2026-03-15',
  createdAt: '2026-03-01',
  updatedAt: '2026-03-10',
  reporterName: 'Carol',
  modifiedByName: 'Carol',
  projectId: 'proj-1',
  projectName: 'Auth Redesign',
}

// Wrap in table for valid HTML
const renderInTable = (ui: React.ReactNode) =>
  render(
    <table>
      <tbody>{ui}</tbody>
    </table>,
  )

describe('TicketTableRow', () => {
  it('renders sequence ID', () => {
    renderInTable(<TicketTableRow ticket={TICKET} isSelected={false} onToggle={vi.fn()} />)
    expect(screen.getByText('TK-42')).toBeTruthy()
  })

  it('renders ticket title', () => {
    renderInTable(<TicketTableRow ticket={TICKET} isSelected={false} onToggle={vi.fn()} />)
    expect(screen.getByText('Fix login button')).toBeTruthy()
  })

  it('renders status badge', () => {
    renderInTable(<TicketTableRow ticket={TICKET} isSelected={false} onToggle={vi.fn()} />)
    expect(screen.getByText('Todo')).toBeTruthy()
  })

  it('renders priority label', () => {
    renderInTable(<TicketTableRow ticket={TICKET} isSelected={false} onToggle={vi.fn()} />)
    expect(screen.getByText('High')).toBeTruthy()
  })

  it('renders type label', () => {
    renderInTable(<TicketTableRow ticket={TICKET} isSelected={false} onToggle={vi.fn()} />)
    expect(screen.getByText('Bug')).toBeTruthy()
  })

  it('renders assignee name', () => {
    renderInTable(<TicketTableRow ticket={TICKET} isSelected={false} onToggle={vi.fn()} />)
    expect(screen.getByText('Alice')).toBeTruthy()
  })

  it('renders checkbox with aria-label', () => {
    renderInTable(<TicketTableRow ticket={TICKET} isSelected={false} onToggle={vi.fn()} />)
    expect(screen.getByLabelText('Select TK-42')).toBeTruthy()
  })

  it('checkbox reflects isSelected state', () => {
    renderInTable(<TicketTableRow ticket={TICKET} isSelected={true} onToggle={vi.fn()} />)
    const checkbox = screen.getByLabelText('Select TK-42') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('renders dash for unassigned ticket', () => {
    const unassigned = { ...TICKET, assigneeName: null, assigneeAvatar: null }
    renderInTable(<TicketTableRow ticket={unassigned} isSelected={false} onToggle={vi.fn()} />)
    expect(screen.getAllByText('--').length).toBeGreaterThanOrEqual(1)
  })

  it('renders due date', () => {
    renderInTable(<TicketTableRow ticket={TICKET} isSelected={false} onToggle={vi.fn()} />)
    expect(screen.getByText('2026-03-15')).toBeTruthy()
  })
})
