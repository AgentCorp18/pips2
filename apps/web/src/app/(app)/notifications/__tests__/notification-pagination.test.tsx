import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotificationPagination } from '../notification-pagination'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('NotificationPagination', () => {
  it('returns null when total fits in one page', () => {
    const { container } = render(<NotificationPagination total={5} offset={0} limit={10} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders pagination when multiple pages', () => {
    render(<NotificationPagination total={25} offset={0} limit={10} />)
    expect(screen.getByText('Previous')).toBeTruthy()
    expect(screen.getByText('Next')).toBeTruthy()
  })

  it('shows page info', () => {
    render(<NotificationPagination total={25} offset={0} limit={10} />)
    expect(screen.getByText('Page 1 of 3')).toBeTruthy()
  })

  it('shows showing range', () => {
    render(<NotificationPagination total={25} offset={0} limit={10} />)
    expect(screen.getByText(/Showing 1/)).toBeTruthy()
  })

  it('disables Previous on first page', () => {
    render(<NotificationPagination total={25} offset={0} limit={10} />)
    expect(screen.getByText('Previous').closest('button')?.disabled).toBe(true)
  })

  it('disables Next on last page', () => {
    render(<NotificationPagination total={25} offset={20} limit={10} />)
    expect(screen.getByText('Next').closest('button')?.disabled).toBe(true)
  })

  it('enables Previous on page 2', () => {
    render(<NotificationPagination total={25} offset={10} limit={10} />)
    expect(screen.getByText('Previous').closest('button')?.disabled).toBe(false)
  })

  it('shows page 2 of 3 at offset 10', () => {
    render(<NotificationPagination total={25} offset={10} limit={10} />)
    expect(screen.getByText('Page 2 of 3')).toBeTruthy()
  })
})
