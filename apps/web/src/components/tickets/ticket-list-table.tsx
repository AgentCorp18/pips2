'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import { SortableHeader, type SortDirection } from '@/components/ui/sortable-header'
import { ColumnToggle, type ColumnDef } from '@/components/ui/column-toggle'
import { useColumnVisibility } from '@/hooks/use-column-visibility'
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
  modifiedByName: string | null
  projectId: string | null
  projectName: string | null
}

type OrgMember = {
  user_id: string
  display_name: string
}

type TicketListTableProps = {
  tickets: TicketRow[]
  total: number
  page: number
  perPage: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  members?: OrgMember[]
}

/* ============================================================
   Column definitions — all available columns for the ticket table.
   Columns with a sortKey can be sorted server-side.
   ============================================================ */

const TICKET_COLUMNS: ColumnDef[] = [
  { id: 'id', label: 'ID', canHide: false },
  { id: 'title', label: 'Title', canHide: false },
  { id: 'status', label: 'Status', canHide: false },
  { id: 'priority', label: 'Priority', canHide: true },
  { id: 'type', label: 'Type', canHide: true },
  { id: 'project', label: 'Project', canHide: true },
  { id: 'assignee', label: 'Assignee', canHide: true },
  { id: 'due_date', label: 'Due Date', canHide: true },
  { id: 'created_at', label: 'Created', canHide: true },
  { id: 'updated_at', label: 'Modified Date', canHide: true },
  { id: 'reporter', label: 'Created By', canHide: true },
  { id: 'modified_by', label: 'Modified By', canHide: true },
]

const ALL_COLUMN_IDS = TICKET_COLUMNS.map((c) => c.id)

/** Default visible columns */
const DEFAULT_VISIBLE = [
  'id',
  'title',
  'status',
  'priority',
  'type',
  'project',
  'assignee',
  'due_date',
  'created_at',
  'updated_at',
  'reporter',
  'modified_by',
]

/** Columns that support server-side sorting via Supabase */
const SORTABLE_COLUMNS: Record<string, string> = {
  id: 'sequence_number',
  title: 'title',
  status: 'status',
  priority: 'priority',
  type: 'type',
  due_date: 'due_date',
  created_at: 'created_at',
  updated_at: 'updated_at',
}

export const TicketListTable = ({
  tickets,
  total,
  page,
  perPage,
  sortBy,
  sortOrder,
  members = [],
}: TicketListTableProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isFullScreen, setIsFullScreen] = useState(false)

  const { visibleColumns, toggleColumn, resetToDefaults, isVisible } = useColumnVisibility(
    'tickets',
    ALL_COLUMN_IDS,
    DEFAULT_VISIBLE,
  )

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

  /** Render a column header — sortable if the column has a sort key */
  const renderHeader = (colId: string, label: string, className?: string) => {
    if (!isVisible(colId)) return null
    const sortKey = SORTABLE_COLUMNS[colId]
    if (sortKey) {
      return (
        <SortableHeader
          label={label}
          sortKey={sortKey}
          currentSort={sortBy}
          currentDirection={currentDirection}
          onSort={handleSort}
          className={className}
        />
      )
    }
    return <TableHead className={className}>{label}</TableHead>
  }

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
        <ColumnToggle
          columns={TICKET_COLUMNS}
          visibleColumns={visibleColumns}
          onToggle={toggleColumn}
          onReset={resetToDefaults}
        />
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
        <BulkActionsBar
          selectedIds={Array.from(selectedIds)}
          onClear={clearSelection}
          members={members}
        />
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
              {renderHeader('id', 'ID')}
              {renderHeader('title', 'Title')}
              {renderHeader('status', 'Status')}
              {renderHeader('priority', 'Priority', 'hidden sm:table-cell')}
              {renderHeader('type', 'Type', 'hidden md:table-cell')}
              {renderHeader('project', 'Project', 'hidden md:table-cell')}
              {renderHeader('assignee', 'Assignee', 'hidden sm:table-cell')}
              {renderHeader('due_date', 'Due Date', 'hidden lg:table-cell')}
              {renderHeader('created_at', 'Created', 'hidden xl:table-cell')}
              {renderHeader('updated_at', 'Modified Date', 'hidden xl:table-cell')}
              {renderHeader('reporter', 'Created By', 'hidden lg:table-cell')}
              {renderHeader('modified_by', 'Modified By', 'hidden xl:table-cell')}
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
                visibleColumns={visibleColumns}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer — pb-16 reserves space for QuickCreateFab */}
      {total > 0 && (
        <div className="mt-3 flex items-center justify-between pb-16 text-sm text-muted-foreground">
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
