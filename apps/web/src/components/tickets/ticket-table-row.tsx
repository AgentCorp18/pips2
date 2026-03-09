'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Bug, CheckSquare, CircleDot, Lightbulb, FolderKanban, User } from 'lucide-react'
import { FormattedDate } from '@/components/ui/formatted-date'
import { STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG } from './ticket-config'
import type { TicketRow } from './ticket-list-table'
import type { TicketType } from '@/types/tickets'

/* ============================================================
   Type Icons
   ============================================================ */

const TYPE_ICONS: Record<TicketType, React.ReactNode> = {
  task: <CheckSquare size={14} />,
  bug: <Bug size={14} />,
  feature: <Lightbulb size={14} />,
  general: <CircleDot size={14} />,
  pips_project: <FolderKanban size={14} />,
}

/* ============================================================
   Props
   ============================================================ */

type TicketTableRowProps = {
  ticket: TicketRow
  isSelected: boolean
  onToggle: (id: string) => void
}

/* ============================================================
   Component
   ============================================================ */

export const TicketTableRow = ({ ticket, isSelected, onToggle }: TicketTableRowProps) => {
  const router = useRouter()
  const navigate = () => router.push(`/tickets/${ticket.id}`)

  return (
    <TableRow className="cursor-pointer" data-state={isSelected ? 'selected' : undefined}>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(ticket.id)}
          className="h-4 w-4 rounded border-gray-300"
          aria-label={`Select ${ticket.sequenceId}`}
        />
      </TableCell>
      <TableCell
        className="font-mono text-xs"
        style={{ color: 'var(--color-text-tertiary)' }}
        onClick={navigate}
      >
        {ticket.sequenceId}
      </TableCell>
      <TableCell className="max-w-[300px] truncate font-medium" onClick={navigate}>
        {ticket.title}
      </TableCell>
      <TableCell onClick={navigate}>
        <Badge className={`text-xs ${STATUS_CONFIG[ticket.status].className}`} variant="secondary">
          {STATUS_CONFIG[ticket.status].label}
        </Badge>
      </TableCell>
      <TableCell onClick={navigate}>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: PRIORITY_CONFIG[ticket.priority].color }}
          />
          <span className="text-sm">{PRIORITY_CONFIG[ticket.priority].label}</span>
        </span>
      </TableCell>
      <TableCell onClick={navigate}>
        <span className="flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
          {TYPE_ICONS[ticket.type]}
          <span className="text-sm">{TYPE_CONFIG[ticket.type].label}</span>
        </span>
      </TableCell>
      <TableCell onClick={navigate}>
        {ticket.assigneeName ? (
          <span className="flex items-center gap-1.5 text-sm">
            {ticket.assigneeAvatar ? (
              <Image
                src={ticket.assigneeAvatar}
                alt={ticket.assigneeName}
                width={20}
                height={20}
                className="h-5 w-5 rounded-full"
              />
            ) : (
              <User size={14} className="text-muted-foreground" />
            )}
            <span className="max-w-[100px] truncate">{ticket.assigneeName}</span>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">--</span>
        )}
      </TableCell>
      <TableCell className="text-sm" onClick={navigate}>
        {ticket.dueDate ? <FormattedDate date={ticket.dueDate} fallback="--" /> : '--'}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground" onClick={navigate}>
        <FormattedDate date={ticket.createdAt} />
      </TableCell>
    </TableRow>
  )
}
