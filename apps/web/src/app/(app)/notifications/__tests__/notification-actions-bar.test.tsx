import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotificationActionsBar } from '../notification-actions-bar'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('../actions', () => ({
  markAllAsRead: vi.fn().mockResolvedValue({ error: null }),
}))

describe('NotificationActionsBar', () => {
  it('renders Mark all as read button when hasUnread is true', () => {
    render(<NotificationActionsBar hasUnread={true} />)
    expect(screen.getByText('Mark all as read')).toBeTruthy()
  })

  it('renders as a button element', () => {
    render(<NotificationActionsBar hasUnread={true} />)
    expect(screen.getByText('Mark all as read').closest('button')).toBeTruthy()
  })

  it('returns null when hasUnread is false', () => {
    const { container } = render(<NotificationActionsBar hasUnread={false} />)
    expect(container.innerHTML).toBe('')
  })
})
