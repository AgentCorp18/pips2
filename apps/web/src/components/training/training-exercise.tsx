'use client'

import Link from 'next/link'
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  ListChecks,
  MessageSquare,
  PlayCircle,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrainingMultipleChoice } from './training-multiple-choice'
import { TrainingReflection } from './training-reflection'
import type {
  TrainingExerciseRow,
  TrainingExerciseDataRow,
} from '@/app/(app)/training/exercise-actions'
import { completeExercise, completeModule } from '@/app/(app)/training/exercise-actions'

type TrainingExerciseProps = {
  exercise: TrainingExerciseRow
  exerciseData?: TrainingExerciseDataRow
  pathId: string
  index: number
}

const typeIcons = {
  'multiple-choice': ListChecks,
  'fill-form': FileText,
  reflection: MessageSquare,
  'scenario-practice': PlayCircle,
}

const typeLabels = {
  'multiple-choice': 'Quiz',
  'fill-form': 'Form Practice',
  reflection: 'Reflection',
  'scenario-practice': 'Practice Scenario',
}

export const TrainingExercise = ({
  exercise,
  exerciseData,
  pathId,
  index,
}: TrainingExerciseProps) => {
  const isCompleted = exerciseData?.status === 'completed'
  const Icon = typeIcons[exercise.type]

  const handleMultipleChoiceComplete = async (selectedIndex: number, isCorrect: boolean) => {
    await completeExercise(exercise.id, { selectedIndex, isCorrect }, isCorrect ? 100 : 0)
    await completeModule(pathId, exercise.module_id)
  }

  const handleReflectionComplete = async (text: string) => {
    await completeExercise(exercise.id, { text }, 100)
    await completeModule(pathId, exercise.module_id)
  }

  const handleFillFormVisited = async () => {
    await completeExercise(exercise.id, { visited: true }, 100)
    await completeModule(pathId, exercise.module_id)
  }

  const handleScenarioVisited = async () => {
    await completeExercise(exercise.id, { visited: true }, 100)
    await completeModule(pathId, exercise.module_id)
  }

  return (
    <Card data-testid={`exercise-${index}`} className={isCompleted ? 'border-emerald-200' : ''}>
      <CardContent className="space-y-4 py-4">
        {/* Exercise header */}
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center" aria-hidden="true">
            {isCompleted ? (
              <CheckCircle2 size={20} className="text-emerald-600" />
            ) : (
              <Circle size={20} className="text-[var(--color-text-tertiary)]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[var(--color-text-tertiary)]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                {exercise.title}
              </h4>
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Icon size={10} />
                {typeLabels[exercise.type]}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              {exercise.instructions}
            </p>
            <span className="mt-1 flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]">
              <Clock size={10} />~{exercise.expected_minutes} min
            </span>
          </div>
        </div>

        {/* Exercise body */}
        <div className="ml-11">
          {exercise.type === 'multiple-choice' && (
            <TrainingMultipleChoice
              exerciseId={exercise.id}
              config={(() => {
                const { correctIndex: _ci, ...safeConfig } = exercise.config as {
                  question: string
                  options: string[]
                  correctIndex?: number
                }
                return safeConfig
              })()}
              savedAnswer={
                exerciseData?.status === 'completed'
                  ? ((exerciseData.data as { selectedIndex?: number }).selectedIndex ?? null)
                  : null
              }
              onComplete={handleMultipleChoiceComplete}
            />
          )}

          {exercise.type === 'reflection' && (
            <TrainingReflection
              config={exercise.config as { prompt: string; minWords?: number }}
              savedText={
                exerciseData?.status === 'completed'
                  ? (exerciseData.data as { text?: string }).text
                  : undefined
              }
              onComplete={handleReflectionComplete}
            />
          )}

          {exercise.type === 'fill-form' && (
            <div className="flex items-center gap-3">
              <Link
                href={`/training/practice/form?type=${exercise.form_type ?? 'problem_statement'}`}
                onClick={handleFillFormVisited}
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText size={14} />
                  Open Form
                  <ExternalLink size={12} />
                </Button>
              </Link>
              {isCompleted && <span className="text-xs text-emerald-600">Completed</span>}
            </div>
          )}

          {exercise.type === 'scenario-practice' && (
            <div className="flex items-center gap-3">
              <Link
                href={`/training/practice/${(exercise.config as { scenarioSlug?: string }).scenarioSlug ?? exercise.scenario_id ?? ''}`}
                onClick={handleScenarioVisited}
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <PlayCircle size={14} />
                  Start Scenario
                  <ExternalLink size={12} />
                </Button>
              </Link>
              {isCompleted && <span className="text-xs text-emerald-600">Completed</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
