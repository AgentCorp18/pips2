import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type ReportEmptyStateProps = {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  icon?: LucideIcon
  /** Optional secondary note rendered below the action button */
  note?: string
}

export const ReportEmptyState = ({
  title,
  description,
  actionLabel,
  actionHref,
  icon: Icon = BarChart3,
  note,
}: ReportEmptyStateProps) => {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--color-primary-subtle)' }}
        >
          <Icon size={26} style={{ color: 'var(--color-primary)' }} />
        </div>
        <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h3>
        <p
          className="mx-auto mt-2 max-w-sm text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {description}
        </p>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
            data-testid="report-empty-state-action"
          >
            {actionLabel}
          </Link>
        )}
        {note && (
          <p className="mt-3 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {note}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
