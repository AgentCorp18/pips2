import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotificationItem } from '../notification-item'
import type { Notification } from '@/types/notifications'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('../actions', () => ({
  markAsRead: vi.fn().mockResolvedValue(undefined),
}))

const BASE_NOTIFICATION: Notification = {
  id: 'n-1',
  org_id: 'org-1',
  user_id: 'u-1',
  type: 'ticket_assigned',
  title: 'You were assigned a ticket',
  body: 'Ticket TK-42 was assigned to you',
  entity_type: 'ticket',
  entity_id: 't-42',
  read_at: null,
  email_sent: false,
  created_at: new Date().toISOString(),
}

describe('NotificationItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders notification title', () => {
    render(<NotificationItem notification={BASE_NOTIFICATION} />)
    expect(screen.getByText('You were assigned a ticket')).toBeTruthy()
  })

  it('renders notification body', () => {
    render(<NotificationItem notification={BASE_NOTIFICATION} />)
    expect(screen.getByText('Ticket TK-42 was assigned to you')).toBeTruthy()
  })

  it('renders Mark as read button for unread', () => {
    render(<NotificationItem notification={BASE_NOTIFICATION} />)
    expect(screen.getByLabelText('Mark as read')).toBeTruthy()
  })

  it('hides Mark as read button when already read', () => {
    const readNotification = { ...BASE_NOTIFICATION, read_at: '2026-01-01T00:00:00Z' }
    render(<NotificationItem notification={readNotification} />)
    expect(screen.queryByLabelText('Mark as read')).toBeNull()
  })

  it('renders as a button role', () => {
    render(<NotificationItem notification={BASE_NOTIFICATION} />)
    expect(screen.getByRole('button', { name: 'Mark as read' })).toBeTruthy()
  })

  it('renders without body when body is null', () => {
    const noBody = { ...BASE_NOTIFICATION, body: null }
    render(<NotificationItem notification={noBody} />)
    expect(screen.getByText('You were assigned a ticket')).toBeTruthy()
    expect(screen.queryByText('Ticket TK-42 was assigned to you')).toBeNull()
  })

  it('renders time ago text', () => {
    render(<NotificationItem notification={BASE_NOTIFICATION} />)
    // formatDistanceToNow will produce something like "less than a minute ago"
    const timeEl = screen.getByText(/ago|just now/i)
    expect(timeEl).toBeTruthy()
  })

  it('renders unread indicator dot', () => {
    const { container } = render(<NotificationItem notification={BASE_NOTIFICATION} />)
    const dot = container.querySelector('.h-2.w-2.rounded-full')
    expect(dot).toBeTruthy()
  })
})
