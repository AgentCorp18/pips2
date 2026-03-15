'use client'

import { Fragment, useState, useTransition } from 'react'
import { Check, X, RotateCcw, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PERMISSIONS, ROLES_ORDERED, ROLE_LABELS, type Permission } from '@pips/shared'
import type { OrgRole } from '@pips/shared'
import {
  togglePermissionOverride,
  resetPermissionOverrides,
  type PermissionOverride,
} from './actions'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

/* ============================================================
   Permission category grouping
   ============================================================ */

type PermissionCategory = {
  label: string
  permissions: { key: Permission; label: string }[]
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    label: 'Organization',
    permissions: [
      { key: 'org.delete', label: 'Delete organization' },
      { key: 'org.billing', label: 'Manage billing' },
      { key: 'org.members.manage', label: 'Manage members' },
      { key: 'org.teams.manage', label: 'Manage teams' },
      { key: 'org.integrations.manage', label: 'Manage integrations' },
    ],
  },
  {
    label: 'Projects',
    permissions: [
      { key: 'project.create', label: 'Create projects' },
      { key: 'project.update', label: 'Update projects' },
    ],
  },
  {
    label: 'Tickets',
    permissions: [
      { key: 'ticket.create', label: 'Create tickets' },
      { key: 'ticket.update', label: 'Update tickets' },
      { key: 'ticket.delete', label: 'Delete tickets' },
      { key: 'ticket.assign', label: 'Assign tickets' },
      { key: 'ticket.comment', label: 'Comment on tickets' },
    ],
  },
  {
    label: 'PIPS Steps',
    permissions: [
      { key: 'step.complete', label: 'Complete steps' },
      { key: 'step.override', label: 'Override steps' },
    ],
  },
  {
    label: 'Initiatives',
    permissions: [
      { key: 'initiative.create', label: 'Create initiatives' },
      { key: 'initiative.update', label: 'Update initiatives' },
      { key: 'initiative.delete', label: 'Delete initiatives' },
    ],
  },
  {
    label: 'Collaboration',
    permissions: [
      { key: 'workshop.manage', label: 'Manage workshops' },
      { key: 'chat.send', label: 'Send chat messages' },
      { key: 'chat.manage', label: 'Manage chat channels' },
    ],
  },
  {
    label: 'General',
    permissions: [
      { key: 'data.view', label: 'View data' },
      { key: 'profile.edit', label: 'Edit own profile' },
    ],
  },
]

/* ============================================================
   Types
   ============================================================ */

type PermissionsMatrixProps = {
  orgId: string
  overrides: PermissionOverride[]
  isOwner: boolean
}

/* ============================================================
   Component
   ============================================================ */

