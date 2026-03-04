import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TeamMembersList } from '../team-members-list'
import type { TeamMember } from '../../actions'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('../../actions', () => ({
  removeTeamMember: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('../add-member-dialog', () => ({
  AddMemberDialog: () => <button>Add Member</button>,
}))

vi.mock('@/components/ui/formatted-date', () => ({
  FormattedDate: ({ date }: { date: string }) => <span>{date}</span>,
}))

const MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    user_id: 'u-1',
    role: 'lead',
    joined_at: '2026-01-01',
    profiles: {
      full_name: 'Alice Johnson',
      display_name: 'Alice',
      email: 'alice@co.com',
      avatar_url: null,
    },
  },
  {
    id: 'tm-2',
    user_id: 'u-2',
    role: 'member',
    joined_at: '2026-02-01',
    profiles: {
      full_name: 'Bob Smith',
      display_name: null,
      email: 'bob@co.com',
      avatar_url: null,
    },
  },
]

const AVAILABLE = [{ user_id: 'u-3', full_name: 'Carol', email: 'carol@co.com' }]

describe('TeamMembersList', () => {
  it('renders Members heading with count', () => {
    render(
      <TeamMembersList
        teamId="t-1"
        members={MEMBERS}
        canManage={true}
        availableMembers={AVAILABLE}
      />,
    )
    expect(screen.getByText('Members (2)')).toBeTruthy()
  })

  it('renders member names', () => {
    render(
      <TeamMembersList
        teamId="t-1"
        members={MEMBERS}
        canManage={true}
        availableMembers={AVAILABLE}
      />,
    )
    expect(screen.getByText('Alice')).toBeTruthy()
    expect(screen.getByText('Bob Smith')).toBeTruthy()
  })

  it('renders member emails', () => {
    render(
      <TeamMembersList
        teamId="t-1"
        members={MEMBERS}
        canManage={true}
        availableMembers={AVAILABLE}
      />,
    )
    expect(screen.getByText('alice@co.com')).toBeTruthy()
    expect(screen.getByText('bob@co.com')).toBeTruthy()
  })

  it('renders role badges', () => {
    render(
      <TeamMembersList
        teamId="t-1"
        members={MEMBERS}
        canManage={true}
        availableMembers={AVAILABLE}
      />,
    )
    expect(screen.getByText('Lead')).toBeTruthy()
    expect(screen.getByText('Member')).toBeTruthy()
  })

  it('renders table headers', () => {
    render(
      <TeamMembersList
        teamId="t-1"
        members={MEMBERS}
        canManage={true}
        availableMembers={AVAILABLE}
      />,
    )
    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.getByText('Email')).toBeTruthy()
    expect(screen.getByText('Role')).toBeTruthy()
    expect(screen.getByText('Joined')).toBeTruthy()
  })

  it('renders remove buttons when canManage', () => {
    render(
      <TeamMembersList
        teamId="t-1"
        members={MEMBERS}
        canManage={true}
        availableMembers={AVAILABLE}
      />,
    )
    const removeButtons = screen.getAllByText('Remove member')
    expect(removeButtons.length).toBe(2)
  })

  it('hides remove buttons when cannot manage', () => {
    render(
      <TeamMembersList
        teamId="t-1"
        members={MEMBERS}
        canManage={false}
        availableMembers={AVAILABLE}
      />,
    )
    expect(screen.queryByText('Remove member')).toBeNull()
  })

  it('renders Add Member when canManage', () => {
    render(
      <TeamMembersList
        teamId="t-1"
        members={MEMBERS}
        canManage={true}
        availableMembers={AVAILABLE}
      />,
    )
    expect(screen.getByText('Add Member')).toBeTruthy()
  })

  it('renders empty state when no members', () => {
    render(
      <TeamMembersList teamId="t-1" members={[]} canManage={true} availableMembers={AVAILABLE} />,
    )
    expect(screen.getByText(/No members yet/)).toBeTruthy()
  })
})
