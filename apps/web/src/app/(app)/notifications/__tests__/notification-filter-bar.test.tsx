import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationFilterBar } from '../notification-filter-bar'

const mockReplace = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}))

describe('NotificationFilterBar', () => {
  beforeEach(() => {
    mockReplace.mockClear()
  })

  it('renders all filter chips', () => {
    render(<NotificationFilterBar activeFilter="all" />)
    expect(screen.getByTestId('notification-filter-all')).toBeTruthy()
    expect(screen.getByTestId('notification-filter-assigned')).toBeTruthy()
    expect(screen.getByTestId('notification-filter-mentions')).toBeTruthy()
    expect(screen.getByTestId('notification-filter-updates')).toBeTruthy()
  })

  it('renders the filter bar container', () => {
    render(<NotificationFilterBar activeFilter="all" />)
    expect(screen.getByTestId('notification-filter-bar')).toBeTruthy()
  })

  it('navigates with filter param when a filter chip is clicked', () => {
    render(<NotificationFilterBar activeFilter="all" />)
    fireEvent.click(screen.getByTestId('notification-filter-assigned'))
    expect(mockReplace).toHaveBeenCalledWith('/notifications?filter=assigned')
  })

  it('removes filter param when "All" is clicked', () => {
    render(<NotificationFilterBar activeFilter="assigned" />)
    fireEvent.click(screen.getByTestId('notification-filter-all'))
    expect(mockReplace).toHaveBeenCalledWith('/notifications?')
  })

  it('displays correct labels', () => {
    render(<NotificationFilterBar activeFilter="all" />)
    expect(screen.getByText('All')).toBeTruthy()
    expect(screen.getByText('Assigned')).toBeTruthy()
    expect(screen.getByText('Mentions')).toBeTruthy()
    expect(screen.getByText('Updates')).toBeTruthy()
  })
})
