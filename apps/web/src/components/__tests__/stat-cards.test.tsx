import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCards } from '../dashboard/stat-cards'
import type { DashboardStats } from '@/app/(app)/dashboard/actions'

/* ============================================================
   StatCards
   ============================================================ */

const defaultStats: DashboardStats = {
  activeProjects: 5,
  openTickets: 23,
  overdueTickets: 3,
  completedThisMonth: 12,
}

describe('StatCards', () => {
  it('renders 4 stat cards', () => {
    render(<StatCards stats={defaultStats} />)
    expect(screen.getByText('Active Projects')).toBeInTheDocument()
    expect(screen.getByText('Open Tickets')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
    expect(screen.getByText('Completed This Month')).toBeInTheDocument()
  })

  it('renders correct values', () => {
    render(<StatCards stats={defaultStats} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('23')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('shows overdue count in red when greater than 0', () => {
    render(<StatCards stats={defaultStats} />)
    const overdueValue = screen.getByText('3')
    expect(overdueValue).toHaveStyle({ color: '#EF4444' })
  })

  it('does not apply red color when overdue is 0', () => {
    const zeroOverdueStats: DashboardStats = {
      ...defaultStats,
      overdueTickets: 0,
    }
    render(<StatCards stats={zeroOverdueStats} />)
    const overdueValue = screen.getByText('0')
    expect(overdueValue).not.toHaveStyle({ color: '#EF4444' })
  })

  it('shows zero state correctly', () => {
    const zeroStats: DashboardStats = {
      activeProjects: 0,
      openTickets: 0,
      overdueTickets: 0,
      completedThisMonth: 0,
    }
    render(<StatCards stats={zeroStats} />)
    const zeros = screen.getAllByText('0')
    expect(zeros).toHaveLength(4)
  })
})
