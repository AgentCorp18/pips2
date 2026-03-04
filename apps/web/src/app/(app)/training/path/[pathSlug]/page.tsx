import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Circle, Clock, PlayCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrainingProgressRing } from '@/components/training/training-progress-ring'
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
  const completedCount = pathProgress.filter((p) => p.status === 'completed').length
  const totalCount = modules.length
  const overallProgress = totalCount > 0 ? completedCount / totalCount : 0

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
      </div>

      {/* Modules */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Modules</h2>
        {modules.map((module, index) => {
          const moduleProgress = pathProgress.find((p) => p.module_id === module.id)
          const status = moduleProgress?.status ?? 'not_started'
          const isCompleted = status === 'completed'
          const isInProgress = status === 'in_progress'

          return (
            <Link key={module.id} href={`/training/path/${path.id}/${module.id}`}>
              <Card
                className={`group cursor-pointer transition-all hover:shadow-sm ${isCompleted ? 'border-[var(--color-success)]/30' : ''}`}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    {isCompleted ? (
                      <CheckCircle2 size={20} className="text-[var(--color-success)]" />
                    ) : isInProgress ? (
                      <PlayCircle size={20} className="text-[var(--color-primary)]" />
                    ) : (
                      <Circle size={20} className="text-[var(--color-text-tertiary)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[var(--color-text-tertiary)]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                        {module.title}
                      </h3>
                      {isInProgress && (
                        <Badge variant="secondary" className="text-[10px]">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
                      {module.description}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                    <Clock size={11} />
                    {module.estimated_minutes} min
                  </span>
                  <ArrowRight size={14} className="text-[var(--color-text-tertiary)]" />
                </CardContent>
              </Card>
            </Link>
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
