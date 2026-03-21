'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Shield, Ban, CheckCircle, Search, Plus, X } from 'lucide-react'
import type { PlatformUser } from '../actions'
import {
  toggleSystemAdmin,
  deactivateUser,
  reactivateUser,
  addUserToOrg,
  removeUserFromOrg,
  changeUserOrgRole,
  listAllUsers,
} from '../actions'
import type { OrgRole } from '@pips/shared'
import { FormattedDate } from '@/components/ui/formatted-date'

const ORG_ROLES = ['owner', 'admin', 'manager', 'member', 'viewer'] as const
type OrgRoleOption = (typeof ORG_ROLES)[number]

const ROLE_BADGE_STYLES: Record<OrgRoleOption, { bg: string; color: string }> = {
  owner: { bg: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED' },
  admin: { bg: 'rgba(37, 99, 235, 0.12)', color: '#2563EB' },
  manager: { bg: 'rgba(5, 150, 105, 0.12)', color: '#059669' },
  member: { bg: 'rgba(110, 105, 137, 0.12)', color: '#6E6989' },
  viewer: { bg: 'rgba(202, 138, 4, 0.12)', color: '#CA8A04' },
}

const RoleBadge = ({ role }: { role: string }) => {
  const style = ROLE_BADGE_STYLES[role as OrgRoleOption] ?? {
    bg: 'rgba(110, 105, 137, 0.12)',
    color: '#6E6989',
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {role}
    </span>
  )
}

type UserRowProps = {
  user: PlatformUser
  onToggleAdmin: (userId: string) => Promise<void>
  onDeactivate: (userId: string) => Promise<void>
  onReactivate: (userId: string) => Promise<void>
  onAddToOrg: (userId: string, orgId: string, role: string) => Promise<void>
  onRemoveFromOrg: (userId: string, orgId: string) => Promise<void>
  onChangeRole: (userId: string, orgId: string, newRole: string) => Promise<void>
  isPending: boolean
}

const UserRow = ({
  user,
  onToggleAdmin,
  onDeactivate,
  onReactivate,
  onAddToOrg,
  onRemoveFromOrg,
  onChangeRole,
  isPending,
}: UserRowProps) => {
  const [expanded, setExpanded] = useState(false)
  const [showAddOrg, setShowAddOrg] = useState(false)
  const [addOrgId, setAddOrgId] = useState('')
  const [addOrgRole, setAddOrgRole] = useState<OrgRoleOption>('member')

  const isDeactivated = user.deactivated_at !== null

  const handleToggleAdmin = async () => {
    const confirmed = window.confirm(
      user.is_system_admin
        ? `Remove system admin from ${user.email}?`
        : `Grant system admin to ${user.email}? This gives full platform access.`,
    )
    if (!confirmed) return
    await onToggleAdmin(user.id)
  }

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      `Deactivate ${user.email}? They will lose access to the platform.`,
    )
    if (!confirmed) return
    await onDeactivate(user.id)
  }

  const handleReactivate = async () => {
    const confirmed = window.confirm(`Reactivate ${user.email}?`)
    if (!confirmed) return
    await onReactivate(user.id)
  }

  const handleAddToOrg = async () => {
    if (!addOrgId.trim()) return
    await onAddToOrg(user.id, addOrgId.trim(), addOrgRole)
    setAddOrgId('')
    setAddOrgRole('member')
    setShowAddOrg(false)
  }

  return (
    <>
      <tr
        className="border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-secondary)]"
        style={{ opacity: isPending ? 0.6 : 1 }}
      >
        {/* Expand */}
        <td className="w-10 px-3 py-3">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="rounded p-0.5 opacity-60 hover:opacity-100"
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </td>

        {/* Name */}
        <td className="px-4 py-3">
          <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {user.full_name ?? <span className="italic opacity-50">No name</span>}
          </div>
        </td>

        {/* Email */}
        <td className="px-4 py-3">
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {user.email}
          </div>
        </td>

        {/* System Admin */}
        <td className="px-4 py-3">
          {user.is_system_admin && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: 'rgba(202, 138, 4, 0.12)', color: '#CA8A04' }}
            >
              <Shield size={10} />
              Admin
            </span>
          )}
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          {isDeactivated ? (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}
            >
              Deactivated
            </span>
          ) : (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: 'rgba(5, 150, 105, 0.12)', color: '#059669' }}
            >
              Active
            </span>
          )}
        </td>

        {/* Orgs */}
        <td className="px-4 py-3">
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {user.orgs.length}
          </span>
        </td>

        {/* Joined */}
        <td className="px-4 py-3">
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            <FormattedDate date={user.created_at} showTime={false} />
          </span>
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAdmin}
              disabled={isPending}
              data-testid="admin-toggle-admin-btn"
              className="rounded p-1.5 transition-colors hover:bg-[var(--color-surface-secondary)]"
              aria-label={user.is_system_admin ? 'Remove system admin' : 'Grant system admin'}
              title={user.is_system_admin ? 'Remove system admin' : 'Grant system admin'}
              style={{ color: user.is_system_admin ? '#CA8A04' : 'var(--color-text-tertiary)' }}
            >
              <Shield size={16} />
            </button>

            {isDeactivated ? (
              <button
                type="button"
                onClick={handleReactivate}
                disabled={isPending}
                data-testid="admin-reactivate-btn"
                className="rounded p-1.5 transition-colors hover:bg-[var(--color-surface-secondary)]"
                aria-label="Reactivate user"
                title="Reactivate user"
                style={{ color: '#059669' }}
              >
                <CheckCircle size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isPending}
                data-testid="admin-deactivate-btn"
                className="rounded p-1.5 transition-colors hover:bg-[var(--color-surface-secondary)]"
                aria-label="Deactivate user"
                title="Deactivate user"
                style={{ color: 'var(--color-error)' }}
              >
                <Ban size={16} />
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
          <td colSpan={8} className="px-8 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Organization Memberships
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddOrg((prev) => !prev)}
                  className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-2 py-1 text-xs transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {showAddOrg ? <X size={12} /> : <Plus size={12} />}
                  {showAddOrg ? 'Cancel' : 'Add to Org'}
                </button>
              </div>

              {/* Add to Org form */}
              {showAddOrg && (
                <div className="flex flex-wrap items-end gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-xs font-medium"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Org ID
                    </label>
                    <input
                      type="text"
                      value={addOrgId}
                      onChange={(e) => setAddOrgId(e.target.value)}
                      placeholder="Organization UUID"
                      className="h-8 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      style={{ color: 'var(--color-text-primary)', minWidth: '220px' }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-xs font-medium"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Role
                    </label>
                    <select
                      value={addOrgRole}
                      onChange={(e) => setAddOrgRole(e.target.value as OrgRoleOption)}
                      className="h-8 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {ORG_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToOrg}
                    disabled={!addOrgId.trim() || isPending}
                    className="h-8 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* Org list */}
              {user.orgs.length === 0 ? (
                <p className="text-xs italic" style={{ color: 'var(--color-text-tertiary)' }}>
                  Not a member of any organization
                </p>
              ) : (
                <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
                        <th
                          className="px-4 py-2 text-left text-xs font-medium"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          Organization
                        </th>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          Role
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.orgs.map((org) => (
                        <OrgMembershipRow
                          key={org.org_id}
                          userId={user.id}
                          org={org}
                          onChangeRole={onChangeRole}
                          onRemove={onRemoveFromOrg}
                          isPending={isPending}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

type OrgMembershipRowProps = {
  userId: string
  org: PlatformUser['orgs'][number]
  onChangeRole: (userId: string, orgId: string, newRole: string) => Promise<void>
  onRemove: (userId: string, orgId: string) => Promise<void>
  isPending: boolean
}

const OrgMembershipRow = ({
  userId,
  org,
  onChangeRole,
  onRemove,
  isPending,
}: OrgMembershipRowProps) => {
  const [role, setRole] = useState(org.role)

  const handleRoleChange = async (newRole: string) => {
    setRole(newRole)
    await onChangeRole(userId, org.org_id, newRole)
  }

  const handleRemove = async () => {
    const confirmed = window.confirm(`Remove from ${org.org_name}?`)
    if (!confirmed) return
    await onRemove(userId, org.org_id)
  }

  return (
    <tr className="border-b border-[var(--color-border)] last:border-0">
      <td className="px-4 py-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
        {org.org_name}
      </td>
      <td className="px-4 py-2">
        <select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value)}
          disabled={isPending}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {ORG_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2 text-right">
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="rounded p-1 text-xs transition-colors hover:bg-[var(--color-error-light)]"
          aria-label={`Remove from ${org.org_name}`}
          style={{ color: 'var(--color-error)' }}
        >
          <X size={14} />
        </button>
      </td>
    </tr>
  )
}

type UsersTableProps = {
  initialUsers: PlatformUser[]
}

export const UsersTable = ({ initialUsers }: UsersTableProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(
      (u) => u.email.toLowerCase().includes(q) || (u.full_name ?? '').toLowerCase().includes(q),
    )
  }, [users, search])

  const handleSearch = async (value: string) => {
    setSearch(value)
    if (value.trim().length > 2) {
      setSearching(true)
      try {
        const result = await listAllUsers(value.trim())
        setUsers(result)
      } finally {
        setSearching(false)
      }
    } else if (value.trim() === '') {
      setSearching(true)
      try {
        const result = await listAllUsers()
        setUsers(result)
      } finally {
        setSearching(false)
      }
    }
  }

  const refresh = () => {
    startTransition(() => {
      router.refresh()
    })
    // Also re-fetch users
    listAllUsers(search.trim() || undefined)
      .then(setUsers)
      .catch(console.error)
  }

  const handleToggleAdmin = async (userId: string) => {
    const result = await toggleSystemAdmin(userId)
    if (result.error) {
      alert(`Error: ${result.error}`)
    } else {
      refresh()
    }
  }

  const handleDeactivate = async (userId: string) => {
    const result = await deactivateUser(userId)
    if (result.error) {
      alert(`Error: ${result.error}`)
    } else {
      refresh()
    }
  }

  const handleReactivate = async (userId: string) => {
    const result = await reactivateUser(userId)
    if (result.error) {
      alert(`Error: ${result.error}`)
    } else {
      refresh()
    }
  }

  const handleAddToOrg = async (userId: string, orgId: string, role: string) => {
    const result = await addUserToOrg(userId, orgId, role as OrgRole)
    if (result.error) {
      alert(`Error: ${result.error}`)
    } else {
      refresh()
    }
  }

  const handleRemoveFromOrg = async (userId: string, orgId: string) => {
    const result = await removeUserFromOrg(userId, orgId)
    if (result.error) {
      alert(`Error: ${result.error}`)
    } else {
      refresh()
    }
  }

  const handleChangeRole = async (userId: string, orgId: string, newRole: string) => {
    const result = await changeUserOrgRole(userId, orgId, newRole as OrgRole)
    if (result.error) {
      alert(`Error: ${result.error}`)
    } else {
      refresh()
    }
  }

  return (
    <div>
      {/* Search */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-tertiary)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or email..."
            data-testid="admin-user-search"
            className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>
        {(searching || isPending) && (
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Loading...
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm" data-testid="admin-users-table">
            <thead>
              <tr
                className="border-b border-[var(--color-border)]"
                style={{ backgroundColor: 'var(--color-surface-secondary)' }}
              >
                <th className="w-10 px-3 py-3" />
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Name
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Email
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  System Admin
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Status
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Orgs
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Joined
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--color-surface)' }}>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onToggleAdmin={handleToggleAdmin}
                    onDeactivate={handleDeactivate}
                    onReactivate={handleReactivate}
                    onAddToOrg={handleAddToOrg}
                    onRemoveFromOrg={handleRemoveFromOrg}
                    onChangeRole={handleChangeRole}
                    isPending={isPending}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export { RoleBadge }
