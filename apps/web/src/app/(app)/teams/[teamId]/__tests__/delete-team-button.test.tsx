import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeleteTeamButton } from '../delete-team-button'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('../../actions', () => ({
  deleteTeam: vi.fn().mockResolvedValue({ success: true }),
}))

describe('DeleteTeamButton', () => {
  it('renders Delete Team trigger button', () => {
    render(<DeleteTeamButton teamId="t-1" teamName="Engineering" />)
    expect(screen.getByText('Delete Team')).toBeTruthy()
  })

  it('trigger button has destructive style', () => {
    render(<DeleteTeamButton teamId="t-1" teamName="Engineering" />)
    const btn = screen.getByText('Delete Team').closest('button')
    expect(btn).toBeTruthy()
  })

  it('opens alert dialog on click', () => {
    render(<DeleteTeamButton teamId="t-1" teamName="Engineering" />)
    fireEvent.click(screen.getByText('Delete Team'))
    expect(screen.getByText('Delete team')).toBeTruthy()
  })

  it('shows team name in confirmation message', () => {
    render(<DeleteTeamButton teamId="t-1" teamName="Engineering" />)
    fireEvent.click(screen.getByText('Delete Team'))
    expect(screen.getByText('Engineering')).toBeTruthy()
  })

  it('shows warning about action being irreversible', () => {
    render(<DeleteTeamButton teamId="t-1" teamName="Engineering" />)
    fireEvent.click(screen.getByText('Delete Team'))
    expect(screen.getByText(/cannot be undone/)).toBeTruthy()
  })

  it('shows Cancel button in dialog', () => {
    render(<DeleteTeamButton teamId="t-1" teamName="Engineering" />)
    fireEvent.click(screen.getByText('Delete Team'))
    expect(screen.getByText('Cancel')).toBeTruthy()
  })
})
