import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TeamWorkload } from '../team-workload'
import type { TeamWorkloadMember } from '@/app/(app)/teams/actions'

const MEMBERS: TeamWorkloadMember[] = [
  {
    user_id: 'u-1',
    name: 'Alice Smith',
    avatar_url: null,
    open_tickets: 3,
    in_progress: 2,
    completed: 10,
    overdue: 0,
  },
  {
    user_id: 'u-2',
    name: 'Bob Jones',
    avatar_url: null,
    open_tickets: 8,
    in_progress: 4,
    completed: 5,
    overdue: 2,
  },
  {
    user_id: 'u-3',
    name: 'Charlie',
    avatar_url: null,
    open_tickets: 0,
    in_progress: 0,
    completed: 15,
    overdue: 0,
  },
]

describe('TeamWorkload', () => {
  it('renders the workload component', () => {
    render(<TeamWorkload members={MEMBERS} />)
    expect(screen.getByTestId('team-workload')).toBeTruthy()
  })

  it('shows empty state when no members', () => {
    render(<TeamWorkload members={[]} />)
    expect(screen.getByTestId('team-workload-empty')).toBeTruthy()
    expect(screen.getByText('Add members to see workload distribution.')).toBeTruthy()
  })

  it('displays summary KPIs', () => {
    render(<TeamWorkload members={MEMBERS} />)
    const summary = screen.getByTestId('workload-summary')
    expect(summary).toBeTruthy()
    // Total open: 3 + 8 + 0 = 11
    expect(screen.getByText('11')).toBeTruthy()
    // Total in progress: 2 + 4 + 0 = 6
    expect(screen.getByText('6')).toBeTruthy()
    // Total completed: 10 + 5 + 15 = 30
    expect(screen.getByText('30')).toBeTruthy()
    // Total overdue: 0 + 2 + 0 = 2
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('renders each member', () => {
    render(<TeamWorkload members={MEMBERS} />)
    expect(screen.getByTestId('workload-member-u-1')).toBeTruthy()
    expect(screen.getByTestId('workload-member-u-2')).toBeTruthy()
    expect(screen.getByTestId('workload-member-u-3')).toBeTruthy()
  })

  it('shows member names', () => {
    render(<TeamWorkload members={MEMBERS} />)
    expect(screen.getByText('Alice Smith')).toBeTruthy()
    expect(screen.getByText('Bob Jones')).toBeTruthy()
    expect(screen.getByText('Charlie')).toBeTruthy()
  })

  it('displays correct workload levels', () => {
    render(<TeamWorkload members={MEMBERS} />)
    // Alice: 3 open, 0 overdue → Light
    expect(screen.getByTestId('workload-level-u-1').textContent).toBe('Light')
    // Bob: 8 open, 2 overdue → Overloaded
    expect(screen.getByTestId('workload-level-u-2').textContent).toBe('Overloaded')
    // Charlie: 0 open → Idle
    expect(screen.getByTestId('workload-level-u-3').textContent).toBe('Idle')
  })

  it('shows overdue count for overloaded members', () => {
    render(<TeamWorkload members={MEMBERS} />)
    expect(screen.getByTestId('workload-overdue-u-2')).toBeTruthy()
    expect(screen.getByTestId('workload-overdue-u-2').textContent).toBe('2 overdue')
  })

  it('does not show overdue for members with zero overdue', () => {
    render(<TeamWorkload members={MEMBERS} />)
    expect(screen.queryByTestId('workload-overdue-u-1')).toBeNull()
    expect(screen.queryByTestId('workload-overdue-u-3')).toBeNull()
  })

  it('shows open ticket counts', () => {
    render(<TeamWorkload members={MEMBERS} />)
    expect(screen.getByTestId('workload-open-u-1').textContent).toBe('3 open')
    expect(screen.getByTestId('workload-open-u-2').textContent).toBe('8 open')
    expect(screen.getByTestId('workload-open-u-3').textContent).toBe('0 open')
  })

  it('shows in progress counts', () => {
    render(<TeamWorkload members={MEMBERS} />)
    expect(screen.getByTestId('workload-ip-u-1').textContent).toBe('2 active')
    expect(screen.getByTestId('workload-ip-u-2').textContent).toBe('4 active')
  })

  it('renders the legend', () => {
    render(<TeamWorkload members={MEMBERS} />)
    const legend = screen.getByTestId('workload-legend')
    expect(legend).toBeTruthy()
    // Legend has all workload level labels — use getAllByText since some also appear in member badges
    expect(screen.getAllByText('Idle').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Heavy').length).toBeGreaterThanOrEqual(1)
  })

  it('sorts members by open tickets descending', () => {
    render(<TeamWorkload members={MEMBERS} />)
    const memberElements = screen.getByTestId('workload-members')
    const memberNodes = memberElements.querySelectorAll('[data-testid^="workload-member-"]')
    // Bob (8) should come first, then Alice (3), then Charlie (0)
    expect(memberNodes[0]?.getAttribute('data-testid')).toBe('workload-member-u-2')
    expect(memberNodes[1]?.getAttribute('data-testid')).toBe('workload-member-u-1')
    expect(memberNodes[2]?.getAttribute('data-testid')).toBe('workload-member-u-3')
  })

  it('displays avatar initial', () => {
    render(<TeamWorkload members={MEMBERS} />)
    // Alice → A, Bob → B, Charlie → C
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.getByText('B')).toBeTruthy()
    expect(screen.getByText('C')).toBeTruthy()
  })

  it('handles moderate workload level', () => {
    const moderateMember: TeamWorkloadMember[] = [
      {
        user_id: 'u-m',
        name: 'Mod Worker',
        avatar_url: null,
        open_tickets: 6,
        in_progress: 3,
        completed: 2,
        overdue: 0,
      },
    ]
    render(<TeamWorkload members={moderateMember} />)
    expect(screen.getByTestId('workload-level-u-m').textContent).toBe('Moderate')
  })

  it('handles heavy workload level', () => {
    const heavyMember: TeamWorkloadMember[] = [
      {
        user_id: 'u-h',
        name: 'Heavy Worker',
        avatar_url: null,
        open_tickets: 12,
        in_progress: 6,
        completed: 3,
        overdue: 0,
      },
    ]
    render(<TeamWorkload members={heavyMember} />)
    expect(screen.getByTestId('workload-level-u-h').textContent).toBe('Heavy')
  })
})
