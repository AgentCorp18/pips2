import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Clock, Inbox } from 'lucide-react'
import type { TeamWorkloadMember } from '@/app/(app)/teams/actions'

/* ============================================================
   Workload level — determines heatmap color
   ============================================================ */

type WorkloadLevel = 'idle' | 'light' | 'moderate' | 'heavy' | 'overloaded'

const getWorkloadLevel = (member: TeamWorkloadMember): WorkloadLevel => {
  if (member.overdue > 0) return 'overloaded'
  if (member.open_tickets >= 10) return 'heavy'
  if (member.open_tickets >= 5) return 'moderate'
  if (member.open_tickets >= 1) return 'light'
  return 'idle'
}

const WORKLOAD_STYLES: Record<WorkloadLevel, { bg: string; border: string; label: string }> = {
  idle: {
    bg: 'var(--color-surface-secondary)',
    border: 'var(--color-border)',
    label: 'Idle',
  },
  light: {
    bg: '#DCFCE7',
    border: '#86EFAC',
    label: 'Light',
  },
  moderate: {
    bg: '#FEF9C3',
    border: '#FDE047',
    label: 'Moderate',
  },
  heavy: {
    bg: '#FED7AA',
    border: '#FB923C',
    label: 'Heavy',
  },
  overloaded: {
    bg: '#FECACA',
    border: '#F87171',
    label: 'Overloaded',
  },
}

/* ============================================================
   TeamWorkload Component
   ============================================================ */

type TeamWorkloadProps = {
  members: TeamWorkloadMember[]
}

export const TeamWorkload = ({ members }: TeamWorkloadProps) => {
  if (members.length === 0) {
    return (
      <Card data-testid="team-workload-empty">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Inbox
            size={32}
            style={{ color: 'var(--color-text-tertiary)' }}
            className="mb-2"
            aria-hidden="true"
          />
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            Add members to see workload distribution.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Summary stats
  const totalOpen = members.reduce((sum, m) => sum + m.open_tickets, 0)
  const totalOverdue = members.reduce((sum, m) => sum + m.overdue, 0)
  const totalInProgress = members.reduce((sum, m) => sum + m.in_progress, 0)
  const totalCompleted = members.reduce((sum, m) => sum + m.completed, 0)

  return (
    <div data-testid="team-workload">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Workload Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary KPIs */}
          <div
            className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4"
            data-testid="workload-summary"
          >
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Inbox size={14} style={{ color: '#3B82F6' }} aria-hidden="true" />
                <span
                  className="text-lg font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {totalOpen}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                Open
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Clock size={14} style={{ color: '#8B5CF6' }} aria-hidden="true" />
                <span
                  className="text-lg font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {totalInProgress}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                In Progress
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle size={14} style={{ color: '#22C55E' }} aria-hidden="true" />
                <span
                  className="text-lg font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {totalCompleted}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                Completed
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <AlertTriangle size={14} style={{ color: '#EF4444' }} aria-hidden="true" />
                <span
                  className="text-lg font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {totalOverdue}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                Overdue
              </p>
            </div>
          </div>

          {/* Member workload rows */}
          <div className="space-y-2" data-testid="workload-members">
            {members
              .sort((a, b) => b.open_tickets - a.open_tickets)
              .map((member) => {
                const level = getWorkloadLevel(member)
                const style = WORKLOAD_STYLES[level]

                return (
                  <div
                    key={member.user_id}
                    className="flex items-center gap-3 rounded-[var(--radius-md)] border p-3"
                    style={{ borderColor: style.border, backgroundColor: style.bg }}
                    data-testid={`workload-member-${member.user_id}`}
                  >
                    {/* Avatar placeholder */}
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                      }}
                      aria-hidden="true"
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name + level */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {member.name}
                      </p>
                      <Badge
                        variant="outline"
                        className="mt-0.5 text-[10px]"
                        data-testid={`workload-level-${member.user_id}`}
                      >
                        {style.label}
                      </Badge>
                    </div>

                    {/* Ticket counts */}
                    <div
                      className="flex items-center gap-3 text-xs"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <span title="Open tickets" data-testid={`workload-open-${member.user_id}`}>
                        {member.open_tickets} open
                      </span>
                      <span title="In progress" data-testid={`workload-ip-${member.user_id}`}>
                        {member.in_progress} active
                      </span>
                      {member.overdue > 0 && (
                        <span
                          className="font-medium"
                          style={{ color: '#EF4444' }}
                          title="Overdue tickets"
                          data-testid={`workload-overdue-${member.user_id}`}
                        >
                          {member.overdue} overdue
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-3" data-testid="workload-legend">
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Workload:
            </span>
            {(
              Object.entries(WORKLOAD_STYLES) as [WorkloadLevel, typeof WORKLOAD_STYLES.idle][]
            ).map(([level, style]) => (
              <span key={level} className="flex items-center gap-1 text-xs">
                <span
                  className="inline-block h-3 w-3 rounded-sm border"
                  style={{ backgroundColor: style.bg, borderColor: style.border }}
                />
                {style.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
