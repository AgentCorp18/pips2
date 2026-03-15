import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TicketQuickFilters, getActiveQuickFilters } from '../ticket-quick-filters'

const mockReplace = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}))

describe('TicketQuickFilters', () => {
  beforeEach(() => {
    mockReplace.mockReset()
    mockSearchParams = new URLSearchParams()
  })

  it('renders Quick filters label', () => {
    render(<TicketQuickFilters />)
    expect(screen.getByText('Quick filters:')).toBeTruthy()
  })

  it('renders all 5 filter buttons', () => {
    render(<TicketQuickFilters />)
    expect(screen.getByText('My Open')).toBeTruthy()
    expect(screen.getByText('Overdue')).toBeTruthy()
    expect(screen.getByText('Created by Me')).toBeTruthy()
    expect(screen.getByText('Unassigned')).toBeTruthy()
    expect(screen.getByText('High Priority')).toBeTruthy()
  })

  it('navigates with quick filter param on click', () => {
    render(<TicketQuickFilters />)
    fireEvent.click(screen.getByText('My Open'))
    expect(mockReplace).toHaveBeenCalledWith('/tickets?quick=my_open')
  })

  it('uses custom basePath', () => {
    render(<TicketQuickFilters basePath="/tickets/board" />)
    fireEvent.click(screen.getByText('Overdue'))
    expect(mockReplace).toHaveBeenCalledWith('/tickets/board?quick=overdue')
  })

  it('removes filter when clicking active filter', () => {
    mockSearchParams = new URLSearchParams('quick=my_open')
    render(<TicketQuickFilters />)
    fireEvent.click(screen.getByText('My Open'))
    expect(mockReplace).toHaveBeenCalledWith('/tickets?')
  })

  it('appends filter when one is already active', () => {
    mockSearchParams = new URLSearchParams('quick=my_open')
    render(<TicketQuickFilters />)
    fireEvent.click(screen.getByText('Overdue'))
    expect(mockReplace).toHaveBeenCalledWith('/tickets?quick=my_open&quick=overdue')
  })
})

describe('getActiveQuickFilters', () => {
  it('returns empty array for no quick params', () => {
    const params = new URLSearchParams()
    expect(getActiveQuickFilters(params)).toEqual([])
  })

  it('returns valid quick filter keys', () => {
    const params = new URLSearchParams('quick=my_open&quick=overdue')
    expect(getActiveQuickFilters(params)).toEqual(['my_open', 'overdue'])
  })

  it('filters out invalid keys', () => {
    const params = new URLSearchParams('quick=my_open&quick=invalid')
    expect(getActiveQuickFilters(params)).toEqual(['my_open'])
  })
})
