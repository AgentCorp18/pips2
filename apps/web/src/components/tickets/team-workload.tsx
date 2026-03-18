'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle2, User } from 'lucide-react'
import type { WorkloadMember, WorkloadTicket } from '@/app/(app)/tickets/workload/actions'

/* ============================================================
   Constants
   ============================================================ */

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#3B82F6',
  none: 'var(--color-text-tertiary)',
}

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  blocked: 'Blocked',
  done: 'Done',
}

const WORKLOAD_THRESHOLDS = {
  light: 3,
  moderate: 6,
  heavy: 10,
}

const getWorkloadLevel = (count: number): { label: string; color: string } => {
  if (count === 0) return { label: 'Idle', color: 'var(--color-text-tertiary)' }
  if (count <= WORKLOAD_THRESHOLDS.light) return { label: 'Light', color: '#22C55E' }
  if (count <= WORKLOAD_THRESHOLDS.moderate) return { label: 'Moderate', color: '#F59E0B' }
  if (count <= WORKLOAD_THRESHOLDS.heavy) return { label: 'Heavy', color: '#F97316' }
  return { label: 'Overloaded', color: '#EF4444' }
}

/* ============================================================
   Helpers
   ============================================================ */

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const groupByStatus = (tickets: WorkloadTicket[]): Record<string, WorkloadTicket[]> => {
  const groups: Record<string, WorkloadTicket[]> = {}
  for (const t of tickets) {
    if (!groups[t.status]) groups[t.status] = []
    groups[t.status]!.push(t)
  }
  return groups
}

/* ============================================================
   Component
   ============================================================ */

type TeamWorkloadProps = {
  members: WorkloadMember[]
  unassignedCount: number
  prefix: string
}

