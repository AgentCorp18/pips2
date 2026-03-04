'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Clock, Lock, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TrainingProgressRing } from '@/components/training/training-progress-ring'
import { TrainingExercise } from '@/components/training/training-exercise'
import type {
  TrainingPathRow,
  TrainingModuleRow,
  TrainingProgressRow,
} from '@/app/(app)/training/actions'
import type {
  TrainingExerciseRow,
  TrainingExerciseDataRow,
} from '@/app/(app)/training/exercise-actions'
import { updateTrainingProgress } from '@/app/(app)/training/actions'

type ModuleDetailClientProps = {
  path: TrainingPathRow
  module: TrainingModuleRow
  exercises: TrainingExerciseRow[]
  exerciseData: TrainingExerciseDataRow[]
  moduleProgress: TrainingProgressRow | null
  prerequisitesMet: boolean
}

export const ModuleDetailClient = ({
  path,
  module,
  exercises,
  exerciseData,
  moduleProgress,
  prerequisitesMet,
}: ModuleDetailClientProps) => {
  const router = useRouter()
  const [started, setStarted] = useState(
    moduleProgress?.status === 'in_progress' || moduleProgress?.status === 'completed',
  )
  const isCompleted = moduleProgress?.status === 'completed'

  const completedExercises = exercises.filter((ex) =>
    exerciseData.some((d) => d.exercise_id === ex.id && d.status === 'completed'),
  ).length
  const progress = exercises.length > 0 ? completedExercises / exercises.length : 0

  const handleStart = async () => {
    await updateTrainingProgress(path.id, module.id, 'in_progress')
    setStarted(true)
  }

  if (!prerequisitesMet) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Breadcrumbs pathId={path.id} pathTitle={path.title} moduleTitle={module.title} />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Lock size={32} className="text-[var(--color-text-tertiary)]" />
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Module Locked
            </h2>
            <p className="max-w-md text-center text-sm text-[var(--color-text-secondary)]">
              Complete the prerequisite modules before starting this one.
            </p>
            <Link href={`/training/path/${path.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft size={14} />
                Back to Path
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Breadcrumbs pathId={path.id} pathTitle={path.title} moduleTitle={module.title} />

      {/* Module header */}
      <div className="flex items-start gap-4">
        <TrainingProgressRing progress={progress} size={56} strokeWidth={4} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{module.title}</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{module.description}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
            <span className="flex items-center gap-1">
              <Clock size={12} />~{module.estimated_minutes} min
            </span>
            <span>
              {completedExercises}/{exercises.length} exercises completed
            </span>
          </div>
        </div>
      </div>

      {/* Completion banner */}
      {isCompleted && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex items-center gap-3 py-4">
            <PartyPopper size={24} className="text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Module Complete!</p>
              <p className="text-xs text-emerald-700">
                You have finished all exercises in this module.
              </p>
            </div>
            <div className="ml-auto">
              <Link href={`/training/path/${path.id}`}>
                <Button size="sm" variant="outline" className="gap-2">
                  Back to Path
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start button for not-yet-started */}
      {!started && !isCompleted && (
        <Card>
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Ready to begin?
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Work through the exercises below at your own pace.
              </p>
            </div>
            <Button onClick={handleStart} size="sm">
              Start Module
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      {(started || isCompleted) && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Exercises</h2>
          {exercises.map((exercise, index) => {
            const data = exerciseData.find((d) => d.exercise_id === exercise.id)
            return (
              <TrainingExercise
                key={exercise.id}
                exercise={exercise}
                exerciseData={data}
                pathId={path.id}
                index={index}
              />
            )
          })}

          {exercises.length === 0 && (
            <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                No exercises available for this module yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Link href={`/training/path/${path.id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={14} />
            Back to {path.title}
          </Button>
        </Link>
        {isCompleted && (
          <Button
            size="sm"
            onClick={() => router.push(`/training/path/${path.id}`)}
            className="gap-2"
          >
            <CheckCircle2 size={14} />
            Continue Path
          </Button>
        )}
      </div>
    </div>
  )
}

const Breadcrumbs = ({
  pathId,
  pathTitle,
  moduleTitle,
}: {
  pathId: string
  pathTitle: string
  moduleTitle: string
}) => (
  <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
    <Link href="/training" className="hover:text-[var(--color-primary)]">
      Training
    </Link>
    <span>/</span>
    <Link href={`/training/path/${pathId}`} className="hover:text-[var(--color-primary)]">
      {pathTitle}
    </Link>
    <span>/</span>
    <span className="text-[var(--color-text-secondary)]">{moduleTitle}</span>
  </nav>
)
