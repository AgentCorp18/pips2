import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InviteDialog } from '../invite-dialog'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('./actions', () => ({
  inviteMember: vi.fn().mockResolvedValue({ success: true }),
}))

describe('InviteDialog', () => {
  it('renders Invite Member trigger button', () => {
    render(<InviteDialog orgId="org-1" actorRole="owner" />)
    expect(screen.getByText('Invite Member')).toBeTruthy()
  })

  it('trigger button is a button element', () => {
    render(<InviteDialog orgId="org-1" actorRole="owner" />)
    expect(screen.getByText('Invite Member').closest('button')).toBeTruthy()
  })

  it('opens dialog on click', () => {
    render(<InviteDialog orgId="org-1" actorRole="owner" />)
    fireEvent.click(screen.getByText('Invite Member'))
    expect(screen.getByText('Invite a new member')).toBeTruthy()
  })

  it('shows dialog description', () => {
    render(<InviteDialog orgId="org-1" actorRole="owner" />)
    fireEvent.click(screen.getByText('Invite Member'))
    expect(screen.getByText(/Enter the email address/)).toBeTruthy()
  })

  it('shows email input', () => {
    render(<InviteDialog orgId="org-1" actorRole="owner" />)
    fireEvent.click(screen.getByText('Invite Member'))
    expect(screen.getByLabelText('Email address')).toBeTruthy()
  })

  it('shows role select', () => {
    render(<InviteDialog orgId="org-1" actorRole="owner" />)
    fireEvent.click(screen.getByText('Invite Member'))
    expect(screen.getByText('Role')).toBeTruthy()
  })

  it('shows Send Invite button', () => {
    render(<InviteDialog orgId="org-1" actorRole="owner" />)
    fireEvent.click(screen.getByText('Invite Member'))
    expect(screen.getByText('Send Invite')).toBeTruthy()
  })

  it('shows Cancel button', () => {
    render(<InviteDialog orgId="org-1" actorRole="owner" />)
    fireEvent.click(screen.getByText('Invite Member'))
    expect(screen.getByText('Cancel')).toBeTruthy()
  })
})