export const TeamWorkload = ({ members, unassignedCount, prefix }: TeamWorkloadProps) => {
  const [expandedMember, setExpandedMember] = useState<string | null>(null)

  // Summary stats
  const stats = useMemo(() => {
    const totalTickets = members.reduce((sum, m) => sum + m.tickets.length, 0) + unassignedCount
    const activeMembers = members.filter((m) => m.tickets.length > 0).length
    const blockedCount = members.reduce(
      (sum, m) => sum + m.tickets.filter((t) => t.status === 'blocked').length,
      0,
    )
    const overdueCount = members.reduce((sum, m) => {
      const today = new Date().toISOString().split('T')[0]!
      return (
        sum +
        m.tickets.filter((t) => t.due_date && t.due_date < today && t.status !== 'done').length
      )
    }, 0)

    return { totalTickets, activeMembers, blockedCount, overdueCount }
  }, [members, unassignedCount])

  // Max tickets for bar scaling
  const maxTickets = useMemo(() => Math.max(...members.map((m) => m.tickets.length), 1), [members])

  return (
    <div data-testid="team-workload">
      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total Open" value={stats.totalTickets} testId="workload-total" />
        <SummaryCard
          label="Active Members"
          value={stats.activeMembers}
          total={members.length}
          testId="workload-active-members"
        />
        <SummaryCard
          label="Blocked"
          value={stats.blockedCount}
          color={stats.blockedCount > 0 ? '#EF4444' : undefined}
          testId="workload-blocked"
        />
        <SummaryCard
          label="Overdue"
          value={stats.overdueCount}
          color={stats.overdueCount > 0 ? '#F97316' : undefined}
          testId="workload-overdue"
        />
      </div>

      {/* Workload bars */}
      <div
        className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]"
        data-testid="workload-chart"
      >
        {/* Header */}
        <div className="flex items-center border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-4 py-2.5">
          <span
            className="w-[200px] text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Team Member
          </span>
          <span
            className="flex-1 text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Workload
          </span>
          <span
            className="w-[80px] text-center text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Count
          </span>
          <span
            className="w-[90px] text-center text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Level
          </span>
        </div>

        {/* Member rows */}
        {members.map((member) => {
          const level = getWorkloadLevel(member.tickets.length)
          const isExpanded = expandedMember === member.user_id
          const statusGroups = isExpanded ? groupByStatus(member.tickets) : {}

          return (
            <div key={member.user_id}>
              <button
                type="button"
                onClick={() => setExpandedMember(isExpanded ? null : member.user_id)}
                className="flex w-full items-center border-b border-[var(--color-border)] px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-secondary)]"
                data-testid={`workload-member-${member.user_id}`}
                aria-expanded={isExpanded}
                aria-label={`${member.display_name}: ${member.tickets.length} tickets, ${level.label} workload`}
              >
                {/* Avatar + name */}
                <div className="flex w-[200px] items-center gap-2">
                  {member.avatar_url ? (
                    <Image
                      src={member.avatar_url}
                      alt=""
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {getInitials(member.display_name)}
                    </div>
                  )}
                  <span
                    className="truncate text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {member.display_name}
                  </span>
                </div>

                {/* Bar */}
                <div className="flex flex-1 items-center gap-2 px-2">
                  <div
                    className="h-6 w-full overflow-hidden rounded-[var(--radius-sm)]"
                    style={{ backgroundColor: 'var(--color-surface-secondary)' }}
                  >
                    <div
                      className="flex h-full items-center gap-[1px] transition-all"
                      style={{
                        width: `${Math.max((member.tickets.length / maxTickets) * 100, member.tickets.length > 0 ? 5 : 0)}%`,
                      }}
                    >
                      {/* Stacked priority segments */}
                      {(['critical', 'high', 'medium', 'low', 'none'] as const).map((p) => {
                        const count = member.tickets.filter((t) => t.priority === p).length
                        if (count === 0) return null
                        return (
                          <div
                            key={p}
                            className="h-full rounded-[2px]"
                            style={{
                              backgroundColor: PRIORITY_COLORS[p],
                              flex: count,
                            }}
                            title={`${count} ${p}`}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Count */}
                <span
                  className="w-[80px] text-center text-sm font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {member.tickets.length}
                </span>

                {/* Level badge */}
                <div className="w-[90px] text-center">
                  <Badge
                    variant="outline"
                    className="text-[10px]"
                    style={{ borderColor: level.color, color: level.color }}
                  >
                    {level.label}
                  </Badge>
                </div>
              </button>

              {/* Expanded ticket list */}
              {isExpanded && member.tickets.length > 0 && (
                <div
                  className="border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-4 py-3"
                  data-testid={`workload-detail-${member.user_id}`}
                >
                  {Object.entries(statusGroups).map(([status, tickets]) => (
                    <div key={status} className="mb-3 last:mb-0">
                      <p
                        className="mb-1.5 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        {STATUS_LABELS[status] ?? status} ({tickets.length})
                      </p>
                      <div className="space-y-1">
                        {tickets.map((ticket) => (
                          <Link
                            key={ticket.id}
                            href={`/tickets/${ticket.id}`}
                            className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 transition-colors hover:bg-[var(--color-surface)]"
                            data-testid={`workload-ticket-${ticket.id}`}
                          >
                            <span
                              className="inline-block h-2 w-2 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  PRIORITY_COLORS[ticket.priority] ?? 'var(--color-text-tertiary)',
                              }}
                            />
                            <span
                              className="text-xs"
                              style={{ color: 'var(--color-text-tertiary)' }}
                            >
                              {prefix}-{ticket.sequence_number}
                            </span>
                            <span
                              className="min-w-0 flex-1 truncate text-xs font-medium"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {ticket.title}
                            </span>
                            {ticket.project_title && (
                              <span
                                className="shrink-0 text-[10px]"
                                style={{ color: 'var(--color-text-tertiary)' }}
                              >
                                {ticket.project_title}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Unassigned row */}
        {unassignedCount > 0 && (
          <div className="flex items-center border-b border-[var(--color-border)] px-4 py-3">
            <div className="flex w-[200px] items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                  backgroundColor: 'var(--color-surface-secondary)',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                <User size={14} />
              </div>
              <span className="text-sm italic" style={{ color: 'var(--color-text-tertiary)' }}>
                Unassigned
              </span>
            </div>
            <div className="flex-1" />
            <span
              className="w-[80px] text-center text-sm font-semibold"
              style={{ color: 'var(--color-text-tertiary)' }}
              data-testid="workload-unassigned-count"
            >
              {unassignedCount}
            </span>
            <div className="w-[90px] text-center">
              <Badge
                variant="outline"
                className="text-[10px]"
                style={{ color: '#F97316', borderColor: '#F97316' }}
              >
                <AlertTriangle size={10} className="mr-0.5" />
                Unassigned
              </Badge>
            </div>
          </div>
        )}

        {/* Empty state */}
        {members.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-12"
            data-testid="workload-empty"
          >
            <CheckCircle2
              size={40}
              style={{ color: 'var(--color-text-tertiary)' }}
              className="mb-3"
            />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              No team members found
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Invite members to your organization to see workload data.
            </p>
          </div>
        )}
      </div>

      {/* Priority legend */}
      <div
        className="mt-3 flex flex-wrap items-center gap-4 text-xs"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Priority:
        </span>
        {Object.entries(PRIORITY_COLORS)
          .filter(([key]) => key !== 'none')
          .map(([priority, color]) => (
            <span key={priority} className="flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {priority}
            </span>
          ))}
      </div>
    </div>
  )
}

/* ============================================================
   Summary Card
   ============================================================ */

type SummaryCardProps = {
  label: string
  value: number
  total?: number
  color?: string
  testId: string
}

const SummaryCard = ({ label, value, total, color, testId }: SummaryCardProps) => (
  <div
    className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
    data-testid={testId}
  >
    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
      {label}
    </p>
    <p className="mt-1 text-2xl font-bold" style={{ color: color ?? 'var(--color-text-primary)' }}>
      {value}
      {total !== undefined && (
        <span className="text-base font-normal" style={{ color: 'var(--color-text-tertiary)' }}>
          /{total}
        </span>
      )}
    </p>
  </div>
)
