import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CreateTeamDialog } from '../create-team-dialog'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('./actions', () => ({
  createTeam: vi.fn().mockResolvedValue({ success: true }),
}))

describe('CreateTeamDialog', () => {
  it('renders Create Team trigger button', () => {
    render(<CreateTeamDialog />)
    expect(screen.getByText('Create Team')).toBeTruthy()
  })

  it('trigger button is a button element', () => {
    render(<CreateTeamDialog />)
    expect(screen.getByText('Create Team').closest('button')).toBeTruthy()
  })

  it('opens dialog on trigger click', () => {
    render(<CreateTeamDialog />)
    fireEvent.click(screen.getByText('Create Team'))
    expect(screen.getByText('Create a new team')).toBeTruthy()
  })

  it('shows dialog description', () => {
    render(<CreateTeamDialog />)
    fireEvent.click(screen.getByText('Create Team'))
    expect(screen.getByText(/Teams help you organize members/)).toBeTruthy()
  })

  it('shows Team name input', () => {
    render(<CreateTeamDialog />)
    fireEvent.click(screen.getByText('Create Team'))
    expect(screen.getByLabelText('Team name')).toBeTruthy()
  })

  it('shows Cancel button in dialog', () => {
    render(<CreateTeamDialog />)
    fireEvent.click(screen.getByText('Create Team'))
    expect(screen.getByText('Cancel')).toBeTruthy()
  })
})
