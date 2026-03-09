'use client'

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
import { FormattedDate } from '@/components/ui/formatted-date'

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

  return (
    <div
      className="overflow-x-auto rounded-lg border border-[var(--color-border)]"
      data-testid="project-list-table"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current Step</TableHead>
            <TableHead>Steps Completed</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Target Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const fallback = { label: 'Active', variant: 'default' as const }
            const statusConfig = STATUS_CONFIG[project.status] ?? fallback
            const currentPipsStep = PIPS_STEPS.find((s) => s.number === project.currentStep)

            return (
              <TableRow
                key={project.id}
                className="cursor-pointer"
                onClick={() => router.push(`/projects/${project.id}`)}
                data-testid={`project-row-${project.id}`}
              >
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                  <Badge variant={statusConfig.variant} className="text-xs">
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell>
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
                <TableCell>
                  <span className="text-sm">{project.stepsCompleted}/6</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{project.ownerName}</span>
                </TableCell>
                <TableCell>
                  {project.targetDate ? (
                    <span className="text-sm">
                      <FormattedDate date={project.targetDate} />
                    </span>
                  ) : (
                    <span className="text-sm text-[var(--color-text-tertiary)]">-</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
