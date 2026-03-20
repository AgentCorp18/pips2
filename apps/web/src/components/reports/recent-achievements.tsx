import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, ChevronRight, Calendar } from 'lucide-react'
import type { RecentAchievement } from '@/app/(app)/reports/actions'

/* ============================================================
   Helpers
   ============================================================ */

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const depthConfig = (pct: number): { color: string; bg: string; label: string } => {
  if (pct >= 70) return { color: '#22C55E', bg: '#22C55E18', label: 'Strong' }
  if (pct >= 40) return { color: '#F59E0B', bg: '#F59E0B18', label: 'Good' }
  return { color: '#6366F1', bg: '#6366F118', label: 'Light' }
}

/* ============================================================
   Component
   ============================================================ */

type RecentAchievementsProps = {
  achievements: RecentAchievement[]
}

export const RecentAchievements = ({ achievements }: RecentAchievementsProps) => {
  if (achievements.length === 0) {
    return (
      <Card data-testid="recent-achievements-card">
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2 text-base font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Trophy size={16} style={{ color: '#F59E0B' }} />
            Recent Achievements
          </CardTitle>
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Projects completed in the last 30 days
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            No projects completed in the last 30 days. Complete a project to see it here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-testid="recent-achievements-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle
              className="flex items-center gap-2 text-base font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <Trophy size={16} style={{ color: '#F59E0B' }} aria-hidden="true" />
              Recent Achievements
            </CardTitle>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {achievements.length} project{achievements.length !== 1 ? 's' : ''} completed in the
              last 30 days
            </p>
          </div>
          <Link
            href="/reports/portfolio-value"
            className="text-xs font-medium transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-primary)' }}
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul
          className="divide-y"
          style={{ borderColor: 'var(--color-border)' }}
          aria-label="Recent completed projects"
        >
          {achievements.map((achievement) => {
            const depth = depthConfig(achievement.methodologyDepthPercent)
            return (
              <li key={achievement.id}>
                <Link
                  href={`/projects/${achievement.id}`}
                  className="group flex items-start gap-3 px-6 py-4 transition-colors hover:bg-[var(--color-surface-secondary)]"
                  data-testid={`achievement-item-${achievement.id}`}
                >
                  {/* Depth badge */}
                  <div
                    className="mt-0.5 flex shrink-0 flex-col items-center rounded-[var(--radius-md)] px-2.5 py-1.5"
                    style={{ backgroundColor: depth.bg }}
                    title={`Methodology depth: ${achievement.methodologyDepthPercent}% — Methodology depth shows what percentage of the 25 PIPS tools have been used for this project. Higher depth = more rigorous analysis.`}
                  >
                    <span className="text-sm font-bold leading-none" style={{ color: depth.color }}>
                      {achievement.methodologyDepthPercent}%
                    </span>
                    <span
                      className="mt-0.5 text-center text-[10px] leading-none"
                      style={{ color: depth.color }}
                    >
                      depth
                    </span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span
                        className="truncate text-sm font-semibold leading-snug group-hover:underline"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {achievement.title}
                      </span>
                      <ChevronRight
                        size={12}
                        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ color: 'var(--color-text-tertiary)' }}
                        aria-hidden="true"
                      />
                    </div>

                    {/* Narrative snippet */}
                    {achievement.narrativeSnippet && (
                      <p
                        className="mt-0.5 line-clamp-1 text-xs leading-relaxed"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {achievement.narrativeSnippet}
                        {achievement.narrativeSnippet.length >= 100 ? '…' : ''}
                      </p>
                    )}

                    {/* Date */}
                    <div
                      className="mt-1 flex items-center gap-1"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      <Calendar size={10} aria-hidden="true" />
                      <span className="text-xs">
                        Completed {formatDate(achievement.completedAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
