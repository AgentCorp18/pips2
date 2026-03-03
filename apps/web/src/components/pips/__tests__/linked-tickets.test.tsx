import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LinkedTickets } from '../linked-tickets'

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

/* ============================================================
   Helpers
   ============================================================ */

const sampleTickets = [
  {
    id: 't-1',
    title: 'Fix login bug',
    status: 'done',
    priority: 'high',
    assignee: { display_name: 'Alice' },
  },
  {
    id: 't-2',
    title: 'Add validation',
    status: 'in_progress',
    priority: 'medium',
    assignee: { display_name: 'Bob' },
  },
  {
    id: 't-3',
    title: 'Update docs',
    status: 'todo',
    priority: 'low',
    assignee: null,
  },
]

/* ============================================================
   Tests
   ============================================================ */

describe('LinkedTickets', () => {
  it('renders the "Linked Tickets" heading', () => {
    render(<LinkedTickets projectId="proj-1" tickets={sampleTickets} />)
    expect(screen.getByText('Linked Tickets')).toBeInTheDocument()
  })

  it('renders all ticket titles', () => {
    render(<LinkedTickets projectId="proj-1" tickets={sampleTickets} />)
    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
    expect(screen.getByText('Add validation')).toBeInTheDocument()
    expect(screen.getByText('Update docs')).toBeInTheDocument()
  })

  it('shows the done/total count', () => {
    render(<LinkedTickets projectId="proj-1" tickets={sampleTickets} />)
    expect(screen.getByText('1/3 done')).toBeInTheDocument()
  })

  it('links each ticket to the correct URL', () => {
    render(<LinkedTickets projectId="proj-1" tickets={sampleTickets} />)
    const links = screen.getAllByRole('link')
    const ticketLinks = links.filter((l) => l.getAttribute('href')?.startsWith('/tickets/'))
    expect(ticketLinks).toHaveLength(3)
    expect(ticketLinks[0]).toHaveAttribute('href', '/tickets/t-1')
    expect(ticketLinks[1]).toHaveAttribute('href', '/tickets/t-2')
    expect(ticketLinks[2]).toHaveAttribute('href', '/tickets/t-3')
  })

  it('renders "View Board" link with project_id', () => {
    render(<LinkedTickets projectId="proj-1" tickets={sampleTickets} />)
    const viewBoard = screen.getByRole('link', { name: /view board/i })
    expect(viewBoard).toHaveAttribute('href', '/tickets?project_id=proj-1')
  })

  it('shows status badges for each ticket', () => {
    render(<LinkedTickets projectId="proj-1" tickets={sampleTickets} />)
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })

  it('shows assignee names when present', () => {
    render(<LinkedTickets projectId="proj-1" tickets={sampleTickets} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows empty message when no tickets', () => {
    render(<LinkedTickets projectId="proj-1" tickets={[]} />)
    expect(screen.getByText(/no tickets linked to this project yet/i)).toBeInTheDocument()
  })

  it('does not show the done count when no tickets', () => {
    render(<LinkedTickets projectId="proj-1" tickets={[]} />)
    expect(screen.queryByText(/done/i)).not.toBeInTheDocument()
  })

  it('renders progress bar when tickets exist', () => {
    const { container } = render(<LinkedTickets projectId="proj-1" tickets={sampleTickets} />)
    const progressTrack = container.querySelector('.h-2.w-full.overflow-hidden')
    expect(progressTrack).toBeInTheDocument()
  })

  it('does not render progress bar when no tickets', () => {
    const { container } = render(<LinkedTickets projectId="proj-1" tickets={[]} />)
    const progressTrack = container.querySelector('.h-2.w-full.overflow-hidden')
    expect(progressTrack).not.toBeInTheDocument()
  })

  it('applies strikethrough to completed ticket titles', () => {
    render(<LinkedTickets projectId="proj-1" tickets={sampleTickets} />)
    const doneTitle = screen.getByText('Fix login bug')
    expect(doneTitle.className).toContain('line-through')
  })

  it('shows all tickets as done when all are done', () => {
    const allDone = sampleTickets.map((t) => ({ ...t, status: 'done' }))
    render(<LinkedTickets projectId="proj-1" tickets={allDone} />)
    expect(screen.getByText('3/3 done')).toBeInTheDocument()
  })
})
