import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TicketEmptyState } from '../tickets/ticket-empty-state'

/* ============================================================
   TicketEmptyState
   ============================================================ */

describe('TicketEmptyState', () => {
  it('renders the title', () => {
    render(<TicketEmptyState />)
    expect(screen.getByText('No tickets yet')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<TicketEmptyState />)
    expect(screen.getByText('Create your first ticket to start tracking work.')).toBeInTheDocument()
  })

  it('renders the create button with link to /tickets/new', () => {
    render(<TicketEmptyState />)
    const link = screen.getByRole('link', { name: /create your first ticket/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/tickets/new')
  })

  it('renders the ticket icon', () => {
    render(<TicketEmptyState />)
    // The Ticket icon from lucide-react renders as an SVG
    const container = document.querySelector('svg')
    expect(container).toBeInTheDocument()
  })
})
