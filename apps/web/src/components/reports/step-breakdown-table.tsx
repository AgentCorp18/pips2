'use client'

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { SortableHeader } from '@/components/ui/sortable-header'
import { useSortable } from '@/hooks/use-sortable'
import type { StepBreakdownRow } from '@/app/(app)/reports/actions'

type Props = {
  rows: StepBreakdownRow[]
}

export const StepBreakdownTable = ({ rows }: Props) => {
  const { sortedData, sortKey, sortDirection, handleSort } = useSortable(rows)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader
            label="Step"
            sortKey="stepName"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Avg Duration"
            sortKey="avgDuration"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Forms Completed"
            sortKey="formsCompleted"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
          <SortableHeader
            label="Completion Rate"
            sortKey="completionRate"
            currentSort={sortKey}
            currentDirection={sortDirection}
            onSort={handleSort}
          />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((row) => (
          <TableRow key={row.stepName}>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: row.color }} />
                <span className="font-medium">{row.stepName}</span>
              </div>
            </TableCell>
            <TableCell>
              {row.avgDuration > 0 ? (
                <span>{row.avgDuration} days</span>
              ) : (
                <span style={{ color: 'var(--color-text-tertiary)' }}>--</span>
              )}
            </TableCell>
            <TableCell>{row.formsCompleted}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="h-2 w-12 overflow-hidden rounded-full bg-[var(--color-surface-secondary)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${row.completionRate}%`,
                      backgroundColor: row.color,
                    }}
                  />
                </div>
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {row.completionRate}%
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
