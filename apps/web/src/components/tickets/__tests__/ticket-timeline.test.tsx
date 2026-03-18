import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TicketTimeline } from '../ticket-timeline'
import type { TimelineTicket } from '@/app/(app)/tickets/timeline/actions'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const SAMPLE_TICKETS: TimelineTicket[] = [
  {
    id: 't-1',
    title: 'Build timeline view',
    status: 'in_progress',
    priority: 'high',
    type: 'feature',
    due_date: '2026-04-01',
    started_at: '2026-03-15T10:00:00Z',
    created_at: '2026-03-10T08:00:00Z',
    resolved_at: null,
    assignee_name: 'Alice',
    assignee_id: 'u-1',
    project_title: 'PIPS 2.0',
    project_id: 'p-1',
    sequence_number: 101,
    parent_id: null,
  },
  {
    id: 't-2',
    title: 'Write tests',
    status: 'todo',
    priority: 'medium',
    type: 'task',
    due_date: '2026-03-25',
    started_at: null,
    created_at: '2026-03-12T00:00:00Z',
    resolved_at: null,
    assignee_name: 'Bob',
    assignee_id: 'u-2',
    project_title: null,
    project_id: null,
    sequence_number: 102,
    parent_id: 't-1',
  },
  {
    id: 't-3',
    title: 'Completed task',
    status: 'done',
    priority: 'low',
    type: 'task',
    due_date: '2026-03-20',
    started_at: '2026-03-10T00:00:00Z',
    created_at: '2026-03-08T00:00:00Z',
    resolved_at: '2026-03-18T15:30:00Z',
    assignee_name: null,
    assignee_id: null,
    project_title: 'Safety',
    project_id: 'p-2',
    sequence_number: 103,
    parent_id: null,
  },
]

describe('TicketTimeline', () => {
  it('renders the timeline container', () => {
    render(<TicketTimeline tickets={[]} prefix="TKT" />)
    expect(screen.getByTestId('ticket-timeline')).toBeTruthy()
  })

  it('shows empty state when no tickets', () => {
    render(<TicketTimeline tickets={[]} prefix="TKT" />)
    expect(screen.getByTestId('timeline-empty')).toBeTruthy()
    expect(screen.getByText('No tickets to display')).toBeTruthy()
  })

  it('renders ticket labels with sequence IDs', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    expect(screen.getByText('TKT-101')).toBeTruthy()
    expect(screen.getByText('TKT-102')).toBeTruthy()
    expect(screen.getByText('TKT-103')).toBeTruthy()
  })

  it('renders ticket bars', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    expect(screen.getByTestId('timeline-bar-t-1')).toBeTruthy()
    expect(screen.getByTestId('timeline-bar-t-2')).toBeTruthy()
    expect(screen.getByTestId('timeline-bar-t-3')).toBeTruthy()
  })

  it('renders zoom controls', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    expect(screen.getByTestId('timeline-zoom-in')).toBeTruthy()
    expect(screen.getByTestId('timeline-zoom-out')).toBeTruthy()
    expect(screen.getByTestId('timeline-zoom-level')).toBeTruthy()
  })

  it('shows initial zoom level as Weeks', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    expect(screen.getByTestId('timeline-zoom-level').textContent).toBe('Weeks')
  })

  it('zooms in when clicking zoom in button', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('timeline-zoom-in'))
    expect(screen.getByTestId('timeline-zoom-level').textContent).toBe('Days')
  })

  it('zooms out when clicking zoom out button', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('timeline-zoom-out'))
    expect(screen.getByTestId('timeline-zoom-level').textContent).toBe('Months')
  })

  it('disables zoom in at max zoom (Days)', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('timeline-zoom-in')) // → Days
    expect(screen.getByTestId('timeline-zoom-in')).toHaveProperty('disabled', true)
  })

  it('disables zoom out at min zoom (Months)', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('timeline-zoom-out')) // → Months
    expect(screen.getByTestId('timeline-zoom-out')).toHaveProperty('disabled', true)
  })

  it('renders today button', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    expect(screen.getByTestId('timeline-today-btn')).toBeTruthy()
  })

  it('renders today marker line', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    expect(screen.getByTestId('timeline-today-marker')).toBeTruthy()
  })

  it('renders status legend', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    expect(screen.getByText('Status:')).toBeTruthy()
    expect(screen.getByText('in progress')).toBeTruthy()
    expect(screen.getByText('done')).toBeTruthy()
  })

  it('links ticket labels to detail pages', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    const label = screen.getByTestId('timeline-label-t-1')
    expect(label.getAttribute('href')).toBe('/tickets/t-1')
  })

  it('links ticket bars to detail pages', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    const bar = screen.getByTestId('timeline-bar-t-1')
    expect(bar.getAttribute('href')).toBe('/tickets/t-1')
  })

  it('renders chart container', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    expect(screen.getByTestId('timeline-chart')).toBeTruthy()
  })

  it('renders rows for each ticket', () => {
    render(<TicketTimeline tickets={SAMPLE_TICKETS} prefix="TKT" />)
    expect(screen.getByTestId('timeline-row-t-1')).toBeTruthy()
    expect(screen.getByTestId('timeline-row-t-2')).toBeTruthy()
    expect(screen.getByTestId('timeline-row-t-3')).toBeTruthy()
  })
})
