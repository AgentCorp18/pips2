import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddMemberDialog } from '../add-member-dialog'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('../../actions', () => ({
  addTeamMember: vi.fn().mockResolvedValue({ success: true }),
}))

const MEMBERS = [
  { user_id: 'u-1', full_name: 'Alice Johnson', email: 'alice@co.com' },
  { user_id: 'u-2', full_name: 'Bob Smith', email: 'bob@co.com' },
]

describe('AddMemberDialog', () => {
  it('renders Add Member trigger button', () => {
    render(<AddMemberDialog teamId="t-1" availableMembers={MEMBERS} />)
    expect(screen.getByText('Add Member')).toBeTruthy()
  })

  it('opens dialog on click', () => {
    render(<AddMemberDialog teamId="t-1" availableMembers={MEMBERS} />)
    fireEvent.click(screen.getByText('Add Member'))
    expect(screen.getByText('Add a team member')).toBeTruthy()
  })

  it('shows dialog description', () => {
    render(<AddMemberDialog teamId="t-1" availableMembers={MEMBERS} />)
    fireEvent.click(screen.getByText('Add Member'))
    expect(screen.getByText(/Select an organization member/)).toBeTruthy()
  })

  it('shows Organization member label', () => {
    render(<AddMemberDialog teamId="t-1" availableMembers={MEMBERS} />)
    fireEvent.click(screen.getByText('Add Member'))
    expect(screen.getByText('Organization member')).toBeTruthy()
  })

  it('shows Cancel button', () => {
    render(<AddMemberDialog teamId="t-1" availableMembers={MEMBERS} />)
    fireEvent.click(screen.getByText('Add Member'))
    expect(screen.getByText('Cancel')).toBeTruthy()
  })

  it('renders Add Member submit button in dialog', () => {
    render(<AddMemberDialog teamId="t-1" availableMembers={MEMBERS} />)
    fireEvent.click(screen.getByText('Add Member'))
    // There are 2 "Add Member" buttons — the trigger and the submit
    const buttons = screen.getAllByText('Add Member')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })
})
