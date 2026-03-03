import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PermissionGate } from '../permission-gate'

/* ============================================================
   Mocks
   ============================================================ */

vi.mock('@/hooks/use-permissions', () => ({
  usePermissions: (role: string | null) => ({
    can: (permission: string) => {
      if (!role) return false
      // Simplified permission logic matching the real implementation
      const perms: Record<string, string[]> = {
        'org.delete': ['owner'],
        'org.billing': ['owner'],
        'org.members.manage': ['owner', 'admin'],
        'project.create': ['owner', 'admin', 'manager', 'member'],
        'project.update': ['owner', 'admin', 'manager'],
        'step.complete': ['owner', 'admin', 'manager'],
        'step.override': ['owner', 'admin', 'manager'],
        'data.view': ['owner', 'admin', 'manager', 'member', 'viewer'],
        'ticket.create': ['owner', 'admin', 'manager', 'member'],
      }
      return (perms[permission] ?? []).includes(role)
    },
    role,
  }),
}))

/* ============================================================
   Tests
   ============================================================ */

describe('PermissionGate', () => {
  it('renders children when user has required permission', () => {
    render(
      <PermissionGate role="owner" permission="project.create">
        <button>Create Project</button>
      </PermissionGate>,
    )
    expect(screen.getByRole('button', { name: 'Create Project' })).toBeInTheDocument()
  })

  it('hides children when user lacks permission', () => {
    render(
      <PermissionGate role="viewer" permission="project.create">
        <button>Create Project</button>
      </PermissionGate>,
    )
    expect(screen.queryByRole('button', { name: 'Create Project' })).not.toBeInTheDocument()
  })

  it('renders fallback when user lacks permission', () => {
    render(
      <PermissionGate role="viewer" permission="project.create" fallback={<span>No access</span>}>
        <button>Create Project</button>
      </PermissionGate>,
    )
    expect(screen.queryByRole('button', { name: 'Create Project' })).not.toBeInTheDocument()
    expect(screen.getByText('No access')).toBeInTheDocument()
  })

  it('renders nothing when role is null', () => {
    render(
      <PermissionGate role={null} permission="data.view">
        <span>Protected content</span>
      </PermissionGate>,
    )
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('allows owner to access org.delete', () => {
    render(
      <PermissionGate role="owner" permission="org.delete">
        <span>Delete Org</span>
      </PermissionGate>,
    )
    expect(screen.getByText('Delete Org')).toBeInTheDocument()
  })

  it('blocks admin from org.delete', () => {
    render(
      <PermissionGate role="admin" permission="org.delete">
        <span>Delete Org</span>
      </PermissionGate>,
    )
    expect(screen.queryByText('Delete Org')).not.toBeInTheDocument()
  })

  it('allows member to view data', () => {
    render(
      <PermissionGate role="member" permission="data.view">
        <span>Dashboard</span>
      </PermissionGate>,
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('allows viewer to view data', () => {
    render(
      <PermissionGate role="viewer" permission="data.view">
        <span>Dashboard</span>
      </PermissionGate>,
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('blocks member from step.override', () => {
    render(
      <PermissionGate role="member" permission="step.override">
        <span>Override Step</span>
      </PermissionGate>,
    )
    expect(screen.queryByText('Override Step')).not.toBeInTheDocument()
  })

  it('allows manager to complete steps', () => {
    render(
      <PermissionGate role="manager" permission="step.complete">
        <span>Complete Step</span>
      </PermissionGate>,
    )
    expect(screen.getByText('Complete Step')).toBeInTheDocument()
  })

  it('renders null fallback by default when not authorized', () => {
    const { container } = render(
      <PermissionGate role="viewer" permission="org.delete">
        <span>Secret</span>
      </PermissionGate>,
    )
    expect(container.innerHTML).toBe('')
  })
})
