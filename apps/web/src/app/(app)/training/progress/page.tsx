import Link from 'next/link'
import { BarChart3, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrainingProgressRing } from '@/components/training/training-progress-ring'
import { getUserTrainingProgress, getTrainingPaths } from '../actions'

const ProgressPage = async () => {
  const [progress, paths] = await Promise.all([getUserTrainingProgress(), getTrainingPaths()])

  const totalModules = progress.length
  const completedModules = progress.filter((p) => p.status === 'completed').length
  const totalTimeMinutes = progress.reduce((acc, p) => acc + p.time_spent_minutes, 0)
  const avgScore = progress
    .filter((p) => p.assessment_score !== null)
    .reduce((acc, p, _, arr) => acc + (p.assessment_score ?? 0) / arr.length, 0)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/training" className="hover:text-[var(--color-primary)]">
          Training
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">My Progress</span>
      </nav>

      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">My Progress</h1>

      {/* Overall Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="py-4 text-center">
            <TrainingProgressRing
              progress={totalModules > 0 ? completedModules / totalModules : 0}
              size={48}
              strokeWidth={4}
            />
            <p className="mt-2 text-lg font-bold text-[var(--color-text-primary)]">
              {completedModules}/{totalModules}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <Clock size={24} className="text-blue-500" />
            <p className="mt-2 text-lg font-bold text-[var(--color-text-primary)]">
              {Math.round((totalTimeMinutes / 60) * 10) / 10}h
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Total Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <TrendingUp size={24} className="text-emerald-500" />
            <p className="mt-2 text-lg font-bold text-[var(--color-text-primary)]">
              {avgScore > 0 ? `${Math.round(avgScore)}%` : '--'}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Avg Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <CheckCircle2 size={24} className="text-[var(--color-primary)]" />
            <p className="mt-2 text-lg font-bold text-[var(--color-text-primary)]">
              {progress.filter((p) => p.status === 'in_progress').length}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">In Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-path breakdown */}
      {paths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 size={16} className="text-[var(--color-text-tertiary)]" />
              Progress by Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paths.map((path) => {
                const pathProgress = progress.filter((p) => p.path_id === path.id)
                const pathCompleted = pathProgress.filter((p) => p.status === 'completed').length
                const pathTotal = pathProgress.length
                const pct = pathTotal > 0 ? Math.round((pathCompleted / pathTotal) * 100) : 0

                return (
                  <div key={path.id}>
                    <div className="flex items-center justify-between text-sm">
                      <Link
                        href={`/training/path/${path.id}`}
                        className="font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                      >
                        {path.title}
                      </Link>
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        {pathCompleted}/{pathTotal} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--color-surface-secondary)]">
                      <div
                        className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {totalModules === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
          <BarChart3 size={32} className="mx-auto text-[var(--color-text-tertiary)]" />
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            No training progress yet
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            Start a learning path to begin tracking your progress
          </p>
        </div>
      )}
    </div>
  )
}

export default ProgressPage
