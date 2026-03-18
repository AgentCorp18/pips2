'use client'

import { useState, useCallback, useEffect, useTransition, useRef } from 'react'
import { Maximize2, Minimize2, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [isExpanded, setIsExpanded] = useState(false)
  // Tracks the last successfully persisted board state so error reverts are accurate
  // even after multiple successful drags since the component first mounted.
  const lastKnownGoodState = useRef<ColumnData>(groupByStatus(initialTickets))

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const sourceStatus = source.droppableId as TicketStatus
    const destStatus = destination.droppableId as TicketStatus

    // Capture the optimistic next state so we can promote it to lastKnownGoodState
    // after a successful server round-trip, or discard it on failure.
    let optimisticState: ColumnData | null = null

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

      optimisticState = next
      return next
    })

    if (sourceStatus !== destStatus) {
      // Persist status change to server
      startTransition(async () => {
        const serverResult = await updateTicketStatus(draggableId, destStatus)
        if (serverResult.error) {
          // Revert to last known good state — NOT the stale initialTickets prop
          setColumns(lastKnownGoodState.current)
        } else {
          // Advance checkpoint on success
          if (optimisticState !== null) {
            lastKnownGoodState.current = optimisticState
          }
        }
      })
    } else {
      // Same-column reorder is purely local — always safe to advance checkpoint
      if (optimisticState !== null) {
        lastKnownGoodState.current = optimisticState
      }
    }
  }, [])

  // Lock body scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isExpanded])

  // ESC key closes expanded mode
  useEffect(() => {
    if (!isExpanded) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded])

  const toggleBrowserFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  const boardContent = (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        className={`flex gap-4 pb-4 ${isExpanded ? 'h-full overflow-auto' : 'overflow-x-auto'}`}
        role="region"
        aria-label="Kanban board — drag tickets between columns to change status"
      >
        {BOARD_COLUMNS.map((col) => {
          const tickets = columns[col.id]

          return (
            <div
              key={col.id}
              className={`flex flex-shrink-0 flex-col ${isExpanded ? 'min-w-[200px] flex-1' : 'w-[240px] sm:w-[280px]'}`}
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

  if (isExpanded) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
        data-testid="kanban-expanded-overlay"
      >
        {/* Toolbar */}
        <div
          className="flex h-12 flex-shrink-0 items-center justify-between border-b px-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Ticket Board
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={toggleBrowserFullscreen}
              aria-label="Toggle browser fullscreen"
              data-testid="kanban-browser-fullscreen"
            >
              <Monitor size={16} />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setIsExpanded(false)}
              aria-label="Collapse board"
              data-testid="kanban-collapse-button"
            >
              <Minimize2 size={16} />
            </Button>
          </div>
        </div>

        {/* Board fills remaining height */}
        <div className="flex-1 overflow-hidden p-4">{boardContent}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setIsExpanded(true)}
          className="gap-1"
          aria-label="Expand board"
          data-testid="kanban-expand-button"
        >
          <Maximize2 size={14} />
          Expand
        </Button>
      </div>
      {boardContent}
    </div>
  )
}
