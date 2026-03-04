import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotificationPreferencesForm } from '../notification-preferences-form'
import type { NotificationPreferences } from '../actions'

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

vi.mock('../actions', () => ({
  updateNotificationPreferences: vi.fn().mockResolvedValue({}),
}))

const PREFS: NotificationPreferences = {
  id: 'np-1',
  user_id: 'u-1',
  org_id: 'org-1',
  ticket_assigned: true,
  mention: true,
  project_updated: false,
  ticket_updated: true,
  ticket_commented: true,
  email_enabled: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('NotificationPreferencesForm', () => {
  it('renders In-app notifications heading', () => {
    render(<NotificationPreferencesForm preferences={PREFS} />)
    expect(screen.getByText('In-app notifications')).toBeTruthy()
  })

  it('renders Email notifications heading', () => {
    render(<NotificationPreferencesForm preferences={PREFS} />)
    expect(screen.getByText('Email notifications')).toBeTruthy()
  })

  it('renders Ticket assigned preference', () => {
    render(<NotificationPreferencesForm preferences={PREFS} />)
    expect(screen.getByText('Ticket assigned')).toBeTruthy()
  })

  it('renders Mentions preference', () => {
    render(<NotificationPreferencesForm preferences={PREFS} />)
    expect(screen.getByText('Mentions')).toBeTruthy()
  })

  it('renders Project updates preference', () => {
    render(<NotificationPreferencesForm preferences={PREFS} />)
    expect(screen.getByText('Project updates')).toBeTruthy()
  })

  it('renders Ticket updates preference', () => {
    render(<NotificationPreferencesForm preferences={PREFS} />)
    expect(screen.getByText('Ticket updates')).toBeTruthy()
  })

  it('renders Comments preference', () => {
    render(<NotificationPreferencesForm preferences={PREFS} />)
    expect(screen.getByText('Comments')).toBeTruthy()
  })

  it('renders Email delivery preference', () => {
    render(<NotificationPreferencesForm preferences={PREFS} />)
    expect(screen.getByText('Email delivery')).toBeTruthy()
  })

  it('renders preference descriptions', () => {
    render(<NotificationPreferencesForm preferences={PREFS} />)
    expect(screen.getByText(/When a ticket is assigned to you/)).toBeTruthy()
    expect(screen.getByText(/someone @mentions you/)).toBeTruthy()
  })

  it('renders switch for each preference', () => {
    render(<NotificationPreferencesForm preferences={PREFS} />)
    // 5 in-app + 1 email = 6 switches
    const switches = screen.getAllByRole('switch')
    expect(switches.length).toBe(6)
  })
})
