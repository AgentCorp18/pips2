import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import ProjectsLoading from '../../(app)/projects/loading'
import ProjectDetailLoading from '../../(app)/projects/[projectId]/loading'
import NotificationsLoading from '../../(app)/notifications/loading'
import DashboardLoading from '../../(app)/dashboard/loading'
import TicketsLoading from '../../(app)/tickets/loading'
import TeamsLoading from '../../(app)/teams/loading'
import AuditLogLoading from '../../(app)/settings/audit-log/loading'
import NotificationPreferencesLoading from '../../(app)/settings/notifications/loading'
import ChatLoading from '../../(app)/chat/loading'
import ChannelLoading from '../../(app)/chat/[channelId]/loading'
import SettingsLoading from '../../(app)/settings/loading'

describe('Loading screens', () => {
  it('renders ProjectsLoading', () => {
    const { container } = render(<ProjectsLoading />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders ProjectDetailLoading', () => {
    const { container } = render(<ProjectDetailLoading />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders NotificationsLoading', () => {
    const { container } = render(<NotificationsLoading />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders DashboardLoading with aria-label', () => {
    const { container } = render(<DashboardLoading />)
    expect(container.querySelector('[aria-label="Loading dashboard"]')).toBeTruthy()
  })

  it('renders TicketsLoading with aria-label', () => {
    const { container } = render(<TicketsLoading />)
    expect(container.querySelector('[aria-label="Loading tickets"]')).toBeTruthy()
  })

  it('renders TeamsLoading', () => {
    const { container } = render(<TeamsLoading />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders AuditLogLoading', () => {
    const { container } = render(<AuditLogLoading />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders NotificationPreferencesLoading', () => {
    const { container } = render(<NotificationPreferencesLoading />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders ChatLoading with aria-label', () => {
    const { container } = render(<ChatLoading />)
    expect(container.querySelector('[aria-label="Loading chat"]')).toBeTruthy()
  })

  it('renders ChannelLoading with aria-label', () => {
    const { container } = render(<ChannelLoading />)
    expect(container.querySelector('[aria-label="Loading channel"]')).toBeTruthy()
  })

  it('renders SettingsLoading with aria-label', () => {
    const { container } = render(<SettingsLoading />)
    expect(container.querySelector('[aria-label="Loading settings"]')).toBeTruthy()
  })
})
