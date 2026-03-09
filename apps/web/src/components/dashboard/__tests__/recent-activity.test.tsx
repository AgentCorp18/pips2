import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecentActivity } from '../recent-activity'
import type { ActivityItem } from '@/app/(app)/dashboard/actions'

/* ============================================================
   Mocks
   ============================================================ */

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

/* ============================================================
   Helpers
   ============================================================ */

const sampleItems: ActivityItem[] = [
  {
    id: 'act-1',
    action: 'insert',
    entityType: 'ticket',
    entityId: 'ticket-1',
    description: 'Alice created ticket "Fix login bug"',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
    userName: 'Alice',
  },
  {
    id: 'act-2',
    action: 'update',
    entityType: 'project',
    entityId: 'proj-1',
    description: 'Bob updated project "Reduce Waste"',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    userName: 'Bob',
  },
  {
    id: 'act-3',
    action: 'delete',
    entityType: 'ticket',
    entityId: 'ticket-2',
    description: 'Carol deleted ticket "Duplicate entry"',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hr ago
    userName: 'Carol',
  },
]

/* ============================================================
   Tests
   ============================================================ */

describe('RecentActivity', () => {
  it('renders the "Recent Activity" heading', () => {
    render(<RecentActivity items={sampleItems} />)
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('renders all activity descriptions', () => {
    render(<RecentActivity items={sampleItems} />)
    expect(screen.getByText('Alice created ticket "Fix login bug"')).toBeInTheDocument()
    expect(screen.getByText('Bob updated project "Reduce Waste"')).toBeInTheDocument()
    expect(screen.getByText('Carol deleted ticket "Duplicate entry"')).toBeInTheDocument()
  })

  it('renders "View all" link when items are present', () => {
    render(<RecentActivity items={sampleItems} />)
    const link = screen.getByRole('link', { name: /view all/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/tickets')
  })

  it('does not render "View all" link when no items', () => {
    render(<RecentActivity items={[]} />)
    expect(screen.queryByRole('link', { name: /view all/i })).not.toBeInTheDocument()
  })

  it('renders empty state message when no items', () => {
    render(<RecentActivity items={[]} />)
    expect(screen.getByText(/no recent activity/i)).toBeInTheDocument()
  })

  it('renders time ago text for each item', () => {
    render(<RecentActivity items={sampleItems} />)
    // date-fns formatDistanceToNow should produce something like "5 minutes ago"
    // We just check that some time-related text is rendered
    const timeTexts = document.querySelectorAll('.text-xs')
    expect(timeTexts.length).toBeGreaterThan(0)
  })

  it('renders icons for each activity type', () => {
    render(<RecentActivity items={sampleItems} />)
    // There should be SVG icons for insert, update, and delete actions
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(3)
  })

  it('handles a single item correctly', () => {
    render(<RecentActivity items={[sampleItems[0]!]} />)
    expect(screen.getByText('Alice created ticket "Fix login bug"')).toBeInTheDocument()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('handles unknown action types gracefully', () => {
    const unknownItem: ActivityItem = {
      id: 'act-x',
      action: 'archive',
      entityType: 'project',
      entityId: 'proj-x',
      description: 'System archived project "Old Project"',
      createdAt: new Date().toISOString(),
      userName: null,
    }
    render(<RecentActivity items={[unknownItem]} />)
    expect(screen.getByText('System archived project "Old Project"')).toBeInTheDocument()
  })
})
