'use client'

import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { SortableHeader } from '@/components/ui/sortable-header'
import { useSortable } from '@/hooks/use-sortable'
import type { TeamMemberRow } from '@/app/(app)/reports/actions'

type Props = {
  rows: TeamMemberRow[]
}

export const TeamMembersTable = ({ rows }: Props) => {
  const { sortedData, sortKey, sortDirection, handleSort } = useSortable(rows)

  if (rows.length === 0) {
    return (
      <div
        className="flex h-32 items-center justify-center text-sm"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        No team members yet. Invite members to see activity data.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader
            label="Name"
            sortKey="name"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Role"
            sortKey="role"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Assigned"
            sortKey="ticketsAssigned"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Completed"
            sortKey="ticketsCompleted"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Last Active"
            sortKey="lastActive"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>
              <Badge variant="secondary">{row.role}</Badge>
            </TableCell>
            <TableCell>{row.ticketsAssigned}</TableCell>
            <TableCell>{row.ticketsCompleted}</TableCell>
            <TableCell>
              {row.lastActive ? (
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date(row.lastActive).toLocaleDateString()}
                </span>
              ) : (
                <span style={{ color: 'var(--color-text-tertiary)' }}>--</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