export const PermissionsMatrix = ({ orgId, overrides, isOwner }: PermissionsMatrixProps) => {
  const [isPending, startTransition] = useTransition()
  const [localOverrides, setLocalOverrides] = useState<PermissionOverride[]>(overrides)

  const getEffectivePermission = (role: OrgRole, permission: Permission): boolean => {
    // Owner always has everything
    if (role === 'owner') return true

    // Check for override
    const override = localOverrides.find((o) => o.role === role && o.permission === permission)
    if (override !== undefined) return override.allowed

    // Fall back to default
    return (PERMISSIONS[permission] as readonly string[]).includes(role)
  }

  const isOverridden = (role: OrgRole, permission: Permission): boolean => {
    return localOverrides.some((o) => o.role === role && o.permission === permission)
  }

  const handleToggle = (role: OrgRole, permission: Permission) => {
    if (!isOwner || role === 'owner') return

    const currentValue = getEffectivePermission(role, permission)
    const newValue = !currentValue

    // Optimistic update
    setLocalOverrides((prev) => {
      const defaultRoles = PERMISSIONS[permission] as readonly string[]
      const isDefault = defaultRoles.includes(role)

      if (newValue === isDefault) {
        // Remove override
        return prev.filter((o) => !(o.role === role && o.permission === permission))
      }

      // Add/update override
      const existing = prev.findIndex((o) => o.role === role && o.permission === permission)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { role, permission, allowed: newValue }
        return updated
      }
      return [...prev, { role, permission, allowed: newValue }]
    })

    startTransition(async () => {
      const result = await togglePermissionOverride(orgId, role, permission, newValue)
      if (!result.success) {
        // Revert optimistic update
        setLocalOverrides(overrides)
      }
    })
  }

  const handleReset = () => {
    if (!isOwner) return
    setLocalOverrides([])
    startTransition(async () => {
      const result = await resetPermissionOverrides(orgId)
      if (!result.success) {
        setLocalOverrides(overrides)
      }
    })
  }

  const hasOverrides = localOverrides.length > 0

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Permission Matrix
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              {isOwner
                ? 'Click cells to customize which roles have which permissions.'
                : 'View which permissions each role has.'}
            </p>
          </div>
          {isOwner && hasOverrides && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isPending}
              data-testid="reset-permissions-btn"
            >
              <RotateCcw size={14} className="mr-1.5" />
              Reset to Defaults
            </Button>
          )}
        </div>

        {/* Legend */}
        <div
          className="flex flex-wrap items-center gap-4 text-xs"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[var(--color-success-subtle)]">
              <Check size={12} className="text-[var(--color-success)]" />
            </span>
            Allowed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-gray-100">
              <X size={12} className="text-gray-400" />
            </span>
            Denied
          </span>
          {hasOverrides && (
            <span className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="h-5 border-amber-300 bg-amber-50 px-1.5 text-[10px] text-amber-600"
              >
                Custom
              </Badge>
              Modified from default
            </span>
          )}
        </div>

        {/* Matrix table */}
        <div
          className="overflow-x-auto rounded-lg border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <table className="w-full text-sm" data-testid="permissions-matrix-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
                <th
                  className="sticky left-0 px-4 py-3 text-left text-xs font-medium"
                  style={{
                    color: 'var(--color-text-tertiary)',
                    backgroundColor: 'var(--color-surface-secondary)',
                  }}
                >
                  Permission
                </th>
                {ROLES_ORDERED.map((role) => (
                  <th
                    key={role}
                    className="px-3 py-3 text-center text-xs font-medium"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {ROLE_LABELS[role]}
                      {role === 'owner' && <Lock size={10} className="text-amber-500" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_CATEGORIES.map((category) => (
                <Fragment key={category.label}>
                  {/* Category header row */}
                  <tr>
                    <td
                      colSpan={ROLES_ORDERED.length + 1}
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                      style={{
                        color: 'var(--color-text-tertiary)',
                        backgroundColor: 'var(--color-surface-secondary)',
                      }}
                    >
                      {category.label}
                    </td>
                  </tr>
                  {/* Permission rows */}
                  {category.permissions.map((perm) => (
                    <tr
                      key={perm.key}
                      className="border-t transition-colors hover:bg-[var(--color-surface-secondary)]/50"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <td
                        className="sticky left-0 px-4 py-2.5 text-sm"
                        style={{
                          color: 'var(--color-text-primary)',
                          backgroundColor: 'var(--color-surface-primary)',
                        }}
                      >
                        {perm.label}
                      </td>
                      {ROLES_ORDERED.map((role) => {
                        const allowed = getEffectivePermission(role, perm.key)
                        const overridden = isOverridden(role, perm.key)
                        const isLocked = role === 'owner' || !isOwner

                        return (
                          <td key={role} className="px-3 py-2.5 text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => handleToggle(role, perm.key)}
                                  disabled={isLocked || isPending}
                                  className={`inline-flex h-7 w-7 items-center justify-center rounded transition-colors ${
                                    isLocked
                                      ? 'cursor-default'
                                      : 'cursor-pointer hover:ring-2 hover:ring-[var(--color-primary-light)]'
                                  } ${overridden ? 'ring-1 ring-amber-300' : ''}`}
                                  style={{
                                    backgroundColor: allowed
                                      ? 'var(--color-success-subtle)'
                                      : 'var(--color-surface-secondary)',
                                  }}
                                  data-testid={`perm-${perm.key}-${role}`}
                                >
                                  {allowed ? (
                                    <Check size={14} className="text-[var(--color-success)]" />
                                  ) : (
                                    <X size={14} className="text-gray-400" />
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {ROLE_LABELS[role]}: {perm.label} —{' '}
                                  {allowed ? 'Allowed' : 'Denied'}
                                  {overridden ? ' (customized)' : ''}
                                  {isLocked ? '' : ' — click to toggle'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Role descriptions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Role Descriptions
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES_ORDERED.map((role) => (
              <div
                key={role}
                className="rounded-lg border p-3"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {ROLE_LABELS[role]}
                  </Badge>
                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    Level {{ owner: 5, admin: 4, manager: 3, member: 2, viewer: 1 }[role]}
                  </span>
                </div>
                <p
                  className="mt-1.5 text-xs leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {ROLE_DESCRIPTIONS[role]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

const ROLE_DESCRIPTIONS: Record<OrgRole, string> = {
  owner:
    'Full control over the organization. Can manage billing, delete the org, and change any settings. Cannot be removed or demoted.',
  admin:
    'Administrative access. Can manage members, invitations, teams, integrations, and chat channels. Cannot delete the organization.',
  manager:
    'Team and project leadership. Can manage teams, create and update projects, complete PIPS steps, and manage workshops.',
  member:
    'Core contributor. Can create and update tickets, comment, assign work, participate in chat, and view data.',
  viewer:
    'Read-only access. Can view data and edit their own profile. Cannot create or modify tickets, projects, or other resources.',
}
