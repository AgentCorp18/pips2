'use client'

import Link from 'next/link'
import { Target, FolderKanban, Calendar, TrendingUp } from 'lucide-react'
import type { InitiativeStatus, DeadlineStatus } from '@/types/initiatives'
import { FormattedDate } from '@/components/ui/formatted-date'

type InitiativeCardProps = {
  initiative: {
    id: string
    title: string
    description: string | null
    status: InitiativeStatus
    color: string
    target_metric: string | null
    target_end: string | null
    project_count: number
    step_progress: number
    owner: { id: string; display_name: string }
    deadlineStatus?: DeadlineStatus
    totalSavings?: number
  }
}

const getProgressColor = (progress: number): string => {
  if (progress > 66) return '#16a34a' // green-600
  if (progress >= 33) return '#ca8a04' // yellow-600
  return '#dc2626' // red-600
}

const STATUS_STYLES: Record<InitiativeStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  active: { label: 'Active', className: 'bg-green-100 text-green-700' },
  on_hold: { label: 'On Hold', className: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', className: 'bg-blue-100 text-blue-700' },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-500' },
}

const DEADLINE_BADGE: Record<DeadlineStatus, { label: string; className: string }> = {
  on_track: { label: 'On Track', className: 'bg-green-100 text-green-700' },
  at_risk: { label: 'At Risk', className: 'bg-amber-100 text-amber-700' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700' },
}

const formatSavings = (amount: number): string => {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toFixed(0)}`
}

export const InitiativeCard = ({ initiative }: InitiativeCardProps) => {
  const statusStyle = STATUS_STYLES[initiative.status]
  const deadlineBadge =
    initiative.deadlineStatus != null ? DEADLINE_BADGE[initiative.deadlineStatus] : null

  return (
    <Link
      href={`/initiatives/${initiative.id}`}
      className="group block rounded-[var(--radius-lg)] border p-5 transition-shadow hover:shadow-md"
      style={{ borderColor: 'var(--color-border)' }}
      data-testid="initiative-card"
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-1">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${initiative.color}20`, color: initiative.color }}
          >
            <Target size={16} />
          </div>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle.className}`}>
            {statusStyle.label}
          </span>
        </div>
        {deadlineBadge && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${deadlineBadge.className}`}
            data-testid="initiative-deadline-badge"
          >
            {deadlineBadge.label}
          </span>
        )}
      </div>

      <h3
        className="mb-1 line-clamp-2 font-semibold group-hover:underline"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {initiative.title}
      </h3>

      {initiative.description && (
        <p className="mb-3 line-clamp-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {initiative.description}
        </p>
      )}

      {initiative.target_metric && (
        <p className="mb-3 text-xs font-medium" style={{ color: initiative.color }}>
          {initiative.target_metric}
        </p>
      )}

      {initiative.totalSavings != null && initiative.totalSavings > 0 && (
        <div className="mb-3 flex items-center gap-1 text-xs font-medium text-green-700">
          <TrendingUp size={12} />
          <span data-testid="initiative-savings">
            {formatSavings(initiative.totalSavings)} savings
          </span>
        </div>
      )}

      {initiative.project_count > 0 && (
        <div className="mb-3" data-testid="initiative-progress">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span style={{ color: 'var(--color-text-tertiary)' }}>Step progress</span>
            <span
              className="font-semibold"
              style={{ color: getProgressColor(initiative.step_progress) }}
              data-testid="initiative-progress-pct"
            >
              {initiative.step_progress}%
            </span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${initiative.step_progress}%`,
                backgroundColor: getProgressColor(initiative.step_progress),
              }}
            />
          </div>
        </div>
      )}

      <div
        className="flex items-center gap-4 text-xs"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        <span className="flex items-center gap-1">
          <FolderKanban size={12} />
          {initiative.project_count} project{initiative.project_count !== 1 ? 's' : ''}
        </span>
        {initiative.target_end && (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            <FormattedDate date={initiative.target_end} showTime={false} />
          </span>
        )}
        <span className="ml-auto">{initiative.owner.display_name}</span>
      </div>
    </Link>
  )
}
