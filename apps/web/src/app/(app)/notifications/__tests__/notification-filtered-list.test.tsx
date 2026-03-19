import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotificationFilteredList } from '../notification-filtered-list'
import type { Notification } from '@/types/notifications'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('../actions', () => ({
  markAsRead: vi.fn().mockResolvedValue({}),
}))

const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: crypto.randomUUID(),
  org_id: 'org-1',
  user_id: 'user-1',
  type: 'ticket_assigned',
  title: 'Test notification',
  body: null,
  entity_type: null,
  entity_id: null,
  read_at: null,
  email_sent: false,
  created_at: new Date().toISOString(),
  ...overrides,
})

describe('NotificationFilteredList', () => {
  it('shows all notifications when filter is "all"', () => {
    const notifications = [
      makeNotification({ title: 'Assigned to you', type: 'ticket_assigned' }),
      makeNotification({ title: 'You were mentioned', type: 'mention' }),
      makeNotification({ title: 'Ticket updated', type: 'ticket_updated' }),
    ]
    render(<NotificationFilteredList notifications={notifications} activeFilter="all" />)
    expect(screen.getByText('Assigned to you')).toBeTruthy()
    expect(screen.getByText('You were mentioned')).toBeTruthy()
    expect(screen.getByText('Ticket updated')).toBeTruthy()
  })

  it('filters to assigned notifications only', () => {
    const notifications = [
      makeNotification({ title: 'Assigned to you', type: 'ticket_assigned' }),
      makeNotification({ title: 'You were mentioned', type: 'mention' }),
    ]
    render(<NotificationFilteredList notifications={notifications} activeFilter="assigned" />)
    expect(screen.getByText('Assigned to you')).toBeTruthy()
    expect(screen.queryByText('You were mentioned')).toBeNull()
  })

  it('filters to mention notifications only', () => {
    const notifications = [
      makeNotification({ title: 'Assigned to you', type: 'ticket_assigned' }),
      makeNotification({ title: 'You were mentioned', type: 'mention' }),
    ]
    render(<NotificationFilteredList notifications={notifications} activeFilter="mentions" />)
    expect(screen.queryByText('Assigned to you')).toBeNull()
    expect(screen.getByText('You were mentioned')).toBeTruthy()
  })

  it('filters to update notifications', () => {
    const notifications = [
      makeNotification({ title: 'Assigned to you', type: 'ticket_assigned' }),
      makeNotification({ title: 'Ticket updated', type: 'ticket_updated' }),
      makeNotification({ title: 'Comment added', type: 'ticket_commented' }),
      makeNotification({ title: 'Project changed', type: 'project_updated' }),
    ]
    render(<NotificationFilteredList notifications={notifications} activeFilter="updates" />)
    expect(screen.queryByText('Assigned to you')).toBeNull()
    expect(screen.getByText('Ticket updated')).toBeTruthy()
    expect(screen.getByText('Comment added')).toBeTruthy()
    expect(screen.getByText('Project changed')).toBeTruthy()
  })

  it('shows empty message when no notifications match the filter', () => {
    const notifications = [makeNotification({ title: 'Assigned to you', type: 'ticket_assigned' })]
    render(<NotificationFilteredList notifications={notifications} activeFilter="mentions" />)
    expect(screen.getByTestId('notification-filter-empty')).toBeTruthy()
    expect(screen.getByText('No notifications match this filter.')).toBeTruthy()
  })

  it('shows grouped empty states when notifications array is empty with "all" filter', () => {
    render(<NotificationFilteredList notifications={[]} activeFilter="all" />)
    // With the grouped view, each group shows its own empty state
    expect(screen.getByTestId('notification-grouped-view')).toBeTruthy()
    expect(screen.getByText(/you're all caught up/i)).toBeTruthy()
    expect(screen.getByText('No new mentions.')).toBeTruthy()
    expect(screen.getByText('No recent updates.')).toBeTruthy()
  })
})
