import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'
import type { ProjectActivity } from './overview-actions'

type ActivityFeedProps = {
  activity: ProjectActivity[]
}

const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const ACTION_COLORS: Record<string, string> = {
  insert: 'bg-[var(--color-success)]',
  update: 'bg-[var(--color-primary)]',
  delete: 'bg-[var(--color-danger,#EF4444)]',
}

export const ActivityFeed = ({ activity }: ActivityFeedProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <Activity size={16} className="text-[var(--color-text-tertiary)]" />
        Recent Activity
      </CardTitle>
    </CardHeader>
    <CardContent>
      {activity.length === 0 ? (
        <p className="text-sm text-[var(--color-text-tertiary)]">No activity recorded yet.</p>
      ) : (
        <ul className="space-y-4">
          {activity.map((item, index) => (
            <li key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`h-2.5 w-2.5 shrink-0 rounded-full mt-1.5 ${ACTION_COLORS[item.action] ?? 'bg-[var(--color-text-tertiary)]'}`}
                />
                {index < activity.length - 1 && (
                  <div className="mt-1 w-px flex-1 bg-[var(--color-border)]" />
                )}
              </div>
              <div className="min-w-0 flex-1 pb-2">
                <p className="text-sm text-[var(--color-text-primary)]">{item.description}</p>
                <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
                  {item.userName && <span className="font-medium">{item.userName}</span>}
                  {item.userName && ' \u00B7 '}
                  {formatRelativeTime(item.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
)
