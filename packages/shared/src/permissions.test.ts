import { describe, it, expect } from 'vitest'
import {
  PERMISSIONS,
  hasPermission,
  ROLE_HIERARCHY,
  canManageRole,
  ROLES_ORDERED,
  ROLE_LABELS,
} from './permissions'
import type { OrgRole } from './types'

describe('PERMISSIONS', () => {
  it('org.delete is owner-only', () => {
    expect(PERMISSIONS['org.delete']).toEqual(['owner'])
  })

  it('data.view is available to all roles', () => {
    expect(PERMISSIONS['data.view']).toEqual(['owner', 'admin', 'manager', 'member', 'viewer'])
  })

  it('ticket.create excludes viewer', () => {
    expect(PERMISSIONS['ticket.create']).not.toContain('viewer')
  })
})

describe('hasPermission', () => {
  it('owner can do everything', () => {
    for (const perm of Object.keys(PERMISSIONS)) {
      expect(hasPermission('owner', perm as keyof typeof PERMISSIONS)).toBe(true)
    }
  })

  it('viewer can only view data and edit profile', () => {
    expect(hasPermission('viewer', 'data.view')).toBe(true)
    expect(hasPermission('viewer', 'profile.edit')).toBe(true)
    expect(hasPermission('viewer', 'ticket.create')).toBe(false)
    expect(hasPermission('viewer', 'org.delete')).toBe(false)
  })

  it('admin cannot delete org', () => {
    expect(hasPermission('admin', 'org.delete')).toBe(false)
  })

  it('manager can manage teams', () => {
    expect(hasPermission('manager', 'org.teams.manage')).toBe(true)
  })

  it('member cannot manage teams', () => {
    expect(hasPermission('member', 'org.teams.manage')).toBe(false)
  })
})

describe('ROLE_HIERARCHY', () => {
  it('owner has highest rank', () => {
    expect(ROLE_HIERARCHY.owner).toBe(5)
  })

  it('viewer has lowest rank', () => {
    expect(ROLE_HIERARCHY.viewer).toBe(1)
  })

  it('roles are strictly ordered', () => {
    expect(ROLE_HIERARCHY.owner).toBeGreaterThan(ROLE_HIERARCHY.admin)
    expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.manager)
    expect(ROLE_HIERARCHY.manager).toBeGreaterThan(ROLE_HIERARCHY.member)
    expect(ROLE_HIERARCHY.member).toBeGreaterThan(ROLE_HIERARCHY.viewer)
  })
})

describe('canManageRole', () => {
  it('owner can manage admin', () => {
    expect(canManageRole('owner', 'admin')).toBe(true)
  })

  it('admin cannot manage owner', () => {
    expect(canManageRole('admin', 'owner')).toBe(false)
  })

  it('admin cannot manage admin (same level)', () => {
    expect(canManageRole('admin', 'admin')).toBe(false)
  })

  it('manager can manage member', () => {
    expect(canManageRole('manager', 'member')).toBe(true)
  })

  it('viewer cannot manage anyone', () => {
    const roles: OrgRole[] = ['owner', 'admin', 'manager', 'member', 'viewer']
    for (const r of roles) {
      expect(canManageRole('viewer', r)).toBe(false)
    }
  })
})

describe('ROLES_ORDERED', () => {
  it('is ordered from highest to lowest', () => {
    expect(ROLES_ORDERED).toEqual(['owner', 'admin', 'manager', 'member', 'viewer'])
  })
})

describe('ROLE_LABELS', () => {
  it('has a label for every role', () => {
    const roles: OrgRole[] = ['owner', 'admin', 'manager', 'member', 'viewer']
    for (const r of roles) {
      expect(ROLE_LABELS[r]).toBeTruthy()
    }
  })

  it('labels are title-cased', () => {
    for (const label of Object.values(ROLE_LABELS)) {
      expect(label[0]).toBe(label[0]?.toUpperCase())
    }
  })
})
