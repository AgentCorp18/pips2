import Link from 'next/link'
import { ArrowRight, BarChart3, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrainingProgressRing } from '@/components/training/training-progress-ring'
import { getUserTrainingProgress, getTrainingPaths, getAllModules } from '../actions'

const ProgressPage = async () => {
  const [progress, paths, allModules] = await Promise.all([
    getUserTrainingProgress(),
    getTrainingPaths(),
    getAllModules(),
  ])

  // Build module counts and first-incomplete-module per path
  const modulesByPath = new Map<string, typeof allModules>()
  for (const m of allModules) {
    const list = modulesByPath.get(m.path_id) ?? []
    list.push(m)
    modulesByPath.set(m.path_id, list)
  }

  const totalModuleCount = allModules.length
  const completedModules = progress.filter((p) => p.status === 'completed').length
  const totalTimeMinutes = progress.reduce((acc, p) => acc + p.time_spent_minutes, 0)
  const scoredProgress = progress.filter((p) => p.assessment_score !== null)
  const avgScore =
    scoredProgress.length > 0
      ? scoredProgress.reduce((acc, p) => acc + (p.assessment_score ?? 0), 0) /
        scoredProgress.length
      : 0

  const completedModuleIds = new Set(
    progress.filter((p) => p.status === 'completed').map((p) => p.module_id),
  )

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
              progress={totalModuleCount > 0 ? completedModules / totalModuleCount : 0}
              size={48}
              strokeWidth={4}
            />
            <p className="mt-2 text-lg font-bold text-[var(--color-text-primary)]">
              {completedModules}/{totalModuleCount}
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
            <div className="space-y-5">
              {paths.map((path) => {
                const pathModules = modulesByPath.get(path.id) ?? []
                const pathTotal = pathModules.length
                const pathCompleted = pathModules.filter((m) => completedModuleIds.has(m.id)).length
                const pct = pathTotal > 0 ? Math.round((pathCompleted / pathTotal) * 100) : 0

                // Find first incomplete module for "Continue" link
                const nextModule = pathModules.find((m) => !completedModuleIds.has(m.id))

                return (
                  <div key={path.id}>
                    <div className="flex items-center justify-between text-sm">
                      <Link
                        href={`/training/path/${path.id}`}
                        className="font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                      >
                        {path.title}
                      </Link>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[var(--color-text-tertiary)]">
                          {pathCompleted}/{pathTotal} ({pct}%)
                        </span>
                        {nextModule && (
                          <Link href={`/training/path/${path.id}/${nextModule.id}`}>
                            <Button variant="ghost" size="xs" className="gap-1">
                              Continue <ArrowRight size={12} />
                            </Button>
                          </Link>
                        )}
                      </div>
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

      {totalModuleCount === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
          <BarChart3 size={32} className="mx-auto text-[var(--color-text-tertiary)]" />
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            No training progress yet
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            Start a learning path to begin tracking your progress
          </p>
          <Link href="/training" className="mt-4 inline-block">
            <Button size="sm" className="gap-1.5">
              Browse Training Paths <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default ProgressPage
