'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
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

type OrgMember = {
  user_id: string
  display_name: string
}

type BulkActionsBarProps = {
  selectedIds: string[]
  onClear: () => void
  members?: OrgMember[]
}

/* ============================================================
   Component
   ============================================================ */

export const BulkActionsBar = ({ selectedIds, onClear, members = [] }: BulkActionsBarProps) => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const count = selectedIds.length
  const ticketWord = count === 1 ? 'ticket' : 'tickets'

  const handleStatusChange = (status: string) => {
    setError(null)
    startTransition(async () => {
      const result = await bulkUpdateTickets(selectedIds, {
        status: status as TicketStatus,
      })
      if (result.error) {
        setError(result.error)
      } else {
        toast.success(`Updated status for ${count} ${ticketWord}`)
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
        toast.success(`Updated priority for ${count} ${ticketWord}`)
        onClear()
      }
    })
  }

  const handleAssigneeChange = (assigneeId: string) => {
    setError(null)
    const resolvedAssigneeId = assigneeId === '__unassign__' ? null : assigneeId
    startTransition(async () => {
      const result = await bulkUpdateTickets(selectedIds, {
        assignee_id: resolvedAssigneeId,
      })
      if (result.error) {
        setError(result.error)
      } else {
        const label =
          resolvedAssigneeId === null
            ? `Unassigned ${count} ${ticketWord}`
            : `Assigned ${count} ${ticketWord}`
        toast.success(label)
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
        toast.success(`Deleted ${count} ${ticketWord}`)
        onClear()
      }
    })
  }

  return (
    <div
      role="toolbar"
      aria-label={`Bulk actions for ${count} selected ${ticketWord}`}
      className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-[var(--color-primary-light)] bg-[var(--color-primary-subtle,#f0edfa)] p-2 px-3"
    >
      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {count} selected
      </span>

      {/* Status change */}
      <Select onValueChange={handleStatusChange} disabled={isPending}>
        <SelectTrigger
          className="w-full sm:w-[140px]"
          size="sm"
          aria-label="Set status for selected tickets"
        >
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
        <SelectTrigger
          className="w-full sm:w-[140px]"
          size="sm"
          aria-label="Set priority for selected tickets"
        >
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

      {/* Assignee change — only rendered when members are provided */}
      {members.length > 0 && (
        <Select onValueChange={handleAssigneeChange} disabled={isPending}>
          <SelectTrigger
            className="w-full sm:w-[160px]"
            size="sm"
            aria-label="Set assignee for selected tickets"
          >
            <SelectValue placeholder="Set assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__unassign__">Unassigned</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.user_id} value={m.user_id}>
                {m.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

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
              Delete {count} {ticketWord}?
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

      {error && (
        <span role="alert" className="text-sm text-red-600">
          {error}
        </span>
      )}
    </div>
  )
}
