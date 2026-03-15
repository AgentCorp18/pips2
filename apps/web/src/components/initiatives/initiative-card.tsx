'use client'

import Link from 'next/link'
import { Target, FolderKanban, Calendar } from 'lucide-react'
import type { InitiativeStatus } from '@/types/initiatives'
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
    owner: { id: string; display_name: string }
  }
}

const STATUS_STYLES: Record<InitiativeStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  active: { label: 'Active', className: 'bg-green-100 text-green-700' },
  on_hold: { label: 'On Hold', className: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', className: 'bg-blue-100 text-blue-700' },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-500' },
}

export const InitiativeCard = ({ initiative }: InitiativeCardProps) => {
  const statusStyle = STATUS_STYLES[initiative.status]

  return (
    <Link
      href={`/initiatives/${initiative.id}`}
      className="group block rounded-[var(--radius-lg)] border p-5 transition-shadow hover:shadow-md"
      style={{ borderColor: 'var(--color-border)' }}
      data-testid="initiative-card"
    >
      <div className="mb-3 flex items-start justify-between">
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
