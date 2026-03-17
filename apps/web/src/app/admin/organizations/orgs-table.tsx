'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react'
import type { PlatformOrg } from '../actions'
import { addUserToOrg } from '../actions'
import type { OrgRole } from '@pips/shared'

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

type OrgRowProps = {
  org: PlatformOrg
  onAddMember: (orgId: string, userEmail: string, role: string) => Promise<void>
  isPending: boolean
}

const OrgRow = ({ org, onAddMember, isPending }: OrgRowProps) => {
  const [expanded, setExpanded] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<OrgRoleOption>('member')

  const handleAddMember = async () => {
    if (!newUserEmail.trim()) return
    await onAddMember(org.id, newUserEmail.trim(), newUserRole)
    setNewUserEmail('')
    setNewUserRole('member')
    setShowAddMember(false)
  }

  const planBadgeStyle =
    org.plan === 'enterprise'
      ? { bg: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED' }
      : org.plan === 'pro'
        ? { bg: 'rgba(37, 99, 235, 0.12)', color: '#2563EB' }
        : { bg: 'rgba(110, 105, 137, 0.12)', color: '#6E6989' }

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
            {org.name}
          </div>
          {org.owner_name && (
            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Owner: {org.owner_name}
            </div>
          )}
        </td>

        {/* Slug */}
        <td className="px-4 py-3">
          <code
            className="rounded px-1.5 py-0.5 text-xs"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {org.slug}
          </code>
        </td>

        {/* Plan */}
        <td className="px-4 py-3">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize"
            style={{ backgroundColor: planBadgeStyle.bg, color: planBadgeStyle.color }}
          >
            {org.plan}
          </span>
        </td>

        {/* Members */}
        <td className="px-4 py-3">
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {org.member_count}
          </span>
        </td>

        {/* Projects */}
        <td className="px-4 py-3">
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {org.project_count}
          </span>
        </td>

        {/* Created */}
        <td className="px-4 py-3">
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {new Date(org.created_at).toLocaleDateString()}
          </span>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
          <td colSpan={7} className="px-8 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Members
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddMember((prev) => !prev)}
                  className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-2 py-1 text-xs transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {showAddMember ? <X size={12} /> : <Plus size={12} />}
                  {showAddMember ? 'Cancel' : 'Add Member'}
                </button>
              </div>

              {/* Add member form */}
              {showAddMember && (
                <div className="flex flex-wrap items-end gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-xs font-medium"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      User Email
                    </label>
                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="user@example.com"
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
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as OrgRoleOption)}
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
                    onClick={handleAddMember}
                    disabled={!newUserEmail.trim() || isPending}
                    className="h-8 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              )}

              <p className="text-xs italic" style={{ color: 'var(--color-text-tertiary)' }}>
                {org.member_count} member{org.member_count !== 1 ? 's' : ''} — use the Users page to
                view and manage individual memberships.
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

type OrgsTableProps = {
  initialOrgs: PlatformOrg[]
}

export const OrgsTable = ({ initialOrgs }: OrgsTableProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const refresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const handleAddMember = async (orgId: string, userEmail: string, role: string) => {
    // addUserToOrg expects userId, but the form captures email.
    // The backend action should handle email -> userId lookup.
    // We pass email as userId here — backend will resolve it.
    const result = await addUserToOrg(userEmail, orgId, role as OrgRole)
    if (result.error) {
      alert(`Error: ${result.error}`)
    } else {
      refresh()
    }
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm" data-testid="admin-orgs-table">
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
                Slug
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Plan
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Members
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Projects
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Created
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--color-surface)' }}>
            {initialOrgs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  No organizations found.
                </td>
              </tr>
            ) : (
              initialOrgs.map((org) => (
                <OrgRow
                  key={org.id}
                  org={org}
                  onAddMember={handleAddMember}
                  isPending={isPending}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { RoleBadge }
