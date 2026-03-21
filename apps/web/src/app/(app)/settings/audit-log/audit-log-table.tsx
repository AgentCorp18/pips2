'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SortableHeader } from '@/components/ui/sortable-header'
import { useSortable } from '@/hooks/use-sortable'
import type { AuditLogEntry } from './actions'

/* ---- Helpers ---- */

const ACTION_BADGE_VARIANT: Record<string, { className: string; label: string }> = {
  insert: { className: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Create' },
  update: { className: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Update' },
  delete: { className: 'bg-red-100 text-red-800 border-red-200', label: 'Delete' },
}

const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
  })
}

const formatEntityType = (entityType: string): string => {
  return entityType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const truncateId = (id: string | null): string => {
  if (!id) return '-'
  if (id.length <= 8) return id
  return `${id.slice(0, 8)}...`
}

const ActionBadge = ({ action }: { action: string }) => {
  const config = ACTION_BADGE_VARIANT[action] ?? {
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    label: action,
  }

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

const DetailsCell = ({ entry }: { entry: AuditLogEntry }) => {
  if (entry.action === 'delete' && entry.old_data) {
    const name =
      (entry.old_data.name as string) ??
      (entry.old_data.title as string) ??
      (entry.old_data.full_name as string)
    if (name) {
      return <span className="text-sm text-muted-foreground">Deleted: {name}</span>
    }
  }

  if (entry.action === 'update' && entry.old_data && entry.new_data) {
    const changedKeys = Object.keys(entry.new_data).filter(
      (key) =>
        key !== 'updated_at' &&
        JSON.stringify(entry.new_data?.[key]) !== JSON.stringify(entry.old_data?.[key]),
    )
    if (changedKeys.length > 0) {
      return (
        <span className="text-sm text-muted-foreground">
          Changed: {changedKeys.slice(0, 3).join(', ')}
          {changedKeys.length > 3 ? ` +${changedKeys.length - 3} more` : ''}
        </span>
      )
    }
  }

  if (entry.action === 'insert' && entry.new_data) {
    const name =
      (entry.new_data.name as string) ??
      (entry.new_data.title as string) ??
      (entry.new_data.full_name as string)
    if (name) {
      return <span className="text-sm text-muted-foreground">Created: {name}</span>
    }
  }

  return <span className="text-sm text-muted-foreground">-</span>
}

/* ---- Component ---- */

type AuditLogTableProps = {
  entries: AuditLogEntry[]
}

export const AuditLogTable = ({ entries }: AuditLogTableProps) => {
  const { sortedData, sortKey, sortDirection, handleSort } = useSortable(entries)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader
            label="Timestamp"
            sortKey="created_at"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="User"
            sortKey="user_display_name"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Action"
            sortKey="action"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Entity Type"
            sortKey="entity_type"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Entity ID"
            sortKey="entity_id"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>
              <span
                className="text-sm"
                title={new Date(entry.created_at).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              >
                {formatRelativeTime(entry.created_at)}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm">{entry.user_display_name ?? 'System'}</span>
            </TableCell>
            <TableCell>
              <ActionBadge action={entry.action} />
            </TableCell>
            <TableCell>
              <span className="text-sm">{formatEntityType(entry.entity_type)}</span>
            </TableCell>
            <TableCell>
              <code
                className="rounded px-1.5 py-0.5 text-xs"
                style={{
                  backgroundColor: 'var(--color-surface-secondary)',
                  fontFamily: 'var(--font-mono)',
                }}
                title={entry.entity_id ?? undefined}
              >
                {truncateId(entry.entity_id)}
              </code>
            </TableCell>
            <TableCell>
              <DetailsCell entry={entry} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
