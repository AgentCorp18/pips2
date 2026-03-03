'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, X } from 'lucide-react'
import { bulkUpdateTickets, bulkDeleteTickets } from '@/app/(app)/tickets/actions'
import { STATUS_CONFIG, PRIORITY_CONFIG, ALL_STATUSES, ALL_PRIORITIES } from './ticket-config'
import type { TicketStatus, TicketPriority } from '@/types/tickets'

/* ============================================================
   Types
   ============================================================ */

type BulkActionsBarProps = {
  selectedIds: string[]
  onClear: () => void
}

/* ============================================================
   Component
   ============================================================ */

export const BulkActionsBar = ({ selectedIds, onClear }: BulkActionsBarProps) => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleStatusChange = (status: string) => {
    setError(null)
    startTransition(async () => {
      const result = await bulkUpdateTickets(selectedIds, {
        status: status as TicketStatus,
      })
      if (result.error) {
        setError(result.error)
      } else {
        onClear()
      }
    })
  }

  const handlePriorityChange = (priority: string) => {
    setError(null)
    startTransition(async () => {
      const result = await bulkUpdateTickets(selectedIds, {
        priority: priority as TicketPriority,
      })
      if (result.error) {
        setError(result.error)
      } else {
        onClear()
      }
    })
  }

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      const result = await bulkDeleteTickets(selectedIds)
      if (result.error) {
        setError(result.error)
      } else {
        onClear()
      }
    })
  }

  return (
    <div className="mb-3 flex items-center gap-3 rounded-lg border border-[var(--color-primary-light)] bg-[var(--color-primary-subtle,#f0edfa)] p-2 px-3">
      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {selectedIds.length} selected
      </span>

      {/* Status change */}
      <Select onValueChange={handleStatusChange} disabled={isPending}>
        <SelectTrigger className="w-[140px]" size="sm">
          <SelectValue placeholder="Set status" />
        </SelectTrigger>
        <SelectContent>
          {ALL_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority change */}
      <Select onValueChange={handlePriorityChange} disabled={isPending}>
        <SelectTrigger className="w-[140px]" size="sm">
          <SelectValue placeholder="Set priority" />
        </SelectTrigger>
        <SelectContent>
          {ALL_PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {PRIORITY_CONFIG[p].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Delete with confirmation */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isPending} className="gap-1">
            <Trash2 size={14} />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.length} ticket{selectedIds.length !== 1 ? 's' : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected tickets will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear selection */}
      <Button variant="ghost" size="sm" onClick={onClear} disabled={isPending} className="gap-1">
        <X size={14} />
        Clear
      </Button>

      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}
