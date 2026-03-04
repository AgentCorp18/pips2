import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TrainingProgressRing } from '@/components/training/training-progress-ring'
import { TrainingModuleCard } from '@/components/training/training-module-card'
import { getTrainingPath, getTrainingModules, getUserTrainingProgress } from '../../actions'

type PathPageProps = {
  params: Promise<{ pathSlug: string }>
}

const PathPage = async ({ params }: PathPageProps) => {
  const { pathSlug } = await params
  const path = await getTrainingPath(pathSlug)

  if (!path) {
    notFound()
  }

  const [modules, progress] = await Promise.all([
    getTrainingModules(path.id),
    getUserTrainingProgress(),
  ])

  const pathProgress = progress.filter((p) => p.path_id === path.id)
  const completedModuleIds = new Set(
    pathProgress.filter((p) => p.status === 'completed').map((p) => p.module_id),
  )
  const completedCount = completedModuleIds.size
  const totalCount = modules.length
  const overallProgress = totalCount > 0 ? completedCount / totalCount : 0

  // Find the first incomplete module for the "Continue" button
  const nextModule = modules.find((m) => !completedModuleIds.has(m.id))

  // Build a map of module statuses
  const statusMap = new Map(pathProgress.map((p) => [p.module_id, p.status]))

  // Determine which modules are locked (prerequisites not completed)
  const isModuleLocked = (prerequisites: string[]): boolean => {
    if (prerequisites.length === 0) return false
    return prerequisites.some((prereqId) => !completedModuleIds.has(prereqId))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/training" className="hover:text-[var(--color-primary)]">
          Training
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">{path.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-4">
        <TrainingProgressRing progress={overallProgress} size={56} strokeWidth={4} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{path.title}</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{path.description}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {path.estimated_hours} hours
            </span>
            <span>
              {completedCount}/{totalCount} modules completed
            </span>
          </div>
        </div>
        {nextModule && (
          <Link href={`/training/path/${path.id}/${nextModule.id}`}>
            <Button size="sm" className="shrink-0">
              {completedCount > 0 ? 'Continue' : 'Start'}
            </Button>
          </Link>
        )}
      </div>

      {/* Modules */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Modules</h2>
        {modules.map((module, index) => {
          const status = (statusMap.get(module.id) ?? 'not_started') as
            | 'not_started'
            | 'in_progress'
            | 'completed'
          const locked = isModuleLocked(module.prerequisites)

          return (
            <TrainingModuleCard
              key={module.id}
              module={module}
              index={index}
              status={status}
              isLocked={locked}
              pathId={path.id}
            />
          )
        })}

        {modules.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              No modules available yet for this learning path.
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              Modules will be added as content is compiled and seeded.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PathPage
