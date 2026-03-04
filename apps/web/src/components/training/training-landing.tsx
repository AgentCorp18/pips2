'use client'

import Link from 'next/link'
import {
  GraduationCap,
  Clock,
  Users as UsersIcon,
  BarChart3,
  ArrowRight,
  Circle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrainingProgressRing } from './training-progress-ring'
import type { TrainingPathRow, TrainingProgressRow } from '@/app/(app)/training/actions'

const DEFAULT_PATHS: TrainingPathRow[] = [
  {
    id: 'quick-start',
    title: 'Quick Start',
    description:
      'Get up and running with PIPS in under an hour. Learn the 6-step framework, key principles, and try your first problem statement.',
    estimated_hours: 1,
    target_audience: 'First-time users',
    sort_order: 0,
    is_active: true,
  },
  {
    id: 'pips-fundamentals',
    title: 'PIPS Fundamentals',
    description:
      'A comprehensive walkthrough of all 6 PIPS steps with guided exercises. Build real skills with each methodology tool.',
    estimated_hours: 5,
    target_audience: 'New team members',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'facilitator-cert',
    title: 'Facilitator Certification',
    description:
      'Master the art of PIPS facilitation. Learn advanced techniques for guiding teams, managing resistance, and running effective workshops.',
    estimated_hours: 9,
    target_audience: 'Managers, facilitators',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'tool-mastery',
    title: 'Tool Mastery',
    description:
      'Deep dives into individual PIPS tools — fishbone diagrams, criteria matrices, RACI charts, and more. Take them in any order.',
    estimated_hours: 0.5,
    target_audience: 'Anyone',
    sort_order: 3,
    is_active: true,
  },
]

type TrainingLandingProps = {
  paths: TrainingPathRow[]
  progress: TrainingProgressRow[]
}

export const TrainingLanding = ({ paths, progress }: TrainingLandingProps) => {
  // Use DB paths if available, otherwise show defaults
  const displayPaths = paths.length > 0 ? paths : DEFAULT_PATHS

  // Calculate overall completion stats
  const totalModules = progress.length
  const completedModules = progress.filter((p) => p.status === 'completed').length
  const inProgressModules = progress.filter((p) => p.status === 'in_progress').length
  const totalTimeSpent = progress.reduce((acc, p) => acc + p.time_spent_minutes, 0)

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
      {totalModules > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <TrainingProgressRing
                progress={totalModules > 0 ? completedModules / totalModules : 0}
                size={40}
              />
              <div>
                <p className="text-lg font-bold text-[var(--color-text-primary)]">
                  {completedModules}/{totalModules}
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
        {displayPaths.map((path) => {
          const pathProgress = progress.filter((p) => p.path_id === path.id)
          const pathCompleted = pathProgress.filter((p) => p.status === 'completed').length
          const pathTotal = pathProgress.length
          const isStarted = pathTotal > 0

          return (
            <Link key={path.id} href={`/training/path/${path.id}`}>
              <Card className="group cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-md">
                <CardContent className="flex items-center gap-4 py-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                    <GraduationCap size={24} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {path.title}
                      </h3>
                      {isStarted && (
                        <Badge
                          variant={pathCompleted === pathTotal ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {pathCompleted === pathTotal ? 'Completed' : 'In Progress'}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-text-secondary)]">
                      {path.description}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {path.estimated_hours < 1
                          ? `${Math.round(path.estimated_hours * 60)} min each`
                          : `${path.estimated_hours} hours`}
                      </span>
                      <span className="flex items-center gap-1">
                        <UsersIcon size={11} />
                        {path.target_audience}
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                  />
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Practice Scenarios Quick Link */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Practice Scenarios
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Work through real-world case studies in a sandboxed environment
            </p>
          </div>
          <Link href="/training/practice">
            <Button variant="outline" size="sm" className="gap-2">
              Start Practice <ArrowRight size={14} />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
