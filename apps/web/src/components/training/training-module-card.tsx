import Link from 'next/link'
import { ArrowRight, CheckCircle2, Circle, Clock, Lock, PlayCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TrainingModuleRow } from '@/app/(app)/training/actions'

type ModuleStatus = 'not_started' | 'in_progress' | 'completed'

type TrainingModuleCardProps = {
  module: TrainingModuleRow
  index: number
  status: ModuleStatus
  isLocked: boolean
  pathId: string
}

export const TrainingModuleCard = ({
  module,
  index,
  status,
  isLocked,
  pathId,
}: TrainingModuleCardProps) => {
  const isCompleted = status === 'completed'
  const isInProgress = status === 'in_progress'

  const cardContent = (
    <Card
      className={`group transition-all ${
        isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-sm'
      } ${isCompleted ? 'border-[var(--color-success)]/30' : ''}`}
    >
      <CardContent className="flex items-center gap-4 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center">
          {isLocked ? (
            <Lock size={18} className="text-[var(--color-text-tertiary)]" />
          ) : isCompleted ? (
            <CheckCircle2 size={20} className="text-[var(--color-success)]" />
          ) : isInProgress ? (
            <PlayCircle size={20} className="text-[var(--color-primary)]" />
          ) : (
            <Circle size={20} className="text-[var(--color-text-tertiary)]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[var(--color-text-tertiary)]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">{module.title}</h3>
            {isInProgress && (
              <Badge variant="secondary" className="text-[10px]">
                In Progress
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="default" className="bg-emerald-600 text-[10px]">
                Complete
              </Badge>
            )}
            {isLocked && (
              <Badge variant="outline" className="text-[10px]">
                Locked
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{module.description}</p>
        </div>
        <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
          <Clock size={11} />
          {module.estimated_minutes} min
        </span>
        {!isLocked && <ArrowRight size={14} className="text-[var(--color-text-tertiary)]" />}
      </CardContent>
    </Card>
  )

  if (isLocked) {
    return <div title="Complete prerequisite modules to unlock">{cardContent}</div>
  }

  return <Link href={`/training/path/${pathId}/${module.id}`}>{cardContent}</Link>
}
