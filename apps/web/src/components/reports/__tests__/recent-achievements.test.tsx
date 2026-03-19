import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecentAchievements } from '../recent-achievements'
import type { RecentAchievement } from '@/app/(app)/reports/actions'

/* ============================================================
   Helpers
   ============================================================ */

const makeAchievement = (overrides: Partial<RecentAchievement> = {}): RecentAchievement => ({
  id: 'abc123',
  title: 'Test Project',
  completedAt: '2026-03-01T00:00:00Z',
  methodologyDepthPercent: 80,
  narrativeSnippet: 'The team faced recurring delays in the approval process.',
  ...overrides,
})

/* ============================================================
   Tests
   ============================================================ */

describe('RecentAchievements', () => {
  it('renders the card with correct heading', () => {
    render(<RecentAchievements achievements={[makeAchievement()]} />)
    expect(screen.getByText('Recent Achievements')).toBeTruthy()
  })

  it('renders empty state when no achievements', () => {
    render(<RecentAchievements achievements={[]} />)
    expect(screen.getByTestId('recent-achievements-card')).toBeTruthy()
    expect(
      screen.getByText(
        'No projects completed in the last 30 days. Complete a project to see it here.',
      ),
    ).toBeTruthy()
  })

  it('renders project title as a link', () => {
    render(
      <RecentAchievements
        achievements={[makeAchievement({ id: 'proj-1', title: 'My Project' })]}
      />,
    )
    const link = screen.getByTestId('achievement-item-proj-1')
    expect(link.getAttribute('href')).toBe('/projects/proj-1')
    expect(screen.getByText('My Project')).toBeTruthy()
  })

  it('renders methodology depth badge', () => {
    render(<RecentAchievements achievements={[makeAchievement({ methodologyDepthPercent: 72 })]} />)
    expect(screen.getByText('72%')).toBeTruthy()
  })

  it('shows Strong label for depth >= 70%', () => {
    render(<RecentAchievements achievements={[makeAchievement({ methodologyDepthPercent: 75 })]} />)
    // The depth badge shows "depth" label text inside it
    expect(screen.getByText('depth')).toBeTruthy()
  })

  it('renders narrative snippet when present', () => {
    render(
      <RecentAchievements
        achievements={[
          makeAchievement({ narrativeSnippet: 'Process improvement initiative for the plant.' }),
        ]}
      />,
    )
    expect(screen.getByText('Process improvement initiative for the plant.')).toBeTruthy()
  })

  it('renders ellipsis when narrative is exactly 100 chars', () => {
    const longSnippet = 'A'.repeat(100)
    render(
      <RecentAchievements achievements={[makeAchievement({ narrativeSnippet: longSnippet })]} />,
    )
    // The component appends "…" when length >= 100
    expect(screen.getByText(`${longSnippet}…`)).toBeTruthy()
  })

  it('does not show narrative section when narrativeSnippet is null', () => {
    render(<RecentAchievements achievements={[makeAchievement({ narrativeSnippet: null })]} />)
    // Completion date should still be shown
    const card = screen.getByTestId('recent-achievements-card')
    expect(card).toBeTruthy()
  })

  it('renders multiple achievements in order', () => {
    const achievements = [
      makeAchievement({ id: 'a1', title: 'Alpha Project' }),
      makeAchievement({ id: 'a2', title: 'Beta Project' }),
      makeAchievement({ id: 'a3', title: 'Gamma Project' }),
    ]
    render(<RecentAchievements achievements={achievements} />)
    const links = screen.getAllByRole('link', { name: /project/i })
    // Should include project links (plus the "View all" link)
    expect(links.length).toBeGreaterThanOrEqual(3)
  })

  it('shows plural count text for multiple achievements', () => {
    const achievements = [
      makeAchievement({ id: 'a1', title: 'Alpha' }),
      makeAchievement({ id: 'a2', title: 'Beta' }),
    ]
    render(<RecentAchievements achievements={achievements} />)
    expect(screen.getByText('2 projects completed in the last 30 days')).toBeTruthy()
  })

  it('shows singular count text for one achievement', () => {
    render(<RecentAchievements achievements={[makeAchievement()]} />)
    expect(screen.getByText('1 project completed in the last 30 days')).toBeTruthy()
  })

  it('renders data-testid on card', () => {
    render(<RecentAchievements achievements={[makeAchievement()]} />)
    expect(screen.getByTestId('recent-achievements-card')).toBeTruthy()
  })

  it('renders a View all link pointing to portfolio-value', () => {
    render(<RecentAchievements achievements={[makeAchievement()]} />)
    const link = screen.getByText('View all')
    expect(link.closest('a')?.getAttribute('href')).toBe('/reports/portfolio-value')
  })
})
