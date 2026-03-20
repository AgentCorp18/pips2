import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCards } from '../stat-cards'
import type { DashboardStats, DashboardDeltas } from '@/app/(app)/dashboard/actions'

/* ============================================================
   StatCards
   ============================================================ */

const defaultStats: DashboardStats = {
  totalProjects: 8,
  activeProjects: 5,
  openTickets: 23,
  overdueTickets: 3,
  blockedTickets: 0,
  completedThisMonth: 12,
  teamMembers: 4,
}

describe('StatCards', () => {
  it('renders 6 stat cards', () => {
    render(<StatCards stats={defaultStats} />)
    expect(screen.getByText('Total Projects')).toBeInTheDocument()
    expect(screen.getByText('Active Projects')).toBeInTheDocument()
    expect(screen.getByText('Open Tickets')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
    expect(screen.getByText('Completed This Month')).toBeInTheDocument()
    expect(screen.getByText('Team Members')).toBeInTheDocument()
  })

  it('renders correct values', () => {
    render(<StatCards stats={defaultStats} />)
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('23')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('shows overdue count in red when greater than 0', () => {
    render(<StatCards stats={defaultStats} />)
    const overdueValue = screen.getByText('3')
    expect(overdueValue).toHaveStyle({ color: 'var(--color-signal-red)' })
  })

  it('does not apply red color when overdue is 0', () => {
    const zeroOverdueStats: DashboardStats = {
      ...defaultStats,
      overdueTickets: 0,
    }
    render(<StatCards stats={zeroOverdueStats} />)
    // Find the overdue card's value (the 0 inside stat-overdue)
    const overdueCard = screen.getByTestId('stat-overdue')
    const overdueValue = overdueCard.querySelector('.text-2xl')
    expect(overdueValue).not.toHaveStyle({ color: 'var(--color-signal-red)' })
  })

  it('shows zero state correctly', () => {
    const zeroStats: DashboardStats = {
      totalProjects: 0,
      activeProjects: 0,
      openTickets: 0,
      overdueTickets: 0,
      blockedTickets: 0,
      completedThisMonth: 0,
      teamMembers: 0,
    }
    render(<StatCards stats={zeroStats} />)
    const zeros = screen.getAllByText('0')
    expect(zeros).toHaveLength(6)
  })

  it('does not show the blockers banner when blockedTickets is 0', () => {
    render(<StatCards stats={defaultStats} />)
    expect(screen.queryByTestId('stat-blocked-tickets-banner')).not.toBeInTheDocument()
  })

  it('shows the blockers banner when blockedTickets is > 0', () => {
    const statsWithBlockers: DashboardStats = { ...defaultStats, blockedTickets: 3 }
    render(<StatCards stats={statsWithBlockers} />)
    expect(screen.getByTestId('stat-blocked-tickets-banner')).toBeInTheDocument()
    expect(screen.getByText('3 Blocked Tickets')).toBeInTheDocument()
  })

  it('uses singular label when exactly 1 ticket is blocked', () => {
    const statsWithBlockers: DashboardStats = { ...defaultStats, blockedTickets: 1 }
    render(<StatCards stats={statsWithBlockers} />)
    expect(screen.getByText('1 Blocked Ticket')).toBeInTheDocument()
  })

  it('blockers banner links to tickets filtered by blocked status', () => {
    const statsWithBlockers: DashboardStats = { ...defaultStats, blockedTickets: 2 }
    render(<StatCards stats={statsWithBlockers} />)
    const banner = screen.getByTestId('stat-blocked-tickets-banner')
    expect(banner).toHaveAttribute('href', '/tickets?status=blocked')
  })

  it('shows blocked chip inside open tickets card when blockedTickets > 0', () => {
    const statsWithBlockers: DashboardStats = { ...defaultStats, blockedTickets: 5 }
    render(<StatCards stats={statsWithBlockers} />)
    expect(screen.getByText('5 blocked')).toBeInTheDocument()
  })

  it('renders data-testid on each card', () => {
    render(<StatCards stats={defaultStats} />)
    expect(screen.getByTestId('stat-total-projects')).toBeInTheDocument()
    expect(screen.getByTestId('stat-active-projects')).toBeInTheDocument()
    expect(screen.getByTestId('stat-open-tickets')).toBeInTheDocument()
    expect(screen.getByTestId('stat-overdue')).toBeInTheDocument()
    expect(screen.getByTestId('stat-completed')).toBeInTheDocument()
    expect(screen.getByTestId('stat-team-members')).toBeInTheDocument()
  })

  it('renders total projects card as a link', () => {
    render(<StatCards stats={defaultStats} />)
    const projectsCard = screen.getByTestId('stat-total-projects')
    const link = projectsCard.closest('a')
    expect(link).toHaveAttribute('href', '/projects')
  })

  it('renders overdue card as a link', () => {
    render(<StatCards stats={defaultStats} />)
    const overdueCard = screen.getByTestId('stat-overdue')
    const link = overdueCard.closest('a')
    expect(link).toHaveAttribute('href', '/tickets?quick=overdue')
  })

  it('renders team members card as a link', () => {
    render(<StatCards stats={defaultStats} />)
    const teamCard = screen.getByTestId('stat-team-members')
    const link = teamCard.closest('a')
    expect(link).toHaveAttribute('href', '/settings/members')
  })

  it('renders open tickets card as a link to filtered tickets', () => {
    render(<StatCards stats={defaultStats} />)
    const openCard = screen.getByTestId('stat-open-tickets')
    const link = openCard.closest('a')
    expect(link).toHaveAttribute(
      'href',
      '/tickets?status=todo&status=in_progress&status=in_review&status=blocked',
    )
  })

  it('renders completed this month card as a link', () => {
    render(<StatCards stats={defaultStats} />)
    const completedCard = screen.getByTestId('stat-completed')
    const link = completedCard.closest('a')
    expect(link).toHaveAttribute('href', '/tickets?status=done')
  })

  it('all stat cards are wrapped in links (actionable dashboard)', () => {
    render(<StatCards stats={defaultStats} />)
    const cards = [
      'stat-total-projects',
      'stat-active-projects',
      'stat-open-tickets',
      'stat-overdue',
      'stat-completed',
      'stat-team-members',
    ]
    for (const testId of cards) {
      const card = screen.getByTestId(testId)
      const link = card.closest('a')
      expect(link).toBeTruthy()
      expect(link).toHaveAttribute('href')
    }
  })

  it('renders active projects card as a link to filtered projects', () => {
    render(<StatCards stats={defaultStats} />)
    const activeCard = screen.getByTestId('stat-active-projects')
    const link = activeCard.closest('a')
    expect(link).toHaveAttribute('href', '/projects?status=active')
  })
})

/* ============================================================
   Delta indicator tests
   ============================================================ */

const flatDeltas: DashboardDeltas = {
  openTickets: { current: 23, previousWeek: 23, delta: 0, direction: 'flat' },
  overdueTickets: { current: 3, previousWeek: 3, delta: 0, direction: 'flat' },
  completedThisMonth: { current: 12, previousWeek: 12, delta: 0, direction: 'flat' },
  activeProjects: { current: 5, previousWeek: 5, delta: 0, direction: 'flat' },
}

const upDeltas: DashboardDeltas = {
  openTickets: { current: 26, previousWeek: 23, delta: 3, direction: 'up' },
  overdueTickets: { current: 5, previousWeek: 3, delta: 2, direction: 'up' },
  completedThisMonth: { current: 15, previousWeek: 12, delta: 3, direction: 'up' },
  activeProjects: { current: 7, previousWeek: 5, delta: 2, direction: 'up' },
}

const downDeltas: DashboardDeltas = {
  openTickets: { current: 20, previousWeek: 23, delta: -3, direction: 'down' },
  overdueTickets: { current: 1, previousWeek: 3, delta: -2, direction: 'down' },
  completedThisMonth: { current: 9, previousWeek: 12, delta: -3, direction: 'down' },
  activeProjects: { current: 3, previousWeek: 5, delta: -2, direction: 'down' },
}

describe('StatCards delta indicators', () => {
  it('renders flat indicator when all deltas are flat', () => {
    render(<StatCards stats={defaultStats} deltas={flatDeltas} />)
    const flatIndicators = screen.getAllByTestId('delta-flat')
    // 4 cards have deltas: openTickets, overdueTickets, completedThisMonth, activeProjects
    expect(flatIndicators.length).toBe(4)
  })

  it('renders up arrow when delta direction is up', () => {
    render(<StatCards stats={defaultStats} deltas={upDeltas} />)
    const upIndicators = screen.getAllByTestId('delta-up')
    expect(upIndicators.length).toBe(4)
  })

  it('renders down arrow when delta direction is down', () => {
    render(<StatCards stats={defaultStats} deltas={downDeltas} />)
    const downIndicators = screen.getAllByTestId('delta-down')
    expect(downIndicators.length).toBe(4)
  })

  it('shows green colour when completed goes up (up is good)', () => {
    render(<StatCards stats={defaultStats} deltas={upDeltas} />)
    const completedCard = screen.getByTestId('stat-completed')
    const deltaEl = completedCard.querySelector('[data-testid="delta-up"]')
    expect(deltaEl).toBeTruthy()
    expect(deltaEl).toHaveStyle({ color: '#16A34A' })
  })

  it('shows red colour when overdue goes up (up is bad)', () => {
    render(<StatCards stats={defaultStats} deltas={upDeltas} />)
    const overdueCard = screen.getByTestId('stat-overdue')
    const deltaEl = overdueCard.querySelector('[data-testid="delta-up"]')
    expect(deltaEl).toBeTruthy()
    expect(deltaEl).toHaveStyle({ color: '#DC2626' })
  })

  it('shows green colour when overdue goes down (down is good)', () => {
    render(<StatCards stats={defaultStats} deltas={downDeltas} />)
    const overdueCard = screen.getByTestId('stat-overdue')
    const deltaEl = overdueCard.querySelector('[data-testid="delta-down"]')
    expect(deltaEl).toBeTruthy()
    expect(deltaEl).toHaveStyle({ color: '#16A34A' })
  })

  it('shows absolute value in delta text', () => {
    render(<StatCards stats={defaultStats} deltas={downDeltas} />)
    // open tickets delta = -3 → should show "3" (absolute)
    const openCard = screen.getByTestId('stat-open-tickets')
    const deltaEl = openCard.querySelector('[data-testid="delta-down"]')
    expect(deltaEl?.textContent).toContain('3')
  })

  it('does not render delta when deltas prop is omitted', () => {
    render(<StatCards stats={defaultStats} />)
    expect(screen.queryByTestId('delta-flat')).not.toBeInTheDocument()
    expect(screen.queryByTestId('delta-up')).not.toBeInTheDocument()
    expect(screen.queryByTestId('delta-down')).not.toBeInTheDocument()
  })

  it('shows "vs last week" label in each delta indicator', () => {
    render(<StatCards stats={defaultStats} deltas={flatDeltas} />)
    const allFlat = screen.getAllByTestId('delta-flat')
    for (const el of allFlat) {
      expect(el.textContent).toContain('vs last week')
    }
  })

  it('does not show delta on totalProjects and teamMembers cards', () => {
    render(<StatCards stats={defaultStats} deltas={flatDeltas} />)
    const totalProjectsCard = screen.getByTestId('stat-total-projects')
    const teamCard = screen.getByTestId('stat-team-members')
    expect(totalProjectsCard.querySelector('[data-testid^="delta-"]')).toBeNull()
    expect(teamCard.querySelector('[data-testid^="delta-"]')).toBeNull()
  })
})
