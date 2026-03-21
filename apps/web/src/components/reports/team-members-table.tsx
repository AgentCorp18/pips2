'use client'

import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { SortableHeader } from '@/components/ui/sortable-header'
import { useSortable } from '@/hooks/use-sortable'
import { FormattedDate } from '@/components/ui/formatted-date'
import type { TeamMemberRow } from '@/app/(app)/reports/actions'

type Props = {
  rows: TeamMemberRow[]
}

/** Color-coded badge showing methodology engagement level based on forms submitted. */
const EngagementBadge = ({ formsSubmitted }: { formsSubmitted: number }) => {
  if (formsSubmitted >= 10) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        High
      </span>
    )
  }
  if (formsSubmitted >= 5) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        Medium
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
      Low
    </span>
  )
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
    <Table className="min-w-[700px]">
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
            label="Forms"
            sortKey="formsSubmitted"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Steps"
            sortKey="stepsUsed"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Engagement"
            sortKey="formsSubmitted"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Last Form"
            sortKey="lastFormDate"
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
            <TableCell>{row.formsSubmitted}</TableCell>
            <TableCell>
              <span title={`${row.stepsUsed} of 6 PIPS steps`}>{row.stepsUsed}/6</span>
            </TableCell>
            <TableCell>
              <EngagementBadge formsSubmitted={row.formsSubmitted} />
            </TableCell>
            <TableCell>
              {row.lastFormDate ? (
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <FormattedDate date={row.lastFormDate} />
                </span>
              ) : (
                <span style={{ color: 'var(--color-text-tertiary)' }}>--</span>
              )}
            </TableCell>
            <TableCell>
              {row.lastActive ? (
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <FormattedDate date={row.lastActive} />
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
