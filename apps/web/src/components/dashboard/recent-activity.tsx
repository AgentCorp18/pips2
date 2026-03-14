import Link from 'next/link'
import { PlusCircle, Pencil, Trash2, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RelativeTime } from '@/components/ui/relative-time'
import type { ActivityItem } from '@/app/(app)/dashboard/actions'

type RecentActivityProps = {
  items: ActivityItem[]
}

const ACTION_ICONS: Record<string, typeof Activity> = {
  insert: PlusCircle,
  update: Pencil,
  delete: Trash2,
}

const ACTION_COLORS: Record<string, string> = {
  insert: 'var(--color-step-3)',
  update: 'var(--color-step-1)',
  delete: 'var(--color-signal-red)',
}

export const RecentActivity = ({ items }: RecentActivityProps) => {
  const hasItems = items.length > 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Recent Activity
        </CardTitle>
        {hasItems && (
          <Link
            href="/tickets"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            View all
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {!hasItems ? (
          <div
            className="flex h-32 items-center justify-center text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No recent activity. Actions like creating tickets and updating projects will appear
            here.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const Icon = ACTION_ICONS[item.action] ?? Activity
              const iconColor = ACTION_COLORS[item.action] ?? 'var(--color-text-secondary)'

              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `color-mix(in srgb, ${iconColor} 12%, transparent)` }}
                  >
                    <Icon size={14} style={{ color: iconColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {item.description}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      <RelativeTime date={item.createdAt} />
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
