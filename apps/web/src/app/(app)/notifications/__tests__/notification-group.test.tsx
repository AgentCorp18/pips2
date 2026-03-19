import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotificationGroup } from '../notification-group'
import type { Notification } from '@/types/notifications'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('../actions', () => ({
  markAsRead: vi.fn().mockResolvedValue({}),
  archiveNotification: vi.fn().mockResolvedValue({}),
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

describe('NotificationGroup', () => {
  it('renders the group label', () => {
    render(
      <NotificationGroup
        label="Action Needed"
        badgeColor="red"
        notifications={[makeNotification({ title: 'Do something' })]}
        emptyMessage="All caught up!"
      />,
    )
    expect(screen.getByText('Action Needed')).toBeTruthy()
  })

  it('renders a count badge with the number of notifications', () => {
    const notifications = [makeNotification(), makeNotification()]
    render(
      <NotificationGroup
        label="Updates"
        badgeColor="gray"
        notifications={notifications}
        emptyMessage="No updates."
      />,
    )
    expect(screen.getByTestId('notification-group-count-updates').textContent).toBe('2')
  })

  it('renders each notification item', () => {
    render(
      <NotificationGroup
        label="Mentions"
        badgeColor="blue"
        notifications={[
          makeNotification({ title: 'First mention' }),
          makeNotification({ title: 'Second mention' }),
        ]}
        emptyMessage="No mentions."
      />,
    )
    expect(screen.getByText('First mention')).toBeTruthy()
    expect(screen.getByText('Second mention')).toBeTruthy()
  })

  it('shows the empty message with a checkmark when there are no notifications', () => {
    render(
      <NotificationGroup
        label="Action Needed"
        badgeColor="red"
        notifications={[]}
        emptyMessage="No action items — you're all caught up!"
      />,
    )
    expect(screen.getByTestId('notification-group-empty-action-needed')).toBeTruthy()
    expect(screen.getByText("No action items — you're all caught up!")).toBeTruthy()
  })

  it('renders the group-level data-testid', () => {
    render(
      <NotificationGroup
        label="Action Needed"
        badgeColor="red"
        notifications={[]}
        emptyMessage="All caught up!"
      />,
    )
    expect(screen.getByTestId('notification-group-action-needed')).toBeTruthy()
  })

  it('count badge shows 0 when empty', () => {
    render(
      <NotificationGroup
        label="Mentions"
        badgeColor="blue"
        notifications={[]}
        emptyMessage="No mentions."
      />,
    )
    expect(screen.getByTestId('notification-group-count-mentions').textContent).toBe('0')
  })
})
