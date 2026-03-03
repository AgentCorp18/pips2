import { describe, it, expect } from 'vitest'
import {
  PERMISSIONS,
  hasPermission,
  ROLE_HIERARCHY,
  canManageRole,
  ROLES_ORDERED,
  ROLE_LABELS,
} from '@pips/shared'
import type { OrgRole, Permission } from '@pips/shared'

/* ============================================================
   PERMISSIONS matrix
   ============================================================ */

describe('PERMISSIONS', () => {
  const allRoles: OrgRole[] = ['owner', 'admin', 'manager', 'member', 'viewer']

  it('has all expected permission keys', () => {
    const expectedKeys = [
      'org.delete',
      'org.billing',
      'org.members.manage',
      'org.teams.manage',
      'org.integrations.manage',
      'project.create',
      'ticket.create',
      'ticket.assign',
      'ticket.comment',
      'step.override',
      'data.view',
      'profile.edit',
    ]
    for (const key of expectedKeys) {
      expect(PERMISSIONS).toHaveProperty(key)
    }
  })

  it('every permission value is an array of valid roles', () => {
    for (const [_key, roles] of Object.entries(PERMISSIONS)) {
      expect(Array.isArray(roles)).toBe(true)
      for (const role of roles) {
        expect(allRoles).toContain(role)
      }
    }
  })
})

/* ============================================================
   hasPermission
   ============================================================ */

describe('hasPermission', () => {
  it('owner has all permissions', () => {
    const allPermissions = Object.keys(PERMISSIONS) as Permission[]
    for (const perm of allPermissions) {
      expect(hasPermission('owner', perm)).toBe(true)
    }
  })

  it('admin has org.members.manage', () => {
    expect(hasPermission('admin', 'org.members.manage')).toBe(true)
  })

  it('admin does not have org.delete', () => {
    expect(hasPermission('admin', 'org.delete')).toBe(false)
  })

  it('admin does not have org.billing', () => {
    expect(hasPermission('admin', 'org.billing')).toBe(false)
  })

  it('viewer can view data and edit profile', () => {
    expect(hasPermission('viewer', 'data.view')).toBe(true)
    expect(hasPermission('viewer', 'profile.edit')).toBe(true)
  })

  it('viewer cannot create tickets', () => {
    expect(hasPermission('viewer', 'ticket.create')).toBe(false)
  })

  it('viewer cannot create projects', () => {
    expect(hasPermission('viewer', 'project.create')).toBe(false)
  })

  it('viewer cannot manage members', () => {
    expect(hasPermission('viewer', 'org.members.manage')).toBe(false)
  })

  it('member can create tickets and projects', () => {
    expect(hasPermission('member', 'ticket.create')).toBe(true)
    expect(hasPermission('member', 'project.create')).toBe(true)
  })

  it('member cannot manage members', () => {
    expect(hasPermission('member', 'org.members.manage')).toBe(false)
  })

  it('member cannot manage teams', () => {
    expect(hasPermission('member', 'org.teams.manage')).toBe(false)
  })

  it('manager can manage teams but not members', () => {
    expect(hasPermission('manager', 'org.teams.manage')).toBe(true)
    expect(hasPermission('manager', 'org.members.manage')).toBe(false)
  })

  it('manager can override steps', () => {
    expect(hasPermission('manager', 'step.override')).toBe(true)
  })

  it('member cannot override steps', () => {
    expect(hasPermission('member', 'step.override')).toBe(false)
  })
})

/* ============================================================
   ROLE_HIERARCHY
   ============================================================ */

describe('ROLE_HIERARCHY', () => {
  it('has all 5 roles', () => {
    expect(Object.keys(ROLE_HIERARCHY)).toHaveLength(5)
  })

  it('owner has the highest rank', () => {
    expect(ROLE_HIERARCHY.owner).toBeGreaterThan(ROLE_HIERARCHY.admin)
    expect(ROLE_HIERARCHY.owner).toBeGreaterThan(ROLE_HIERARCHY.manager)
    expect(ROLE_HIERARCHY.owner).toBeGreaterThan(ROLE_HIERARCHY.member)
    expect(ROLE_HIERARCHY.owner).toBeGreaterThan(ROLE_HIERARCHY.viewer)
  })

  it('viewer has the lowest rank', () => {
    expect(ROLE_HIERARCHY.viewer).toBeLessThan(ROLE_HIERARCHY.member)
  })
})

/* ============================================================
   canManageRole
   ============================================================ */

describe('canManageRole', () => {
  it('owner can manage admin', () => {
    expect(canManageRole('owner', 'admin')).toBe(true)
  })

  it('admin can manage member', () => {
    expect(canManageRole('admin', 'member')).toBe(true)
  })

  it('member cannot manage admin', () => {
    expect(canManageRole('member', 'admin')).toBe(false)
  })

  it('same role cannot manage itself', () => {
    expect(canManageRole('admin', 'admin')).toBe(false)
  })
})

/* ============================================================
   ROLES_ORDERED and ROLE_LABELS
   ============================================================ */

describe('ROLES_ORDERED', () => {
  it('has 5 roles in hierarchy order', () => {
    expect(ROLES_ORDERED).toEqual(['owner', 'admin', 'manager', 'member', 'viewer'])
  })
})

describe('ROLE_LABELS', () => {
  it('has human-readable labels for all roles', () => {
    expect(ROLE_LABELS.owner).toBe('Owner')
    expect(ROLE_LABELS.admin).toBe('Admin')
    expect(ROLE_LABELS.manager).toBe('Manager')
    expect(ROLE_LABELS.member).toBe('Member')
    expect(ROLE_LABELS.viewer).toBe('Viewer')
  })
})
