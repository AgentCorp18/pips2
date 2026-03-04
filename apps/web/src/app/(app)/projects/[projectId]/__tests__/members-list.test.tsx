import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MembersList } from '../members-list'
import type { ProjectMember } from '../overview-actions'

const MEMBERS: ProjectMember[] = [
  { userId: 'u-1', displayName: 'Alice Johnson', avatarUrl: null, role: 'lead' },
  { userId: 'u-2', displayName: 'Bob Smith', avatarUrl: null, role: 'member' },
]

describe('MembersList', () => {
  it('renders Team Members heading', () => {
    render(<MembersList members={MEMBERS} />)
    expect(screen.getByText('Team Members')).toBeTruthy()
  })

  it('renders member count badge', () => {
    render(<MembersList members={MEMBERS} />)
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('renders member names', () => {
    render(<MembersList members={MEMBERS} />)
    expect(screen.getByText('Alice Johnson')).toBeTruthy()
    expect(screen.getByText('Bob Smith')).toBeTruthy()
  })

  it('renders role labels', () => {
    render(<MembersList members={MEMBERS} />)
    expect(screen.getByText('Lead')).toBeTruthy()
    expect(screen.getByText('Member')).toBeTruthy()
  })

  it('renders initials for members', () => {
    render(<MembersList members={MEMBERS} />)
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.getByText('B')).toBeTruthy()
  })

  it('renders list items', () => {
    const { container } = render(<MembersList members={MEMBERS} />)
    expect(container.querySelectorAll('li').length).toBe(2)
  })

  it('renders empty state when no members', () => {
    render(<MembersList members={[]} />)
    expect(screen.getByText('No team members assigned yet.')).toBeTruthy()
  })
})
