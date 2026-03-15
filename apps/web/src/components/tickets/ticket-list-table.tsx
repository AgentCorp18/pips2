'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import { SortableHeader, type SortDirection } from '@/components/ui/sortable-header'
import { BulkActionsBar } from './bulk-actions-bar'
import { TicketTableRow } from './ticket-table-row'
import type { TicketStatus, TicketPriority, TicketType } from '@/types/tickets'

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
  updatedAt: string
  reporterName: string | null
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
  const [isFullScreen, setIsFullScreen] = useState(false)

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
      router.replace(`/tickets?${params.toString()}`)
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

  /* Map server-side sortBy/sortOrder to SortableHeader props */
  const currentDirection: SortDirection = sortOrder === 'asc' ? 'asc' : 'desc'

  return (
    <div
      className={
        isFullScreen
          ? 'fixed inset-0 z-50 flex flex-col overflow-auto bg-[var(--color-bg)] p-4'
          : ''
      }
      data-testid="ticket-list-table-container"
    >
      <div className="mb-2 flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsFullScreen(!isFullScreen)}
          aria-label={isFullScreen ? 'Exit full screen' : 'Full screen'}
          data-testid="table-fullscreen-toggle"
        >
          {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </Button>
      </div>

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
              <SortableHeader
                label="ID"
                sortKey="sequence_number"
                currentSort={sortBy}
                currentDirection={currentDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Title"
                sortKey="title"
                currentSort={sortBy}
                currentDirection={currentDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Status"
                sortKey="status"
                currentSort={sortBy}
                currentDirection={currentDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Priority"
                sortKey="priority"
                currentSort={sortBy}
                currentDirection={currentDirection}
                onSort={handleSort}
                className="hidden sm:table-cell"
              />
              <SortableHeader
                label="Type"
                sortKey="type"
                currentSort={sortBy}
                currentDirection={currentDirection}
                onSort={handleSort}
                className="hidden md:table-cell"
              />
              <SortableHeader
                label="Assignee"
                sortKey="assignee_name"
                currentSort={sortBy}
                currentDirection={currentDirection}
                onSort={handleSort}
                className="hidden sm:table-cell"
              />
              <SortableHeader
                label="Due Date"
                sortKey="due_date"
                currentSort={sortBy}
                currentDirection={currentDirection}
                onSort={handleSort}
                className="hidden lg:table-cell"
              />
              <SortableHeader
                label="Created"
                sortKey="created_at"
                currentSort={sortBy}
                currentDirection={currentDirection}
                onSort={handleSort}
                className="hidden xl:table-cell"
              />
              <SortableHeader
                label="Updated"
                sortKey="updated_at"
                currentSort={sortBy}
                currentDirection={currentDirection}
                onSort={handleSort}
                className="hidden xl:table-cell"
              />
              <SortableHeader
                label="Reporter"
                sortKey="reporter_name"
                currentSort={sortBy}
                currentDirection={currentDirection}
                onSort={handleSort}
                className="hidden lg:table-cell"
              />
              {/* Mobile expand column header */}
              <TableHead className="sm:hidden w-8" />
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
