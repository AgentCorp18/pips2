'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Bug,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Crown,
  Lightbulb,
  FolderKanban,
  User,
} from 'lucide-react'
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
  ceo_request: <Crown size={14} />,
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
  const [expanded, setExpanded] = useState(false)
  const navigate = () => router.push(`/tickets/${ticket.id}`)

  // Count visible columns for the expanded detail row colspan
  // Checkbox + ID + Title + Status + expand = 5 on mobile
  const mobileColSpan = 5

  return (
    <>
      <TableRow
        className="cursor-pointer"
        onClick={navigate}
        data-state={isSelected ? 'selected' : undefined}
        data-testid={`ticket-row-${ticket.id}`}
      >
        <TableCell onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(ticket.id)}
            className="h-4 w-4 rounded border-gray-300"
            aria-label={`Select ${ticket.sequenceId}`}
          />
        </TableCell>
        <TableCell className="font-mono text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {ticket.sequenceId}
        </TableCell>
        <TableCell className="max-w-[200px] truncate font-medium md:max-w-[300px]">
          {ticket.title}
        </TableCell>
        <TableCell>
          <Badge
            className={`text-xs ${STATUS_CONFIG[ticket.status].className}`}
            variant="secondary"
          >
            {STATUS_CONFIG[ticket.status].label}
          </Badge>
        </TableCell>
        <TableCell className="hidden sm:table-cell">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: PRIORITY_CONFIG[ticket.priority].color }}
            />
            <span className="text-sm">{PRIORITY_CONFIG[ticket.priority].label}</span>
          </span>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <span className="flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
            {TYPE_ICONS[ticket.type]}
            <span className="text-sm">{TYPE_CONFIG[ticket.type].label}</span>
          </span>
        </TableCell>
        <TableCell className="hidden sm:table-cell">
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
        <TableCell className="hidden lg:table-cell text-sm">
          {ticket.dueDate ? (
            <FormattedDate date={ticket.dueDate} showTime={false} fallback="--" />
          ) : (
            '--'
          )}
        </TableCell>
        <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
          <FormattedDate date={ticket.createdAt} />
        </TableCell>
        <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
          <FormattedDate date={ticket.updatedAt} />
        </TableCell>
        <TableCell className="hidden lg:table-cell text-sm">
          {ticket.reporterName ?? <span className="text-muted-foreground">--</span>}
        </TableCell>
        {/* Mobile expand toggle — only visible below sm */}
        <TableCell
          className="sm:hidden w-8"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
        >
          <ChevronDown
            size={16}
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            style={{ color: 'var(--color-text-tertiary)' }}
          />
        </TableCell>
      </TableRow>

      {/* Mobile detail row — shows hidden columns */}
      {expanded && (
        <TableRow className="sm:hidden" data-testid={`ticket-row-detail-${ticket.id}`}>
          <TableCell colSpan={mobileColSpan} className="py-2 pl-12">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs" onClick={navigate}>
              <MobileDetail label="Priority">
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: PRIORITY_CONFIG[ticket.priority].color }}
                  />
                  {PRIORITY_CONFIG[ticket.priority].label}
                </span>
              </MobileDetail>
              <MobileDetail label="Type">
                <span className="flex items-center gap-1">
                  {TYPE_ICONS[ticket.type]}
                  {TYPE_CONFIG[ticket.type].label}
                </span>
              </MobileDetail>
              <MobileDetail label="Assignee">
                {ticket.assigneeName ?? (
                  <span style={{ color: 'var(--color-text-tertiary)' }}>Unassigned</span>
                )}
              </MobileDetail>
              <MobileDetail label="Due Date">
                {ticket.dueDate ? (
                  <FormattedDate date={ticket.dueDate} showTime={false} fallback="--" />
                ) : (
                  <span style={{ color: 'var(--color-text-tertiary)' }}>None</span>
                )}
              </MobileDetail>
              {ticket.reporterName && (
                <MobileDetail label="Reporter">{ticket.reporterName}</MobileDetail>
              )}
              <MobileDetail label="Created">
                <FormattedDate date={ticket.createdAt} />
              </MobileDetail>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

/* ============================================================
   MobileDetail helper
   ============================================================ */

const MobileDetail = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <span className="font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
      {label}
    </span>
    <div style={{ color: 'var(--color-text-primary)' }}>{children}</div>
  </div>
)
