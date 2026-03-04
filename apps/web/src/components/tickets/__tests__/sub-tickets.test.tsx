import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SubTickets } from '../sub-tickets'
import type { TicketStatus, TicketPriority } from '@/types/tickets'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/components/tickets/ticket-config', () => ({
  STATUS_CONFIG: {
    backlog: { label: 'Backlog', className: 'bg-gray-100' },
    todo: { label: 'Todo', className: 'bg-blue-100' },
    in_progress: { label: 'In Progress', className: 'bg-amber-100' },
    in_review: { label: 'In Review', className: 'bg-purple-100' },
    blocked: { label: 'Blocked', className: 'bg-red-100' },
    done: { label: 'Done', className: 'bg-green-100' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-100' },
  },
}))

type ChildTicket = {
  id: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  assignee: { id: string; display_name: string; avatar_url: string | null } | null
}

const CHILD_TICKETS: ChildTicket[] = [
  {
    id: 'child-1',
    title: 'Fix login button',
    status: 'todo',
    priority: 'high',
    assignee: { id: 'u1', display_name: 'Alice', avatar_url: null },
  },
  {
    id: 'child-2',
    title: 'Update tests',
    status: 'done',
    priority: 'medium',
    assignee: null,
  },
]

describe('SubTickets', () => {
  it('renders Sub-Tickets heading', () => {
    render(<SubTickets parentTicketId="p-1" tickets={CHILD_TICKETS} />)
    expect(screen.getByText('Sub-Tickets')).toBeTruthy()
  })

  it('renders Add Sub-Ticket link', () => {
    render(<SubTickets parentTicketId="p-1" tickets={CHILD_TICKETS} />)
    const link = screen.getByText('Add Sub-Ticket')
    expect(link.closest('a')?.getAttribute('href')).toBe('/tickets/new?parent=p-1')
  })

  it('renders progress percentage', () => {
    render(<SubTickets parentTicketId="p-1" tickets={CHILD_TICKETS} />)
    expect(screen.getByText('50% complete')).toBeTruthy()
  })

  it('renders done count', () => {
    render(<SubTickets parentTicketId="p-1" tickets={CHILD_TICKETS} />)
    expect(screen.getByText('1/2 done')).toBeTruthy()
  })

  it('renders child ticket titles', () => {
    render(<SubTickets parentTicketId="p-1" tickets={CHILD_TICKETS} />)
    expect(screen.getByText('Fix login button')).toBeTruthy()
    expect(screen.getByText('Update tests')).toBeTruthy()
  })

  it('renders status badges for child tickets', () => {
    render(<SubTickets parentTicketId="p-1" tickets={CHILD_TICKETS} />)
    expect(screen.getByText('Todo')).toBeTruthy()
    expect(screen.getByText('Done')).toBeTruthy()
  })

  it('renders assignee name', () => {
    render(<SubTickets parentTicketId="p-1" tickets={CHILD_TICKETS} />)
    expect(screen.getByText('Alice')).toBeTruthy()
  })

  it('links child tickets to detail page', () => {
    render(<SubTickets parentTicketId="p-1" tickets={CHILD_TICKETS} />)
    const link = screen.getByText('Fix login button').closest('a')
    expect(link?.getAttribute('href')).toBe('/tickets/child-1')
  })

  it('shows empty state with no child tickets', () => {
    render(<SubTickets parentTicketId="p-1" tickets={[]} />)
    expect(screen.getByText('No sub-tickets yet')).toBeTruthy()
  })

  it('does not show progress bar with no tickets', () => {
    const { container } = render(<SubTickets parentTicketId="p-1" tickets={[]} />)
    expect(container.querySelector('[role="progressbar"]')).toBeNull()
  })

  it('renders child tickets as list items', () => {
    const { container } = render(<SubTickets parentTicketId="p-1" tickets={CHILD_TICKETS} />)
    const listItems = container.querySelectorAll('li')
    expect(listItems.length).toBe(2)
  })
})
