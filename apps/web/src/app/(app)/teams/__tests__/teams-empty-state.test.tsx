import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TeamsEmptyState } from '../teams-empty-state'

vi.mock('../create-team-dialog', () => ({
  CreateTeamDialog: () => <button>Create Team</button>,
}))

describe('TeamsEmptyState', () => {
  it('renders "No teams yet" heading', () => {
    render(<TeamsEmptyState role="owner" />)
    expect(screen.getByText('No teams yet')).toBeTruthy()
  })

  it('renders heading as h3', () => {
    render(<TeamsEmptyState role="owner" />)
    const heading = screen.getByText('No teams yet')
    expect(heading.tagName).toBe('H3')
  })

  it('shows create prompt for owners', () => {
    render(<TeamsEmptyState role="owner" />)
    expect(screen.getByText(/Create your first team/)).toBeTruthy()
  })

  it('shows admin fallback for members', () => {
    render(<TeamsEmptyState role="member" />)
    expect(screen.getByText(/Ask an admin/)).toBeTruthy()
  })

  it('renders CreateTeamDialog for admins', () => {
    render(<TeamsEmptyState role="admin" />)
    expect(screen.getByText('Create Team')).toBeTruthy()
  })

  it('hides CreateTeamDialog for members', () => {
    render(<TeamsEmptyState role="member" />)
    expect(screen.queryByText('Create Team')).toBeNull()
  })

  it('has dashed border container', () => {
    const { container } = render(<TeamsEmptyState role="owner" />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('border-dashed')
  })
})
