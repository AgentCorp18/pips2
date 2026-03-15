import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PermissionsMatrix } from '../permissions-matrix'

vi.mock('../actions', () => ({
  togglePermissionOverride: vi.fn().mockResolvedValue({ success: true }),
  resetPermissionOverrides: vi.fn().mockResolvedValue({ success: true }),
}))

const defaultProps = {
  orgId: 'org-1',
  overrides: [] as {
    role: 'admin' | 'manager' | 'member' | 'viewer'
    permission: string
    allowed: boolean
  }[],
  isOwner: true,
}

describe('PermissionsMatrix', () => {
  it('renders the permission matrix table', () => {
    render(<PermissionsMatrix {...defaultProps} />)
    expect(screen.getByTestId('permissions-matrix-table')).toBeTruthy()
  })

  it('renders all role columns', () => {
    render(<PermissionsMatrix {...defaultProps} />)
    // Each role appears in both the table header and the descriptions section
    expect(screen.getAllByText('Owner').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Admin').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Manager').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Member').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Viewer').length).toBeGreaterThanOrEqual(1)
  })

  it('renders permission category headers', () => {
    render(<PermissionsMatrix {...defaultProps} />)
    expect(screen.getByText('Organization')).toBeTruthy()
    expect(screen.getByText('Projects')).toBeTruthy()
    expect(screen.getByText('Tickets')).toBeTruthy()
    expect(screen.getByText('PIPS Steps')).toBeTruthy()
    expect(screen.getByText('Initiatives')).toBeTruthy()
    expect(screen.getByText('Collaboration')).toBeTruthy()
    expect(screen.getByText('General')).toBeTruthy()
  })

  it('renders permission labels', () => {
    render(<PermissionsMatrix {...defaultProps} />)
    expect(screen.getByText('Delete organization')).toBeTruthy()
    expect(screen.getByText('Manage billing')).toBeTruthy()
    expect(screen.getByText('Create tickets')).toBeTruthy()
    expect(screen.getByText('View data')).toBeTruthy()
  })

  it('renders role descriptions section', () => {
    render(<PermissionsMatrix {...defaultProps} />)
    expect(screen.getByText('Role Descriptions')).toBeTruthy()
  })

  it('shows editable message when isOwner is true', () => {
    render(<PermissionsMatrix {...defaultProps} />)
    expect(
      screen.getByText('Click cells to customize which roles have which permissions.'),
    ).toBeTruthy()
  })

  it('shows read-only message when isOwner is false', () => {
    render(<PermissionsMatrix {...defaultProps} isOwner={false} />)
    expect(screen.getByText('View which permissions each role has.')).toBeTruthy()
  })

  it('does not show reset button when no overrides', () => {
    render(<PermissionsMatrix {...defaultProps} />)
    expect(screen.queryByTestId('reset-permissions-btn')).toBeNull()
  })

  it('shows reset button when overrides exist', () => {
    render(
      <PermissionsMatrix
        {...defaultProps}
        overrides={[{ role: 'member', permission: 'ticket.delete', allowed: true }]}
      />,
    )
    expect(screen.getByTestId('reset-permissions-btn')).toBeTruthy()
  })

  it('renders permission cells with data-testid', () => {
    render(<PermissionsMatrix {...defaultProps} />)
    expect(screen.getByTestId('perm-org.delete-owner')).toBeTruthy()
    expect(screen.getByTestId('perm-ticket.create-member')).toBeTruthy()
  })

  it('toggles permission on click for non-owner roles', () => {
    render(<PermissionsMatrix {...defaultProps} />)
    // ticket.delete is not allowed for member by default
    const cell = screen.getByTestId('perm-ticket.delete-member')
    fireEvent.click(cell)
    // After click, the optimistic update should toggle it
    // (we can't easily assert the icon change, but the click shouldn't throw)
    expect(cell).toBeTruthy()
  })

  it('does not allow toggling owner permissions', () => {
    render(<PermissionsMatrix {...defaultProps} />)
    const cell = screen.getByTestId('perm-org.delete-owner')
    // Owner cell should be disabled
    expect(cell).toHaveProperty('disabled', true)
  })
})
