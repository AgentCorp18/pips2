'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'
import type { AdminLogEntry } from '../actions'
import { getAdminAuditLog } from '../actions'
import { FormattedDate } from '@/components/ui/formatted-date'

const ACTION_OPTIONS = [
  '',
  'toggle_system_admin',
  'deactivate_user',
  'reactivate_user',
  'add_user_to_org',
  'remove_user_from_org',
  'change_user_org_role',
]

type ExpandableDetailsProps = {
  details: Record<string, unknown>
}

const ExpandableDetails = ({ details }: ExpandableDetailsProps) => {
  const [open, setOpen] = useState(false)

  if (Object.keys(details).length === 0) {
    return (
      <span className="text-xs italic" style={{ color: 'var(--color-text-tertiary)' }}>
        —
      </span>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors hover:bg-[var(--color-surface-secondary)]"
        style={{ color: 'var(--color-primary)' }}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRightIcon size={12} />}
        {open ? 'Hide' : 'View'}
      </button>
      {open && (
        <pre
          className="mt-1 max-w-xs overflow-auto rounded-[var(--radius-md)] border border-[var(--color-border)] p-2 text-xs"
          style={{
            backgroundColor: 'var(--color-surface-secondary)',
            color: 'var(--color-text-secondary)',
            maxHeight: '160px',
          }}
        >
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  )
}

type AuditLogTableProps = {
  initialEntries: AdminLogEntry[]
  initialTotal: number
  initialPage: number
}

export const AuditLogTable = ({
  initialEntries,
  initialTotal,
  initialPage,
}: AuditLogTableProps) => {
  const [isPending, startTransition] = useTransition()
  const [entries, setEntries] = useState(initialEntries)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [actionFilter, setActionFilter] = useState('')
  const [userIdFilter, setUserIdFilter] = useState('')

  const perPage = 25
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const fetchPage = (nextPage: number, action?: string, userId?: string) => {
    startTransition(async () => {
      try {
        const filters: { action?: string; userId?: string } = {}
        if (action) filters.action = action
        if (userId) filters.userId = userId
        const result = await getAdminAuditLog(nextPage, filters)
        setEntries(result.entries)
        setTotal(result.total)
        setPage(nextPage)
      } catch (err) {
        console.error('[AuditLogTable] fetch error:', err)
      }
    })
  }

  const handleActionFilter = (value: string) => {
    setActionFilter(value)
    fetchPage(1, value, userIdFilter)
  }

  const handleUserIdFilter = (value: string) => {
    setUserIdFilter(value)
  }

  const handleUserIdSearch = () => {
    fetchPage(1, actionFilter, userIdFilter)
  }

  const handlePrev = () => {
    if (page > 1) fetchPage(page - 1, actionFilter, userIdFilter)
  }

  const handleNext = () => {
    if (page < totalPages) fetchPage(page + 1, actionFilter, userIdFilter)
  }

  return (
    <div>
      {/* Filter row */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Action Type
          </label>
          <select
            value={actionFilter}
            onChange={(e) => handleActionFilter(e.target.value)}
            className="h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            style={{ color: 'var(--color-text-primary)', minWidth: '180px' }}
          >
            <option value="">All actions</option>
            {ACTION_OPTIONS.filter(Boolean).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            User ID
          </label>
          <div className="flex gap-1">
            <input
              type="text"
              value={userIdFilter}
              onChange={(e) => handleUserIdFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUserIdSearch()
              }}
              placeholder="Filter by user ID"
              className="h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              style={{ color: 'var(--color-text-primary)', minWidth: '200px' }}
            />
            <button
              type="button"
              onClick={handleUserIdSearch}
              disabled={isPending}
              className="h-9 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </div>

        {isPending && (
          <span className="self-end text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Loading...
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm" data-testid="admin-audit-table">
            <thead>
              <tr
                className="border-b border-[var(--color-border)]"
                style={{ backgroundColor: 'var(--color-surface-secondary)' }}
              >
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Timestamp
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Admin
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Action
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Target User
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Target Org
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Details
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--color-surface)' }}>
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    No audit log entries found.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-secondary)]"
                    style={{ opacity: isPending ? 0.6 : 1 }}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="text-xs tabular-nums"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        <FormattedDate date={entry.created_at} />
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {entry.admin_email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code
                        className="rounded px-1.5 py-0.5 text-xs"
                        style={{
                          backgroundColor: 'rgba(79, 70, 229, 0.08)',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {entry.action}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      {entry.target_user_email ? (
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {entry.target_user_email}
                        </span>
                      ) : (
                        <span
                          className="text-xs italic"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {entry.target_org_name ? (
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {entry.target_org_name}
                        </span>
                      ) : (
                        <span
                          className="text-xs italic"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ExpandableDetails details={entry.details} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3"
          style={{ backgroundColor: 'var(--color-surface-secondary)' }}
        >
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Page {page} of {totalPages} ({total.toLocaleString()} entries)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={page <= 1 || isPending}
              className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-xs transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-40"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <ChevronLeft size={14} />
              Prev
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={page >= totalPages || isPending}
              className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1.5 text-xs transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-40"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Next
              <ChevronRightIcon size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
