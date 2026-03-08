'use client'

import { useState, useCallback, useTransition } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { updateTicketStatus } from '@/app/(app)/tickets/actions'
import { KanbanCard } from './kanban-card'
import type { TicketStatus, TicketPriority, TicketType } from '@/types/tickets'

/* ============================================================
   Column Config
   ============================================================ */

const BOARD_COLUMNS = [
  { id: 'backlog' as const, label: 'Backlog', color: 'var(--color-text-tertiary)' },
  { id: 'todo' as const, label: 'To Do', color: '#3B82F6' },
  { id: 'in_progress' as const, label: 'In Progress', color: '#F59E0B' },
  { id: 'in_review' as const, label: 'In Review', color: '#6366F1' },
  { id: 'blocked' as const, label: 'Blocked', color: '#EF4444' },
  { id: 'done' as const, label: 'Done', color: '#10B981' },
  { id: 'cancelled' as const, label: 'Cancelled', color: 'var(--color-text-tertiary)' },
]

/* ============================================================
   Types
   ============================================================ */

export type BoardTicket = {
  id: string
  sequenceId: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  type: TicketType
  assigneeName: string | null
  assigneeAvatar: string | null
  dueDate: string | null
}

type KanbanBoardProps = {
  initialTickets: BoardTicket[]
}

type ColumnData = Record<TicketStatus, BoardTicket[]>

/* ============================================================
   Helpers
   ============================================================ */

const groupByStatus = (tickets: BoardTicket[]): ColumnData => {
  const grouped: ColumnData = {
    backlog: [],
    todo: [],
    in_progress: [],
    in_review: [],
    blocked: [],
    done: [],
    cancelled: [],
  }

  for (const ticket of tickets) {
    grouped[ticket.status].push(ticket)
  }

  return grouped
}

/* ============================================================
   Component
   ============================================================ */

export const KanbanBoard = ({ initialTickets }: KanbanBoardProps) => {
  const [columns, setColumns] = useState<ColumnData>(() => groupByStatus(initialTickets))
  const [, startTransition] = useTransition()

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result

      if (!destination) return
      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return
      }

      const sourceStatus = source.droppableId as TicketStatus
      const destStatus = destination.droppableId as TicketStatus

      setColumns((prev) => {
        const next = { ...prev }
        const sourceItems = [...next[sourceStatus]]
        const moved = sourceItems.splice(source.index, 1)[0]

        if (!moved) return prev

        if (sourceStatus === destStatus) {
          sourceItems.splice(destination.index, 0, moved)
          next[sourceStatus] = sourceItems
        } else {
          const destItems = [...next[destStatus]]
          const updated: BoardTicket = { ...moved, status: destStatus }
          destItems.splice(destination.index, 0, updated)
          next[sourceStatus] = sourceItems
          next[destStatus] = destItems
        }

        return next
      })

      // Persist to server if status changed
      if (sourceStatus !== destStatus) {
        startTransition(async () => {
          const result = await updateTicketStatus(draggableId, destStatus)
          if (result.error) {
            // Revert on error
            setColumns(groupByStatus(initialTickets))
          }
        })
      }
    },
    [initialTickets],
  )

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        className="flex gap-4 overflow-x-auto pb-4"
        role="region"
        aria-label="Kanban board — drag tickets between columns to change status"
      >
        {BOARD_COLUMNS.map((col) => {
          const tickets = columns[col.id]

          return (
            <div
              key={col.id}
              className="flex w-[280px] flex-shrink-0 flex-col"
              role="group"
              data-testid={`kanban-column-${col.id}`}
              aria-label={`${col.label} column, ${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}`}
            >
              {/* Column header */}
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: col.color }}
                  aria-hidden="true"
                />
                <h3
                  className="text-sm font-semibold"
                  data-testid={`kanban-column-heading-${col.id}`}
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {col.label}
                </h3>
                <span
                  className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-secondary)',
                  }}
                  data-testid={`kanban-column-count-${col.id}`}
                  aria-label={`${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}`}
                >
                  {tickets.length}
                </span>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex min-h-[120px] flex-1 flex-col gap-2 rounded-[var(--radius-lg)] p-2 transition-colors"
                    style={{
                      backgroundColor: snapshot.isDraggingOver
                        ? 'var(--color-primary-subtle, #F0EDFA)'
                        : 'var(--color-bg-secondary, #F9FAFB)',
                    }}
                  >
                    {tickets.map((ticket, index) => (
                      <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                        {(dragProvided) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            aria-label={`${ticket.sequenceId}: ${ticket.title}, priority ${ticket.priority}, in ${col.label}`}
                          >
                            <KanbanCard
                              id={ticket.id}
                              sequenceId={ticket.sequenceId}
                              title={ticket.title}
                              priority={ticket.priority}
                              type={ticket.type}
                              assigneeName={ticket.assigneeName}
                              assigneeAvatar={ticket.assigneeAvatar}
                              dueDate={ticket.dueDate}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
