import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCards } from '../stat-cards'
import type { DashboardStats } from '@/app/(app)/dashboard/actions'

/* ============================================================
   StatCards
   ============================================================ */

const defaultStats: DashboardStats = {
  totalProjects: 8,
  activeProjects: 5,
  openTickets: 23,
  overdueTickets: 3,
  completedThisMonth: 12,
  teamMembers: 4,
}

describe('StatCards', () => {
  it('renders 5 stat cards', () => {
    render(<StatCards stats={defaultStats} />)
    expect(screen.getByText('Total Projects')).toBeInTheDocument()
    expect(screen.getByText('Open Tickets')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
    expect(screen.getByText('Completed This Month')).toBeInTheDocument()
    expect(screen.getByText('Team Members')).toBeInTheDocument()
  })

  it('renders correct values', () => {
    render(<StatCards stats={defaultStats} />)
    expect(screen.getByText('8')).toBeInTheDocument()
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
      completedThisMonth: 0,
      teamMembers: 0,
    }
    render(<StatCards stats={zeroStats} />)
    const zeros = screen.getAllByText('0')
    expect(zeros).toHaveLength(5)
  })

  it('renders data-testid on each card', () => {
    render(<StatCards stats={defaultStats} />)
    expect(screen.getByTestId('stat-total-projects')).toBeInTheDocument()
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
})
