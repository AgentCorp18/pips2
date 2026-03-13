'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { SortableHeader } from '@/components/ui/sortable-header'
import { useSortable } from '@/hooks/use-sortable'
import type { ProjectTableRow } from '@/app/(app)/reports/actions'

type Props = {
  rows: ProjectTableRow[]
}

export const ProjectsTable = ({ rows }: Props) => {
  const { sortedData, sortKey, sortDirection, handleSort } = useSortable(rows)

  if (rows.length === 0) {
    return (
      <div
        className="flex h-32 items-center justify-center text-sm"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        No projects yet. Create a project to see it here.
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
            label="Current Step"
            sortKey="currentStep"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Progress"
            sortKey="progressPercent"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Open Tickets"
            sortKey="openTickets"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Overdue"
            sortKey="overdueCount"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Last Activity"
            sortKey="lastActivity"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">
              <Link
                href={`/projects/${row.id}`}
                className="hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                {row.name}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{row.currentStep}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="h-2 w-16 overflow-hidden rounded-full bg-[var(--color-surface-secondary)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                    style={{ width: `${row.progressPercent}%` }}
                  />
                </div>
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {row.progressPercent}%
                </span>
              </div>
            </TableCell>
            <TableCell>{row.openTickets}</TableCell>
            <TableCell>
              {row.overdueCount > 0 ? (
                <span style={{ color: '#EF4444' }}>{row.overdueCount}</span>
              ) : (
                <span style={{ color: 'var(--color-text-tertiary)' }}>0</span>
              )}
            </TableCell>
            <TableCell>
              {row.lastActivity ? (
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date(row.lastActivity).toLocaleDateString()}
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
