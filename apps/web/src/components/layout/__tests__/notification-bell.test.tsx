import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationBell } from '../notification-bell'
import type { Notification } from '@/types/notifications'

/* ============================================================
   Mocks
   ============================================================ */

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}))

const mockGetNotifications = vi.fn()
const mockGetUnreadCount = vi.fn()
const mockMarkAsRead = vi.fn()
const mockMarkAllAsRead = vi.fn()

vi.mock('@/app/(app)/notifications/actions', () => ({
  getNotifications: (...args: unknown[]) => mockGetNotifications(...args),
  getUnreadCount: () => mockGetUnreadCount(),
  markAsRead: (...args: unknown[]) => mockMarkAsRead(...args),
  markAllAsRead: () => mockMarkAllAsRead(),
}))

// Mock Supabase client — used to resolve userId for realtime subscription
const mockGetUser = vi.fn()
const mockUnsubscribe = vi.fn()
const mockRemoveChannel = vi.fn()
const mockOn = vi.fn()
const mockSubscribe = vi.fn()
const mockChannel = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  }),
}))

// Mock the realtime hook so tests don't need to wire up Supabase channel machinery
vi.mock('@/hooks/use-notification-realtime', () => ({
  useNotificationRealtime: vi.fn(),
}))

/* ============================================================
   Helpers
   ============================================================ */

const createNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'notif-1',
  org_id: 'org-1',
  user_id: 'user-1',
  type: 'ticket_assigned',
  title: 'You were assigned a ticket',
  body: 'Ticket PIPS-42 was assigned to you',
  entity_type: 'ticket',
  entity_id: 'ticket-42',
  read_at: null,
  email_sent: false,
  created_at: '2026-03-01T10:00:00Z',
  ...overrides,
})

const sampleNotifications: Notification[] = [
  createNotification(),
  createNotification({
    id: 'notif-2',
    type: 'project_updated',
    title: 'Project updated',
    body: 'Quality Improvement moved to Step 3',
    entity_type: 'project',
    entity_id: 'proj-1',
    read_at: '2026-03-01T11:00:00Z',
    created_at: '2026-03-01T09:00:00Z',
  }),
  createNotification({
    id: 'notif-3',
    type: 'mention',
    title: 'Alice mentioned you',
    body: null,
    entity_type: null,
    entity_id: null,
    read_at: null,
    created_at: '2026-03-01T08:00:00Z',
  }),
]

