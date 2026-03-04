import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TicketEmptyState } from '../ticket-empty-state'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('TicketEmptyState', () => {
  it('renders "No tickets yet" heading', () => {
    render(<TicketEmptyState />)
    expect(screen.getByText('No tickets yet')).toBeTruthy()
  })

  it('renders description text', () => {
    render(<TicketEmptyState />)
    expect(screen.getByText('Create your first ticket to start tracking work.')).toBeTruthy()
  })

  it('renders create ticket link', () => {
    render(<TicketEmptyState />)
    const link = screen.getByText('Create your first ticket')
    expect(link.closest('a')?.getAttribute('href')).toBe('/tickets/new')
  })

  it('renders the heading as h3', () => {
    render(<TicketEmptyState />)
    const heading = screen.getByText('No tickets yet')
    expect(heading.tagName).toBe('H3')
  })

  it('has dashed border container', () => {
    const { container } = render(<TicketEmptyState />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('border-dashed')
  })
})
