'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PIPS_STEPS } from '@pips/shared'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormattedDate } from '@/components/ui/formatted-date'
import { SortableHeader } from '@/components/ui/sortable-header'
import { useSortable } from '@/hooks/use-sortable'
import { ChevronDown, Maximize2, Minimize2 } from 'lucide-react'

/* ============================================================
   Types
   ============================================================ */

export type ProjectRow = {
  id: string
  name: string
  status: string
  currentStep: number
  stepsCompleted: number
  ownerName: string
  targetDate: string | null
  createdAt: string
}

type ProjectListTableProps = {
  projects: ProjectRow[]
}

/* ============================================================
   Helpers
   ============================================================ */

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  active: { label: 'Active', variant: 'default' },
  completed: { label: 'Completed', variant: 'outline' },
  on_hold: { label: 'On Hold', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

/* ============================================================
   Component
   ============================================================ */

export const ProjectListTable = ({ projects }: ProjectListTableProps) => {
  const router = useRouter()
  const { sortedData, sortKey, sortDirection, handleSort } = useSortable(projects)
  const [isFullScreen, setIsFullScreen] = useState(false)

  return (
    <div
      className={
        isFullScreen
          ? 'fixed inset-0 z-50 flex flex-col overflow-auto bg-[var(--color-bg)] p-4'
          : ''
      }
      data-testid="project-list-table"
    >
      <div className="mb-2 flex items-center justify-end">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsFullScreen(!isFullScreen)}
          aria-label={isFullScreen ? 'Exit full screen' : 'Full screen'}
          data-testid="project-table-fullscreen-toggle"
        >
          {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader
                label="Name"
                sortKey="name"
                currentSort={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Status"
                sortKey="status"
                currentSort={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Current Step"
                sortKey="currentStep"
                currentSort={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
                className="hidden sm:table-cell"
              />
              <SortableHeader
                label="Steps Completed"
                sortKey="stepsCompleted"
                currentSort={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
                className="hidden md:table-cell"
              />
              <SortableHeader
                label="Owner"
                sortKey="ownerName"
                currentSort={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
                className="hidden sm:table-cell"
              />
              <SortableHeader
                label="Target Date"
                sortKey="targetDate"
                currentSort={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
                className="hidden lg:table-cell"
              />
              <SortableHeader
                label="Created"
                sortKey="createdAt"
                currentSort={sortKey}
                currentDirection={sortDirection}
                onSort={handleSort}
                className="hidden lg:table-cell"
              />
              {/* Mobile expand column */}
              <TableHead className="sm:hidden w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((project) => (
              <ProjectTableRow
                key={project.id}
                project={project}
                onClick={() => router.push(`/projects/${project.id}`)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* ============================================================
   ProjectTableRow — expandable on mobile
   ============================================================ */

const ProjectTableRow = ({ project, onClick }: { project: ProjectRow; onClick: () => void }) => {
  const [expanded, setExpanded] = useState(false)
  const fallback = { label: 'Active', variant: 'default' as const }
  const statusConfig = STATUS_CONFIG[project.status] ?? fallback
  const currentPipsStep = PIPS_STEPS.find((s) => s.number === project.currentStep)

  return (
    <>
      <TableRow
        className="cursor-pointer"
        onClick={onClick}
        data-testid={`project-row-${project.id}`}
      >
        <TableCell className="font-medium">{project.name}</TableCell>
        <TableCell>
          <Badge variant={statusConfig.variant} className="text-xs">
            {statusConfig.label}
          </Badge>
        </TableCell>
        <TableCell className="hidden sm:table-cell">
          {currentPipsStep && (
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: `var(--color-step-${project.currentStep})` }}
              />
              <span className="text-sm">
                Step {project.currentStep}: {currentPipsStep.name}
              </span>
            </div>
          )}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <span className="text-sm">{project.stepsCompleted}/6</span>
        </TableCell>
        <TableCell className="hidden sm:table-cell">
          <span className="text-sm">{project.ownerName}</span>
        </TableCell>
        <TableCell className="hidden lg:table-cell">
          {project.targetDate ? (
            <span className="text-sm">
              <FormattedDate date={project.targetDate} />
            </span>
          ) : (
            <span className="text-sm text-[var(--color-text-tertiary)]">-</span>
          )}
        </TableCell>
        <TableCell className="hidden lg:table-cell text-sm text-[var(--color-text-tertiary)]">
          <FormattedDate date={project.createdAt} />
        </TableCell>
        {/* Mobile expand toggle */}
        <TableCell
          className="sm:hidden w-8"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
        >
          <ChevronDown
            size={16}
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            style={{ color: 'var(--color-text-tertiary)' }}
          />
        </TableCell>
      </TableRow>

      {/* Mobile detail row */}
      {expanded && (
        <TableRow className="sm:hidden" data-testid={`project-row-detail-${project.id}`}>
          <TableCell colSpan={3} className="py-2 pl-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs" onClick={onClick}>
              {currentPipsStep && (
                <div>
                  <span className="font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                    Current Step
                  </span>
                  <div
                    className="flex items-center gap-1.5"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: `var(--color-step-${project.currentStep})`,
                      }}
                    />
                    Step {project.currentStep}: {currentPipsStep.name}
                  </div>
                </div>
              )}
              <div>
                <span className="font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  Progress
                </span>
                <div style={{ color: 'var(--color-text-primary)' }}>
                  {project.stepsCompleted}/6 steps
                </div>
              </div>
              <div>
                <span className="font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  Owner
                </span>
                <div style={{ color: 'var(--color-text-primary)' }}>{project.ownerName}</div>
              </div>
              {project.targetDate && (
                <div>
                  <span className="font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                    Target Date
                  </span>
                  <div style={{ color: 'var(--color-text-primary)' }}>
                    <FormattedDate date={project.targetDate} />
                  </div>
                </div>
              )}
              <div>
                <span className="font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  Created
                </span>
                <div style={{ color: 'var(--color-text-primary)' }}>
                  <FormattedDate date={project.createdAt} />
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
