'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { BulkActionsBar } from './bulk-actions-bar'
import { TicketTableRow } from './ticket-table-row'
import type { TicketStatus, TicketPriority, TicketType } from '@/types/tickets'

/* ---- Sort indicator & sortable header (defined outside component) ---- */

const SortIcon = ({
  column,
  sortBy,
  sortOrder,
}: {
  column: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}) => {
  if (sortBy !== column) return null
  return sortOrder === 'asc' ? (
    <ArrowUp size={14} className="ml-1 inline" />
  ) : (
    <ArrowDown size={14} className="ml-1 inline" />
  )
}

const SortableHead = ({
  column,
  sortBy,
  sortOrder,
  onSort,
  children,
}: {
  column: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (column: string) => void
  children: React.ReactNode
}) => (
  <TableHead className="cursor-pointer select-none" onClick={() => onSort(column)}>
    {children}
    <SortIcon column={column} sortBy={sortBy} sortOrder={sortOrder} />
  </TableHead>
)

export type TicketRow = {
  id: string
  sequenceId: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  type: TicketType
  assigneeName: string | null
  assigneeAvatar: string | null
  dueDate: string | null
  createdAt: string
}

type TicketListTableProps = {
  tickets: TicketRow[]
  total: number
  page: number
  perPage: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export const TicketListTable = ({
  tickets,
  total,
  page,
  perPage,
  sortBy,
  sortOrder,
}: TicketListTableProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const allSelected = tickets.length > 0 && selectedIds.size === tickets.length
  const someSelected = selectedIds.size > 0 && !allSelected
  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)
  const totalPages = Math.ceil(total / perPage)

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, val] of Object.entries(updates)) {
        if (val) params.set(key, val)
        else params.delete(key)
      }
      router.push(`/tickets?${params.toString()}`)
    },
    [router, searchParams],
  )

  const handleSort = (column: string) => {
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc'
    updateParams({ sort_by: column, sort_order: newOrder })
  }

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) })
  }

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(tickets.map((t) => t.id)))
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  return (
    <div>
      {selectedIds.size > 0 && (
        <BulkActionsBar selectedIds={Array.from(selectedIds)} onClear={clearSelection} />
      )}

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected
                  }}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-gray-300"
                  aria-label="Select all tickets"
                />
              </TableHead>
              <SortableHead
                column="sequence_number"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              >
                ID
              </SortableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <SortableHead
                column="priority"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              >
                Priority
              </SortableHead>
              <TableHead>Type</TableHead>
              <TableHead>Assignee</TableHead>
              <SortableHead
                column="due_date"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              >
                Due Date
              </SortableHead>
              <SortableHead
                column="created_at"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              >
                Created
              </SortableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TicketTableRow
                key={ticket.id}
                ticket={ticket}
                isSelected={selectedIds.has(ticket.id)}
                onToggle={toggleOne}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      {total > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {from}-{to} of {total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
