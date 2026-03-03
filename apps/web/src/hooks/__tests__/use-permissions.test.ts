import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermissions } from '../use-permissions'

/* ============================================================
   Mocks
   ============================================================ */

vi.mock('@pips/shared', () => {
  const PERMISSIONS: Record<string, string[]> = {
    'org.delete': ['owner'],
    'org.billing': ['owner'],
    'org.members.manage': ['owner', 'admin'],
    'org.teams.manage': ['owner', 'admin', 'manager'],
    'org.integrations.manage': ['owner', 'admin'],
    'project.create': ['owner', 'admin', 'manager', 'member'],
    'project.update': ['owner', 'admin', 'manager'],
    'ticket.create': ['owner', 'admin', 'manager', 'member'],
    'ticket.assign': ['owner', 'admin', 'manager', 'member'],
    'ticket.comment': ['owner', 'admin', 'manager', 'member'],
    'step.complete': ['owner', 'admin', 'manager'],
    'step.override': ['owner', 'admin', 'manager'],
    'data.view': ['owner', 'admin', 'manager', 'member', 'viewer'],
    'profile.edit': ['owner', 'admin', 'manager', 'member', 'viewer'],
  }

  return {
    hasPermission: (role: string, permission: string): boolean =>
      (PERMISSIONS[permission] ?? []).includes(role),
  }
})

/* ============================================================
   Tests
   ============================================================ */

describe('usePermissions', () => {
  it('returns the given role', () => {
    const { result } = renderHook(() => usePermissions('admin'))
    expect(result.current.role).toBe('admin')
  })

  it('returns null role when null is passed', () => {
    const { result } = renderHook(() => usePermissions(null))
    expect(result.current.role).toBeNull()
  })

  it('can() returns false for null role', () => {
    const { result } = renderHook(() => usePermissions(null))
    expect(result.current.can('data.view')).toBe(false)
    expect(result.current.can('project.create')).toBe(false)
  })

  it('owner can do everything', () => {
    const { result } = renderHook(() => usePermissions('owner'))
    expect(result.current.can('org.delete')).toBe(true)
    expect(result.current.can('org.billing')).toBe(true)
    expect(result.current.can('project.create')).toBe(true)
    expect(result.current.can('data.view')).toBe(true)
  })

  it('admin can manage members but not delete org', () => {
    const { result } = renderHook(() => usePermissions('admin'))
    expect(result.current.can('org.members.manage')).toBe(true)
    expect(result.current.can('org.delete')).toBe(false)
    expect(result.current.can('org.billing')).toBe(false)
  })

  it('manager can complete and override steps', () => {
    const { result } = renderHook(() => usePermissions('manager'))
    expect(result.current.can('step.complete')).toBe(true)
    expect(result.current.can('step.override')).toBe(true)
  })

  it('member can create projects and tickets but not override steps', () => {
    const { result } = renderHook(() => usePermissions('member'))
    expect(result.current.can('project.create')).toBe(true)
    expect(result.current.can('ticket.create')).toBe(true)
    expect(result.current.can('step.override')).toBe(false)
    expect(result.current.can('step.complete')).toBe(false)
  })

  it('viewer can only view data and edit profile', () => {
    const { result } = renderHook(() => usePermissions('viewer'))
    expect(result.current.can('data.view')).toBe(true)
    expect(result.current.can('profile.edit')).toBe(true)
    expect(result.current.can('project.create')).toBe(false)
    expect(result.current.can('ticket.create')).toBe(false)
    expect(result.current.can('org.members.manage')).toBe(false)
  })

  it('member can comment on tickets', () => {
    const { result } = renderHook(() => usePermissions('member'))
    expect(result.current.can('ticket.comment')).toBe(true)
  })

  it('viewer cannot comment on tickets', () => {
    const { result } = renderHook(() => usePermissions('viewer'))
    expect(result.current.can('ticket.comment')).toBe(false)
  })

  it('admin can manage integrations', () => {
    const { result } = renderHook(() => usePermissions('admin'))
    expect(result.current.can('org.integrations.manage')).toBe(true)
  })

  it('manager cannot manage integrations', () => {
    const { result } = renderHook(() => usePermissions('manager'))
    expect(result.current.can('org.integrations.manage')).toBe(false)
  })
})
