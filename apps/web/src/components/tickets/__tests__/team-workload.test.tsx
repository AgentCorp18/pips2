import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TeamWorkload } from '../team-workload'
import type { WorkloadMember } from '@/app/(app)/tickets/workload/actions'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

const SAMPLE_MEMBERS: WorkloadMember[] = [
  {
    user_id: 'u-1',
    display_name: 'Alice Smith',
    avatar_url: null,
    tickets: [
      {
        id: 't-1',
        title: 'Fix login',
        status: 'in_progress',
        priority: 'critical',
        type: 'bug',
        due_date: '2026-03-15',
        sequence_number: 10,
        project_title: 'Auth',
      },
      {
        id: 't-2',
        title: 'Update docs',
        status: 'todo',
        priority: 'medium',
        type: 'task',
        due_date: null,
        sequence_number: 11,
        project_title: null,
      },
      {
        id: 't-3',
        title: 'Code review',
        status: 'in_review',
        priority: 'high',
        type: 'task',
        due_date: '2026-03-20',
        sequence_number: 12,
        project_title: 'PIPS',
      },
      {
        id: 't-4',
        title: 'Deploy v2',
        status: 'blocked',
        priority: 'high',
        type: 'task',
        due_date: '2026-03-18',
        sequence_number: 13,
        project_title: 'Infra',
      },
    ],
  },
  {
    user_id: 'u-2',
    display_name: 'Bob Jones',
    avatar_url: 'https://example.com/bob.jpg',
    tickets: [
      {
        id: 't-5',
        title: 'Design mockup',
        status: 'in_progress',
        priority: 'low',
        type: 'feature',
        due_date: '2026-04-01',
        sequence_number: 20,
        project_title: 'UI',
      },
    ],
  },
  {
    user_id: 'u-3',
    display_name: 'Charlie Brown',
    avatar_url: null,
    tickets: [],
  },
]

describe('TeamWorkload', () => {
  it('renders the workload container', () => {
    render(<TeamWorkload members={[]} unassignedCount={0} prefix="TKT" />)
    expect(screen.getByTestId('team-workload')).toBeTruthy()
  })

  it('shows empty state when no members', () => {
    render(<TeamWorkload members={[]} unassignedCount={0} prefix="TKT" />)
    expect(screen.getByTestId('workload-empty')).toBeTruthy()
    expect(screen.getByText('No team members found')).toBeTruthy()
  })

  it('renders summary cards', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={2} prefix="TKT" />)
    expect(screen.getByTestId('workload-total')).toBeTruthy()
    expect(screen.getByTestId('workload-active-members')).toBeTruthy()
    expect(screen.getByTestId('workload-blocked')).toBeTruthy()
    expect(screen.getByTestId('workload-overdue')).toBeTruthy()
  })

  it('shows correct total open count including unassigned', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={2} prefix="TKT" />)
    // 4 + 1 + 0 member tickets + 2 unassigned = 7
    const total = screen.getByTestId('workload-total')
    expect(total.textContent).toContain('7')
  })

  it('shows active member count', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    const active = screen.getByTestId('workload-active-members')
    // 2 members with tickets / 3 total
    expect(active.textContent).toContain('2')
    expect(active.textContent).toContain('/3')
  })

  it('shows blocked count', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    const blocked = screen.getByTestId('workload-blocked')
    expect(blocked.textContent).toContain('1')
  })

  it('renders member rows', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    expect(screen.getByTestId('workload-member-u-1')).toBeTruthy()
    expect(screen.getByTestId('workload-member-u-2')).toBeTruthy()
    expect(screen.getByTestId('workload-member-u-3')).toBeTruthy()
  })

  it('displays member names', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    expect(screen.getByText('Alice Smith')).toBeTruthy()
    expect(screen.getByText('Bob Jones')).toBeTruthy()
    expect(screen.getByText('Charlie Brown')).toBeTruthy()
  })

  it('shows workload level badges', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    // Alice: 4 tickets → Moderate
    expect(screen.getByText('Moderate')).toBeTruthy()
    // Bob: 1 ticket → Light
    expect(screen.getByText('Light')).toBeTruthy()
    // Charlie: 0 tickets → Idle
    expect(screen.getByText('Idle')).toBeTruthy()
  })

  it('shows unassigned count when > 0', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={5} prefix="TKT" />)
    expect(screen.getByTestId('workload-unassigned-count')).toBeTruthy()
    expect(screen.getByTestId('workload-unassigned-count').textContent).toBe('5')
  })

  it('hides unassigned row when count is 0', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    expect(screen.queryByTestId('workload-unassigned-count')).toBeNull()
  })

  it('expands member detail on click', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    expect(screen.queryByTestId('workload-detail-u-1')).toBeNull()

    fireEvent.click(screen.getByTestId('workload-member-u-1'))
    expect(screen.getByTestId('workload-detail-u-1')).toBeTruthy()
  })

  it('shows ticket details in expanded view', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('workload-member-u-1'))

    expect(screen.getByTestId('workload-ticket-t-1')).toBeTruthy()
    expect(screen.getByText('Fix login')).toBeTruthy()
    expect(screen.getByText('TKT-10')).toBeTruthy()
  })

  it('collapses expanded member on second click', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('workload-member-u-1'))
    expect(screen.getByTestId('workload-detail-u-1')).toBeTruthy()

    fireEvent.click(screen.getByTestId('workload-member-u-1'))
    expect(screen.queryByTestId('workload-detail-u-1')).toBeNull()
  })

  it('does not show detail for member with no tickets', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('workload-member-u-3'))
    // Charlie has 0 tickets, so no detail panel
    expect(screen.queryByTestId('workload-detail-u-3')).toBeNull()
  })

  it('renders priority legend', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    expect(screen.getByText('Priority:')).toBeTruthy()
    expect(screen.getByText('critical')).toBeTruthy()
    expect(screen.getByText('high')).toBeTruthy()
  })

  it('renders workload chart', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    expect(screen.getByTestId('workload-chart')).toBeTruthy()
  })

  it('links tickets to detail pages', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    fireEvent.click(screen.getByTestId('workload-member-u-1'))
    const ticketLink = screen.getByTestId('workload-ticket-t-1')
    expect(ticketLink.getAttribute('href')).toBe('/tickets/t-1')
  })

  it('shows avatar image when url is provided', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    const bobRow = screen.getByTestId('workload-member-u-2')
    const img = bobRow.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.getAttribute('src')).toBe('https://example.com/bob.jpg')
  })

  it('shows initials when no avatar url', () => {
    render(<TeamWorkload members={SAMPLE_MEMBERS} unassignedCount={0} prefix="TKT" />)
    // Alice Smith → "AS"
    expect(screen.getByText('AS')).toBeTruthy()
  })
})