/* ============================================================
   Tests
   ============================================================ */

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockGetUnreadCount.mockResolvedValue(0)
    mockGetNotifications.mockResolvedValue({
      notifications: [],
      total: 0,
    })
    mockMarkAsRead.mockResolvedValue({})
    mockMarkAllAsRead.mockResolvedValue({})
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // Channel mock: return a chainable object
    const channelObj = {
      on: mockOn,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
    }
    mockOn.mockReturnValue(channelObj)
    mockSubscribe.mockReturnValue(channelObj)
    mockChannel.mockReturnValue(channelObj)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  /* ---- Basic rendering ---- */

  it('renders the bell trigger button', async () => {
    await act(async () => {
      render(<NotificationBell />)
    })
    const button = screen.getByRole('button', { name: /notifications/i })
    expect(button).toBeInTheDocument()
  })

  it('renders a bell SVG icon', async () => {
    await act(async () => {
      render(<NotificationBell />)
    })
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  /* ---- Unread count badge ---- */

  it('does not show badge when unread count is 0', async () => {
    mockGetUnreadCount.mockResolvedValue(0)
    await act(async () => {
      render(<NotificationBell />)
    })
    await waitFor(() => {
      expect(mockGetUnreadCount).toHaveBeenCalled()
    })
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows unread count badge when there are unread notifications', async () => {
    mockGetUnreadCount.mockResolvedValue(5)
    await act(async () => {
      render(<NotificationBell />)
    })
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  it('shows 99+ when unread count exceeds 99', async () => {
    mockGetUnreadCount.mockResolvedValue(150)
    await act(async () => {
      render(<NotificationBell />)
    })
    await waitFor(() => {
      expect(screen.getByText('99+')).toBeInTheDocument()
    })
  })

  it('updates aria-label with unread count', async () => {
    mockGetUnreadCount.mockResolvedValue(3)
    await act(async () => {
      render(<NotificationBell />)
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Notifications (3 unread)' })).toBeInTheDocument()
    })
  })

  it('shows simple aria-label when no unread notifications', async () => {
    mockGetUnreadCount.mockResolvedValue(0)
    await act(async () => {
      render(<NotificationBell />)
    })
    await waitFor(() => {
      expect(mockGetUnreadCount).toHaveBeenCalled()
    })
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })

  /* ---- Dropdown open ---- */

  it('fetches notifications when dropdown opens', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockGetNotifications.mockResolvedValue({
      notifications: sampleNotifications,
      total: 3,
    })

    await act(async () => {
      render(<NotificationBell />)
    })

    const button = screen.getByRole('button', { name: /notifications/i })
    await user.click(button)

    await waitFor(() => {
      expect(mockGetNotifications).toHaveBeenCalledWith({ limit: 10 })
    })
  })

  it('shows "Notifications" label in dropdown header', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockGetNotifications.mockResolvedValue({
      notifications: sampleNotifications,
      total: 3,
    })

    await act(async () => {
      render(<NotificationBell />)
    })

    const button = screen.getByRole('button', { name: /notifications/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument()
    })
  })

  it('displays notification titles when dropdown opens', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockGetNotifications.mockResolvedValue({
      notifications: sampleNotifications,
      total: 3,
    })

    await act(async () => {
      render(<NotificationBell />)
    })

    const button = screen.getByRole('button', { name: /notifications/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('You were assigned a ticket')).toBeInTheDocument()
      expect(screen.getByText('Project updated')).toBeInTheDocument()
      expect(screen.getByText('Alice mentioned you')).toBeInTheDocument()
    })
  })

  it('displays notification body text', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockGetNotifications.mockResolvedValue({
      notifications: sampleNotifications,
      total: 3,
    })

    await act(async () => {
      render(<NotificationBell />)
    })

    const button = screen.getByRole('button', { name: /notifications/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Ticket PIPS-42 was assigned to you')).toBeInTheDocument()
      expect(screen.getByText('Quality Improvement moved to Step 3')).toBeInTheDocument()
    })
  })

  it('shows empty state when no notifications exist', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockGetNotifications.mockResolvedValue({
      notifications: [],
      total: 0,
    })

    await act(async () => {
      render(<NotificationBell />)
    })

    const button = screen.getByRole('button', { name: /notifications/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('No notifications yet')).toBeInTheDocument()
    })
  })

  /* ---- Mark all as read ---- */

  it('shows "Mark all read" button when there are unread notifications', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockGetUnreadCount.mockResolvedValue(2)
    mockGetNotifications.mockResolvedValue({
      notifications: sampleNotifications,
      total: 3,
    })

    await act(async () => {
      render(<NotificationBell />)
    })

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /notifications/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByLabelText('Mark all notifications as read')).toBeInTheDocument()
    })
  })

  /* ---- Initial fetch (replaces polling test) ---- */

  it('calls getUnreadCount on initial mount', async () => {
    await act(async () => {
      render(<NotificationBell />)
    })
    await waitFor(() => {
      expect(mockGetUnreadCount).toHaveBeenCalled()
    })
  })

  /* ---- View all link ---- */

  it('shows "View all notifications" link in the footer', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockGetNotifications.mockResolvedValue({ notifications: [], total: 0 })

    await act(async () => {
      render(<NotificationBell />)
    })

    const button = screen.getByRole('button', { name: /notifications/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('View all notifications')).toBeInTheDocument()
    })
  })

  it('navigates to /notifications when "View all notifications" is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockGetNotifications.mockResolvedValue({ notifications: [], total: 0 })

    await act(async () => {
      render(<NotificationBell />)
    })

    const bellButton = screen.getByRole('button', { name: /notifications/i })
    await user.click(bellButton)

    await waitFor(() => {
      expect(screen.getByText('View all notifications')).toBeInTheDocument()
    })

    const viewAllButton = screen.getByText('View all notifications')
    await user.click(viewAllButton)

    expect(mockPush).toHaveBeenCalledWith('/notifications')
  })
})
