import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TicketCalendar } from '../ticket-calendar'
import type { CalendarTicket } from '@/app/(app)/tickets/calendar/actions'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}))

const SAMPLE_TICKETS: CalendarTicket[] = [
  {
    id: 't-1',
    title: 'Fix login bug',
    status: 'in_progress',
    priority: 'high',
    due_date: '2026-03-15',
    assignee_name: 'Alice',
    project_title: 'Auth Project',
    sequence_number: 42,
  },
  {
    id: 't-2',
    title: 'Update docs',
    status: 'todo',
    priority: 'medium',
    due_date: '2026-03-15',
    assignee_name: 'Bob',
    project_title: null,
    sequence_number: 43,
  },
  {
    id: 't-3',
    title: 'Deploy v2',
    status: 'backlog',
    priority: 'low',
    due_date: '2026-03-20',
    assignee_name: null,
    project_title: 'Infra',
    sequence_number: 44,
  },
]

describe('TicketCalendar', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders the calendar grid', () => {
    render(<TicketCalendar tickets={[]} year={2026} month={3} prefix="TKT" />)
    expect(screen.getByTestId('ticket-calendar')).toBeTruthy()
  })

  it('displays the correct month label', () => {
    render(<TicketCalendar tickets={[]} year={2026} month={3} prefix="TKT" />)
    expect(screen.getByTestId('calendar-month-label').textContent).toBe('March 2026')
  })

  it('renders day name headers', () => {
    render(<TicketCalendar tickets={[]} year={2026} month={3} prefix="TKT" />)
    expect(screen.getByText('Mon')).toBeTruthy()
    expect(screen.getByText('Tue')).toBeTruthy()
    expect(screen.getByText('Wed')).toBeTruthy()
    expect(screen.getByText('Thu')).toBeTruthy()
    expect(screen.getByText('Fri')).toBeTruthy()
    expect(screen.getByText('Sat')).toBeTruthy()
    expect(screen.getByText('Sun')).toBeTruthy()
  })

  it('renders tickets on the correct dates', () => {
    render(<TicketCalendar tickets={SAMPLE_TICKETS} year={2026} month={3} prefix="TKT" />)
    // March 15 should have 2 tickets visible as pills
    expect(screen.getByText('Fix login bug')).toBeTruthy()
    expect(screen.getByText('Update docs')).toBeTruthy()
    // March 20 should have 1 ticket
    expect(screen.getByText('Deploy v2')).toBeTruthy()
  })

  it('navigates to previous month on click', () => {
    render(<TicketCalendar tickets={[]} year={2026} month={3} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('calendar-prev-month'))
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('month=2'))
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('year=2026'))
  })

  it('navigates to next month on click', () => {
    render(<TicketCalendar tickets={[]} year={2026} month={3} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('calendar-next-month'))
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('month=4'))
  })

  it('wraps from January to previous year December', () => {
    render(<TicketCalendar tickets={[]} year={2026} month={1} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('calendar-prev-month'))
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('month=12'))
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('year=2025'))
  })

  it('wraps from December to next year January', () => {
    render(<TicketCalendar tickets={[]} year={2026} month={12} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('calendar-next-month'))
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('month=1'))
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('year=2027'))
  })

  it('shows "Today" button', () => {
    render(<TicketCalendar tickets={[]} year={2026} month={3} prefix="TKT" />)
    expect(screen.getByTestId('calendar-today-btn')).toBeTruthy()
  })

  it('shows detail panel when a date with tickets is clicked', () => {
    render(<TicketCalendar tickets={SAMPLE_TICKETS} year={2026} month={3} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('calendar-day-2026-03-15'))
    expect(screen.getByTestId('calendar-detail-panel')).toBeTruthy()
    expect(screen.getByTestId('calendar-ticket-t-1')).toBeTruthy()
    expect(screen.getByTestId('calendar-ticket-t-2')).toBeTruthy()
  })

  it('shows ticket prefix and sequence in detail panel', () => {
    render(<TicketCalendar tickets={SAMPLE_TICKETS} year={2026} month={3} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('calendar-day-2026-03-15'))
    expect(screen.getByText('TKT-42')).toBeTruthy()
    expect(screen.getByText('TKT-43')).toBeTruthy()
  })

  it('shows empty message when clicking a date with no tickets', () => {
    render(<TicketCalendar tickets={SAMPLE_TICKETS} year={2026} month={3} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('calendar-day-2026-03-01'))
    expect(screen.getByText('No tickets due on this date.')).toBeTruthy()
  })

  it('hides detail panel on second click (toggle)', () => {
    render(<TicketCalendar tickets={SAMPLE_TICKETS} year={2026} month={3} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('calendar-day-2026-03-15'))
    expect(screen.getByTestId('calendar-detail-panel')).toBeTruthy()
    fireEvent.click(screen.getByTestId('calendar-day-2026-03-15'))
    expect(screen.queryByTestId('calendar-detail-panel')).toBeNull()
  })

  it('shows +N more when more than 3 tickets on same date', () => {
    const manyTickets: CalendarTicket[] = Array.from({ length: 5 }, (_, i) => ({
      id: `t-${i}`,
      title: `Ticket ${i}`,
      status: 'todo',
      priority: 'medium',
      due_date: '2026-03-10',
      assignee_name: null,
      project_title: null,
      sequence_number: i + 1,
    }))
    render(<TicketCalendar tickets={manyTickets} year={2026} month={3} prefix="TKT" />)
    expect(screen.getByText('+2 more')).toBeTruthy()
  })

  it('renders project and assignee in detail panel', () => {
    render(<TicketCalendar tickets={SAMPLE_TICKETS} year={2026} month={3} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('calendar-day-2026-03-15'))
    expect(screen.getByText('Auth Project')).toBeTruthy()
    expect(screen.getByText('Alice')).toBeTruthy()
  })

  it('renders priority dots with correct aria labels in detail panel', () => {
    render(<TicketCalendar tickets={SAMPLE_TICKETS} year={2026} month={3} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('calendar-day-2026-03-15'))
    expect(screen.getByLabelText('Priority: high')).toBeTruthy()
    expect(screen.getByLabelText('Priority: medium')).toBeTruthy()
  })

  it('renders status badge in detail panel', () => {
    render(<TicketCalendar tickets={SAMPLE_TICKETS} year={2026} month={3} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('calendar-day-2026-03-15'))
    expect(screen.getByText('in progress')).toBeTruthy()
    expect(screen.getByText('todo')).toBeTruthy()
  })
})
