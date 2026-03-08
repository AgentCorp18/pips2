import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MembersList, type OrgMember } from '../members-list'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('./actions', () => ({
  changeMemberRole: vi.fn().mockResolvedValue({ success: true }),
  removeMember: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@/components/ui/formatted-date', () => ({
  FormattedDate: ({ date }: { date: string }) => <span>{date}</span>,
}))

const MEMBERS: OrgMember[] = [
  {
    id: 'm-1',
    role: 'owner',
    joined_at: '2026-01-01',
    user_id: 'u-1',
    profiles: { full_name: 'Alice Owner', email: 'alice@co.com', avatar_url: null },
  },
  {
    id: 'm-2',
    role: 'admin',
    joined_at: '2026-02-01',
    user_id: 'u-2',
    profiles: { full_name: 'Bob Admin', email: 'bob@co.com', avatar_url: null },
  },
  {
    id: 'm-3',
    role: 'member',
    joined_at: '2026-03-01',
    user_id: 'u-3',
    profiles: { full_name: 'Carol Member', email: 'carol@co.com', avatar_url: null },
  },
]

describe('MembersList', () => {
  it('renders table headers', () => {
    render(
      <MembersList orgId="org-1" members={MEMBERS} currentUserId="u-1" currentUserRole="owner" />,
    )
    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.getByText('Email')).toBeTruthy()
    expect(screen.getByText('Role')).toBeTruthy()
    expect(screen.getByText('Joined')).toBeTruthy()
  })

  it('renders member names', () => {
    render(
      <MembersList orgId="org-1" members={MEMBERS} currentUserId="u-1" currentUserRole="owner" />,
    )
    expect(screen.getByText(/Alice Owner/)).toBeTruthy()
    expect(screen.getByText(/Bob Admin/)).toBeTruthy()
    expect(screen.getByText(/Carol Member/)).toBeTruthy()
  })

  it('renders member emails', () => {
    render(
      <MembersList orgId="org-1" members={MEMBERS} currentUserId="u-1" currentUserRole="owner" />,
    )
    expect(screen.getByText('alice@co.com')).toBeTruthy()
    expect(screen.getByText('bob@co.com')).toBeTruthy()
  })

  it('renders role badges', () => {
    render(
      <MembersList orgId="org-1" members={MEMBERS} currentUserId="u-1" currentUserRole="owner" />,
    )
    expect(screen.getByText('Owner')).toBeTruthy()
    expect(screen.getByText('Admin')).toBeTruthy()
    expect(screen.getByText('Member')).toBeTruthy()
  })

  it('shows (you) indicator for current user', () => {
    render(
      <MembersList orgId="org-1" members={MEMBERS} currentUserId="u-1" currentUserRole="owner" />,
    )
    expect(screen.getByText('(you)')).toBeTruthy()
  })

  it('renders table element', () => {
    const { container } = render(
      <MembersList orgId="org-1" members={MEMBERS} currentUserId="u-1" currentUserRole="owner" />,
    )
    expect(container.querySelector('table')).toBeTruthy()
  })

  it('renders action buttons for manageable members', () => {
    render(
      <MembersList orgId="org-1" members={MEMBERS} currentUserId="u-1" currentUserRole="owner" />,
    )
    // Owner can manage admin and member but not themselves
    const actionBtns = screen.getAllByText('Actions')
    expect(actionBtns.length).toBeGreaterThanOrEqual(1)
  })
})
