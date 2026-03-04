import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OverviewStats } from '../overview-stats'

describe('OverviewStats', () => {
  it('renders Tickets Created label', () => {
    render(
      <OverviewStats ticketsCreated={10} ticketsCompleted={5} daysActive={30} stepsCompleted={3} />,
    )
    expect(screen.getByText('Tickets Created')).toBeTruthy()
  })

  it('renders Tickets Completed label', () => {
    render(
      <OverviewStats ticketsCreated={10} ticketsCompleted={5} daysActive={30} stepsCompleted={3} />,
    )
    expect(screen.getByText('Tickets Completed')).toBeTruthy()
  })

  it('renders Days Active label', () => {
    render(
      <OverviewStats ticketsCreated={10} ticketsCompleted={5} daysActive={30} stepsCompleted={3} />,
    )
    expect(screen.getByText('Days Active')).toBeTruthy()
  })

  it('renders Steps Completed label', () => {
    render(
      <OverviewStats ticketsCreated={10} ticketsCompleted={5} daysActive={30} stepsCompleted={3} />,
    )
    expect(screen.getByText('Steps Completed')).toBeTruthy()
  })

  it('renders stat values', () => {
    render(
      <OverviewStats ticketsCreated={10} ticketsCompleted={5} daysActive={30} stepsCompleted={3} />,
    )
    expect(screen.getByText('10')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
    expect(screen.getByText('30')).toBeTruthy()
    expect(screen.getByText('3 / 6')).toBeTruthy()
  })

  it('renders sub labels', () => {
    render(
      <OverviewStats ticketsCreated={10} ticketsCompleted={5} daysActive={30} stepsCompleted={3} />,
    )
    expect(screen.getByText('total tickets')).toBeTruthy()
    expect(screen.getByText('marked done')).toBeTruthy()
    expect(screen.getByText('since created')).toBeTruthy()
    expect(screen.getByText('PIPS steps')).toBeTruthy()
  })

  it('renders 4 stat cards', () => {
    const { container } = render(
      <OverviewStats ticketsCreated={10} ticketsCompleted={5} daysActive={30} stepsCompleted={3} />,
    )
    // Grid of 4 cards
    const grid = container.firstElementChild as HTMLElement
    expect(grid.children.length).toBe(4)
  })
})
