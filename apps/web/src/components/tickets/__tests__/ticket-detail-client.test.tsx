import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TicketDetailClient } from '../ticket-detail-client'

vi.mock('@/app/(app)/tickets/actions', () => ({
  updateTicket: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@/components/ui/formatted-date', () => ({
  FormattedDate: ({ date, fallback }: { date: string; fallback?: string }) => (
    <span>{date || fallback || '...'}</span>
  ),
}))

const mockTicket = {
  id: 't-1',
  title: 'Fix login bug',
  description: 'Users cannot log in on mobile',
  status: 'in_progress' as const,
  priority: 'high' as const,
  type: 'bug' as const,
  assignee_id: 'u-1',
  due_date: '2026-04-01',
  tags: ['auth', 'mobile'],
  project: { id: 'p-1', title: 'Auth Redesign' },
  assignee: { id: 'u-1', display_name: 'Alice Smith', avatar_url: null },
  reporter: { id: 'u-2', display_name: 'Bob Jones', avatar_url: null },
  created_at: '2026-03-01T00:00:00Z',
  updated_at: '2026-03-02T00:00:00Z',
}

const mockMembers = [
  { user_id: 'u-1', display_name: 'Alice Smith' },
  { user_id: 'u-2', display_name: 'Bob Jones' },
]

describe('TicketDetailClient', () => {
  it('renders ticket sequence ID', () => {
    render(<TicketDetailClient ticket={mockTicket} sequenceId="TKT-001" members={mockMembers} />)
    expect(screen.getByText('TKT-001')).toBeTruthy()
  })

  it('renders ticket title', () => {
    render(<TicketDetailClient ticket={mockTicket} sequenceId="TKT-001" members={mockMembers} />)
    expect(screen.getByText('Fix login bug')).toBeTruthy()
  })

  it('renders status badge', () => {
    render(<TicketDetailClient ticket={mockTicket} sequenceId="TKT-001" members={mockMembers} />)
    const matches = screen.getAllByText('In Progress')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('renders priority badge', () => {
    render(<TicketDetailClient ticket={mockTicket} sequenceId="TKT-001" members={mockMembers} />)
    const matches = screen.getAllByText('High')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Description heading', () => {
    render(<TicketDetailClient ticket={mockTicket} sequenceId="TKT-001" members={mockMembers} />)
    expect(screen.getByText('Description')).toBeTruthy()
  })

  it('renders description text', () => {
    render(<TicketDetailClient ticket={mockTicket} sequenceId="TKT-001" members={mockMembers} />)
    expect(screen.getByText('Users cannot log in on mobile')).toBeTruthy()
  })

  it('renders sidebar field labels', () => {
    render(<TicketDetailClient ticket={mockTicket} sequenceId="TKT-001" members={mockMembers} />)
    expect(screen.getByText('Status')).toBeTruthy()
    expect(screen.getByText('Priority')).toBeTruthy()
    expect(screen.getByText('Assignee')).toBeTruthy()
    expect(screen.getByText('Reporter')).toBeTruthy()
    expect(screen.getByText('Due Date')).toBeTruthy()
  })

  it('renders reporter name', () => {
    render(<TicketDetailClient ticket={mockTicket} sequenceId="TKT-001" members={mockMembers} />)
    expect(screen.getByText('Bob Jones')).toBeTruthy()
  })

  it('renders project name', () => {
    render(<TicketDetailClient ticket={mockTicket} sequenceId="TKT-001" members={mockMembers} />)
    expect(screen.getByText('Project')).toBeTruthy()
    expect(screen.getByText('Auth Redesign')).toBeTruthy()
  })

  it('renders tags', () => {
    render(<TicketDetailClient ticket={mockTicket} sequenceId="TKT-001" members={mockMembers} />)
    expect(screen.getByText('Tags')).toBeTruthy()
    expect(screen.getByText('auth')).toBeTruthy()
    expect(screen.getByText('mobile')).toBeTruthy()
  })

  it('renders empty description placeholder when null', () => {
    const ticket = { ...mockTicket, description: null }
    render(<TicketDetailClient ticket={ticket} sequenceId="TKT-001" members={mockMembers} />)
    expect(screen.getByText('Click to add a description...')).toBeTruthy()
  })

  it('hides project section when no project', () => {
    const ticket = { ...mockTicket, project: null }
    render(<TicketDetailClient ticket={ticket} sequenceId="TKT-001" members={mockMembers} />)
    expect(screen.queryByText('Auth Redesign')).toBeNull()
  })

  it('shows No due date when due_date is null', () => {
    const ticket = { ...mockTicket, due_date: null }
    render(<TicketDetailClient ticket={ticket} sequenceId="TKT-001" members={mockMembers} />)
    expect(screen.getByText('No due date')).toBeTruthy()
  })
})
