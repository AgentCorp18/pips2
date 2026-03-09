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
  layout?: 'columns' | 'swimlanes'
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
   Column View (original)
   ============================================================ */

const ColumnView = ({ projects }: { projects: BoardProject[] }) => {
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
            className="flex min-w-[250px] flex-1 flex-col"
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
   Swim Lane View (rows=steps, cols=status)
   ============================================================ */

const SwimLaneView = ({ projects }: { projects: BoardProject[] }) => {
  // Build a 2D grid: step (row) x status (column)
  const grid: Record<number, Record<string, BoardProject[]>> = {}
  for (const step of PIPS_STEPS) {
    grid[step.number] = { active: [], on_hold: [], completed: [], cancelled: [] }
  }

  for (const project of projects) {
    const stepNum = Math.max(1, Math.min(6, project.currentStep || 1))
    const status = project.status in (grid[stepNum] ?? {}) ? project.status : 'active'
    grid[stepNum]?.[status]?.push(project)
  }

  return (
    <div
      className="overflow-x-auto pb-4"
      data-testid="project-board"
      role="region"
      aria-label="Project board by step and status"
    >
      {/* Column headers */}
      <div className="mb-2 grid grid-cols-[140px_repeat(4,1fr)] gap-2">
        <div /> {/* Spacer for row labels */}
        {BOARD_COLUMNS.map((col) => (
          <div key={col.id} className="flex items-center gap-2 px-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: col.color }}
            />
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {col.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step rows */}
      {PIPS_STEPS.map((step) => {
        const rowProjects = grid[step.number] ?? {}
        const rowTotal = Object.values(rowProjects).reduce((sum, arr) => sum + arr.length, 0)

        return (
          <div
            key={step.number}
            className="mb-2 grid grid-cols-[140px_repeat(4,1fr)] gap-2"
            data-testid={`swimlane-row-${step.number}`}
          >
            {/* Row label */}
            <div
              className="flex items-start gap-2 rounded-lg p-2"
              style={{ borderLeft: `3px solid ${step.color}` }}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: step.color }}
              >
                {step.number}
              </span>
              <div className="min-w-0">
                <p
                  className="truncate text-xs font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {step.name}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                  {rowTotal} project{rowTotal !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Status cells */}
            {BOARD_COLUMNS.map((col) => {
              const cellProjects = rowProjects[col.id] ?? []

              return (
                <div
                  key={col.id}
                  className="min-h-[60px] rounded-lg p-1.5"
                  style={{ backgroundColor: 'var(--color-bg-secondary, #F9FAFB)' }}
                  data-testid={`swimlane-cell-${step.number}-${col.id}`}
                >
                  <div className="flex flex-col gap-1.5">
                    {cellProjects.map((project) => (
                      <ProjectBoardCard key={project.id} project={project} compact />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

/* ============================================================
   Main Component
   ============================================================ */

export const ProjectBoard = ({ projects, layout = 'columns' }: ProjectBoardProps) => {
  if (layout === 'swimlanes') {
    return <SwimLaneView projects={projects} />
  }
  return <ColumnView projects={projects} />
}

/* ============================================================
   Board Card
   ============================================================ */

const ProjectBoardCard = ({ project, compact }: { project: BoardProject; compact?: boolean }) => {
  const currentPipsStep = PIPS_STEPS.find((s) => s.number === project.currentStep)

  if (compact) {
    return (
      <Link href={`/projects/${project.id}`} className="group block">
        <Card className="transition-all hover:shadow-[var(--shadow-low)] group-hover:border-[var(--color-primary-light)]">
          <CardContent className="space-y-1 p-2">
            <p className="text-xs font-medium leading-snug group-hover:text-[var(--color-primary)]">
              {project.name}
            </p>
            <div className="flex gap-0.5">
              {PIPS_STEPS.map((step) => (
                <div
                  key={step.number}
                  className="h-0.5 flex-1 rounded-full"
                  style={{
                    backgroundColor:
                      step.number <= project.stepsCompleted
                        ? `var(--color-step-${step.number})`
                        : 'var(--color-border)',
                  }}
                />
              ))}
            </div>
            <p className="text-[10px] text-[var(--color-text-tertiary)]">{project.ownerName}</p>
          </CardContent>
        </Card>
      </Link>
    )
  }

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
