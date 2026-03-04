'use client'

import Link from 'next/link'
import {
  GraduationCap,
  Clock,
  Users as UsersIcon,
  BarChart3,
  ArrowRight,
  Circle,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrainingProgressRing } from './training-progress-ring'
import type {
  TrainingPathRow,
  TrainingProgressRow,
  PathModuleCounts,
} from '@/app/(app)/training/actions'

type TrainingLandingProps = {
  paths: TrainingPathRow[]
  progress: TrainingProgressRow[]
  moduleCounts: PathModuleCounts
}

export const TrainingLanding = ({ paths, progress, moduleCounts }: TrainingLandingProps) => {
  const completedModules = progress.filter((p) => p.status === 'completed').length
  const inProgressModules = progress.filter((p) => p.status === 'in_progress').length
  const totalTimeSpent = progress.reduce((acc, p) => acc + p.time_spent_minutes, 0)
  const totalModulesAcrossAllPaths = Object.values(moduleCounts).reduce((a, b) => a + b, 0)
  const hasProgress = progress.length > 0

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Training</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Structured learning paths to master the PIPS methodology
          </p>
        </div>
        <Link href="/training/progress">
          <Button variant="outline" size="sm" className="gap-2">
            <BarChart3 size={14} />
            My Progress
          </Button>
        </Link>
      </div>

      {/* Stats row (only if user has progress) */}
      {hasProgress && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <TrainingProgressRing
                progress={
                  totalModulesAcrossAllPaths > 0 ? completedModules / totalModulesAcrossAllPaths : 0
                }
                size={40}
              />
              <div>
                <p className="text-lg font-bold text-[var(--color-text-primary)]">
                  {completedModules}/{totalModulesAcrossAllPaths}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Modules completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                <Circle size={16} className="text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--color-text-primary)]">
                  {inProgressModules}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">In progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                <Clock size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--color-text-primary)]">
                  {Math.round((totalTimeSpent / 60) * 10) / 10}h
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Time spent</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Learning Paths */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Learning Paths</h2>
        {paths.map((path) => {
          const pathProgress = progress.filter((p) => p.path_id === path.id)
          const pathCompleted = pathProgress.filter((p) => p.status === 'completed').length
          const pathModuleCount = moduleCounts[path.id] ?? 0
          const pathPct =
            pathModuleCount > 0 ? Math.round((pathCompleted / pathModuleCount) * 100) : 0
          const isStarted = pathProgress.length > 0
          const isComplete = pathModuleCount > 0 && pathCompleted === pathModuleCount

          return (
            <Card
              key={path.id}
              className="group transition-all hover:border-[var(--color-primary)] hover:shadow-md"
            >
              <CardContent className="flex items-center gap-4 py-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                  <GraduationCap size={24} className="text-[var(--color-primary)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {path.title}
                  </h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-text-secondary)]">
                    {path.description}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} />
                      {pathModuleCount} {pathModuleCount === 1 ? 'module' : 'modules'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {path.estimated_hours < 1
                        ? `${Math.round(path.estimated_hours * 60)} min`
                        : `${path.estimated_hours} hours`}
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon size={11} />
                      {path.target_audience}
                    </span>
                    {isStarted && (
                      <span className="font-medium text-[var(--color-primary)]">{pathPct}%</span>
                    )}
                  </div>
                  {/* Progress bar */}
                  {isStarted && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-secondary)]">
                      <div
                        className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                        style={{ width: `${pathPct}%` }}
                      />
                    </div>
                  )}
                </div>
                <Link href={`/training/path/${path.id}`}>
                  <Button
                    size="sm"
                    variant={isComplete ? 'outline' : isStarted ? 'default' : 'default'}
                    className="shrink-0 gap-1.5"
                  >
                    {isComplete ? 'Review' : isStarted ? 'Continue' : 'Start'}
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}

        {paths.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
            <GraduationCap size={32} className="mx-auto text-[var(--color-text-tertiary)]" />
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              No training paths available yet
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              Training paths will appear once content is seeded
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
