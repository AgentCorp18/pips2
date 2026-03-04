import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityFeed } from '../activity-feed'
import type { ProjectActivity } from '../overview-actions'

const ACTIVITIES: ProjectActivity[] = [
  {
    id: 'a-1',
    action: 'insert',
    entityType: 'ticket',
    description: 'Created ticket TK-1',
    createdAt: new Date().toISOString(),
    userName: 'Alice',
  },
  {
    id: 'a-2',
    action: 'update',
    entityType: 'project',
    description: 'Updated project settings',
    createdAt: new Date().toISOString(),
    userName: null,
  },
]

describe('ActivityFeed', () => {
  it('renders Recent Activity heading', () => {
    render(<ActivityFeed activity={ACTIVITIES} />)
    expect(screen.getByText('Recent Activity')).toBeTruthy()
  })

  it('renders activity descriptions', () => {
    render(<ActivityFeed activity={ACTIVITIES} />)
    expect(screen.getByText('Created ticket TK-1')).toBeTruthy()
    expect(screen.getByText('Updated project settings')).toBeTruthy()
  })

  it('renders user names', () => {
    render(<ActivityFeed activity={ACTIVITIES} />)
    expect(screen.getByText('Alice')).toBeTruthy()
  })

  it('renders list items', () => {
    const { container } = render(<ActivityFeed activity={ACTIVITIES} />)
    expect(container.querySelectorAll('li').length).toBe(2)
  })

  it('renders empty state when no activity', () => {
    render(<ActivityFeed activity={[]} />)
    expect(screen.getByText('No activity recorded yet.')).toBeTruthy()
  })
})
