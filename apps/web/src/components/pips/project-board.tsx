import Link from 'next/link'
import { PIPS_STEPS } from '@pips/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Calendar } from 'lucide-react'
import { FormattedDate } from '@/components/ui/formatted-date'

/* ============================================================
   Types
   ============================================================ */

export type BoardProject = {
  id: string
  name: string
  description: string | null
  status: string
  currentStep: number
  stepsCompleted: number
  ownerName: string
  targetDate: string | null
}

type ProjectBoardProps = {
  projects: BoardProject[]
}

/* ============================================================
   Column Config
   ============================================================ */

const BOARD_COLUMNS = [
  { id: 'active', label: 'Active', color: '#3B82F6' },
  { id: 'on_hold', label: 'On Hold', color: '#F59E0B' },
  { id: 'completed', label: 'Completed', color: '#10B981' },
  { id: 'cancelled', label: 'Cancelled', color: 'var(--color-text-tertiary)' },
] as const

/* ============================================================
   Component
   ============================================================ */

export const ProjectBoard = ({ projects }: ProjectBoardProps) => {
  const grouped: Record<string, BoardProject[]> = {
    active: [],
    on_hold: [],
    completed: [],
    cancelled: [],
  }

  for (const project of projects) {
    const key = project.status in grouped ? project.status : 'active'
    const column = grouped[key]
    if (column) {
      column.push(project)
    }
  }

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-4"
      data-testid="project-board"
      role="region"
      aria-label="Project board by status"
    >
      {BOARD_COLUMNS.map((col) => {
        const columnProjects = grouped[col.id] ?? []

        return (
          <div
            key={col.id}
            className="flex w-[300px] flex-shrink-0 flex-col"
            role="group"
            data-testid={`project-board-column-${col.id}`}
            aria-label={`${col.label} column, ${columnProjects.length} project${columnProjects.length !== 1 ? 's' : ''}`}
          >
            {/* Column header */}
            <div className="mb-3 flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: col.color }}
                aria-hidden="true"
              />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {col.label}
              </h3>
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)',
                }}
                data-testid={`project-board-count-${col.id}`}
              >
                {columnProjects.length}
              </span>
            </div>

            {/* Cards area */}
            <div
              className="flex min-h-[120px] flex-1 flex-col gap-2 rounded-[var(--radius-lg)] p-2"
              style={{ backgroundColor: 'var(--color-bg-secondary, #F9FAFB)' }}
            >
              {columnProjects.map((project) => (
                <ProjectBoardCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ============================================================
   Board Card
   ============================================================ */

const ProjectBoardCard = ({ project }: { project: BoardProject }) => {
  const currentPipsStep = PIPS_STEPS.find((s) => s.number === project.currentStep)

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <Card className="transition-all hover:shadow-[var(--shadow-medium)] group-hover:border-[var(--color-primary-light)]">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm leading-snug group-hover:text-[var(--color-primary)]">
            {project.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-0">
          {/* Current step */}
          {currentPipsStep && (
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: `var(--color-step-${project.currentStep})` }}
              />
              <span className="text-xs text-[var(--color-text-secondary)]">
                Step {project.currentStep}: {currentPipsStep.name}
              </span>
            </div>
          )}

          {/* Progress bar */}
          <div className="flex gap-0.5">
            {PIPS_STEPS.map((step) => {
              const isComplete = step.number <= project.stepsCompleted
              return (
                <div
                  key={step.number}
                  className="h-1 flex-1 rounded-full"
                  style={{
                    backgroundColor: isComplete
                      ? `var(--color-step-${step.number})`
                      : 'var(--color-border)',
                  }}
                />
              )
            })}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
            <span className="flex items-center gap-1">
              <User size={10} />
              {project.ownerName}
            </span>
            {project.targetDate && (
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                <FormattedDate date={project.targetDate} />
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
