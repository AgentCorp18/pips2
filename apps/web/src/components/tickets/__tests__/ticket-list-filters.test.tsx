import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TicketListFilters } from '../ticket-list-filters'

const mockPush = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}))

const MEMBERS = [
  { user_id: 'u1', display_name: 'Alice' },
  { user_id: 'u2', display_name: 'Bob' },
]

describe('TicketListFilters', () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockSearchParams = new URLSearchParams()
  })

  it('renders search input', () => {
    render(<TicketListFilters members={MEMBERS} />)
    expect(screen.getByPlaceholderText('Search tickets...')).toBeTruthy()
  })

  it('does not show Clear button when no filters active', () => {
    render(<TicketListFilters members={MEMBERS} />)
    expect(screen.queryByText('Clear')).toBeNull()
  })

  it('shows Clear button when search filter is active', () => {
    mockSearchParams = new URLSearchParams('search=bug')
    render(<TicketListFilters members={MEMBERS} />)
    expect(screen.getByText('Clear')).toBeTruthy()
  })

  it('shows Clear button when status filter is active', () => {
    mockSearchParams = new URLSearchParams('status=todo')
    render(<TicketListFilters members={MEMBERS} />)
    expect(screen.getByText('Clear')).toBeTruthy()
  })

  it('navigates to /tickets on Clear click', () => {
    mockSearchParams = new URLSearchParams('status=todo')
    render(<TicketListFilters members={MEMBERS} />)
    fireEvent.click(screen.getByText('Clear'))
    expect(mockPush).toHaveBeenCalledWith('/tickets')
  })

  it('navigates with search param on Enter', () => {
    render(<TicketListFilters members={MEMBERS} />)
    const input = screen.getByPlaceholderText('Search tickets...')
    fireEvent.keyDown(input, { key: 'Enter', currentTarget: { value: 'login bug' } })
    expect(mockPush).toHaveBeenCalled()
  })
})
