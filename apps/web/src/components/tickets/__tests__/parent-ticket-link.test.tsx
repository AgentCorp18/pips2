import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ParentTicketLink } from '../parent-ticket-link'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('ParentTicketLink', () => {
  const PROPS = {
    parentId: 'parent-123',
    parentTitle: 'Main Feature',
    parentSequenceId: 'TKT-001',
  }

  it('renders Tickets breadcrumb link', () => {
    render(<ParentTicketLink {...PROPS} />)
    const link = screen.getByText('Tickets')
    expect(link.closest('a')?.getAttribute('href')).toBe('/tickets')
  })

  it('renders parent sequence ID', () => {
    render(<ParentTicketLink {...PROPS} />)
    expect(screen.getByText('TKT-001')).toBeTruthy()
  })

  it('renders parent title', () => {
    render(<ParentTicketLink {...PROPS} />)
    expect(screen.getByText('Main Feature')).toBeTruthy()
  })

  it('links to parent ticket detail page', () => {
    render(<ParentTicketLink {...PROPS} />)
    const link = screen.getByText('Main Feature').closest('a')
    expect(link?.getAttribute('href')).toBe('/tickets/parent-123')
  })

  it('renders sequence ID in mono font', () => {
    render(<ParentTicketLink {...PROPS} />)
    const seqId = screen.getByText('TKT-001')
    expect(seqId.className).toContain('font-mono')
  })
})
