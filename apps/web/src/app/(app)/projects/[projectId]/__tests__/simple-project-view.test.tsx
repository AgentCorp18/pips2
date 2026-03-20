import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SimpleProjectView } from '../simple-project-view'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('../../actions', () => ({
  convertToPips: vi.fn().mockResolvedValue({ data: { projectId: 'proj-1' } }),
}))

const baseProps = {
  projectId: 'proj-1',
  tickets: [],
  totalTickets: 0,
  completedTickets: 0,
}

describe('SimpleProjectView', () => {
  it('renders the action bar with Convert to PIPS button', () => {
    render(<SimpleProjectView {...baseProps} />)
    expect(screen.getByTestId('convert-to-pips-button')).toBeTruthy()
  })

  it('renders Create Ticket button', () => {
    render(<SimpleProjectView {...baseProps} />)
    expect(screen.getByTestId('create-ticket-button')).toBeTruthy()
  })

  it('shows stats with zero counts', () => {
    render(<SimpleProjectView {...baseProps} />)
    expect(screen.getByTestId('simple-project-stats')).toBeTruthy()
    // Total tickets = 0
    const allZeros = screen.getAllByText('0')
    expect(allZeros.length).toBeGreaterThanOrEqual(2)
  })

  it('shows empty state when no tickets', () => {
    render(<SimpleProjectView {...baseProps} />)
    expect(screen.getByTestId('simple-project-empty')).toBeTruthy()
    expect(screen.getByText('No tickets yet')).toBeTruthy()
  })

  it('renders ticket list when tickets are provided', () => {
    const tickets = [
      {
        id: 'tk-1',
        sequenceId: 'TKT-1',
        title: 'First ticket',
        status: 'to_do',
        priority: 'medium',
      },
      { id: 'tk-2', sequenceId: 'TKT-2', title: 'Second ticket', status: 'done', priority: 'high' },
    ]
    render(
      <SimpleProjectView
        projectId="proj-1"
        tickets={tickets}
        totalTickets={2}
        completedTickets={1}
      />,
    )
    expect(screen.getByTestId('simple-project-ticket-list')).toBeTruthy()
    expect(screen.getByText('First ticket')).toBeTruthy()
    expect(screen.getByText('Second ticket')).toBeTruthy()
  })

  it('shows completion percentage in stats', () => {
    render(
      <SimpleProjectView
        projectId="proj-1"
        tickets={[
          {
            id: 'tk-1',
            sequenceId: 'TKT-1',
            title: 'Done ticket',
            status: 'done',
            priority: 'low',
          },
        ]}
        totalTickets={1}
        completedTickets={1}
      />,
    )
    expect(screen.getByText('100%')).toBeTruthy()
  })

  it('shows "Show all" button when more than 10 tickets', () => {
    const tickets = Array.from({ length: 12 }, (_, i) => ({
      id: `tk-${i}`,
      sequenceId: `TKT-${i + 1}`,
      title: `Ticket ${i + 1}`,
      status: 'to_do',
      priority: 'medium',
    }))
    render(
      <SimpleProjectView
        projectId="proj-1"
        tickets={tickets}
        totalTickets={12}
        completedTickets={0}
      />,
    )
    expect(screen.getByTestId('show-all-tickets-button')).toBeTruthy()
    expect(screen.getByText('Show all 12 tickets')).toBeTruthy()
  })
})
