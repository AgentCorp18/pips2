'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, CheckCircle2, Clock, AlertTriangle, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormShell } from '@/components/pips/form-shell'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { saveFormData } from '../actions'
import type { MilestoneTrackerData } from '@/lib/form-schemas'
import { cn } from '@/lib/utils'

type Props = {
  projectId: string
  initialData: MilestoneTrackerData | null
  /** Selected solution from Step 4 implementation plan, used as context */
  selectedSolutionFromStep4?: string
}

type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

const defaultData: MilestoneTrackerData = {
  milestones: [],
  overallProgress: 0,
}

const statusConfig: Record<
  MilestoneStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pending',
    color: 'bg-muted text-muted-foreground',
    icon: <Circle className="size-3" />,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: <Clock className="size-3" />,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: <CheckCircle2 className="size-3" />,
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    icon: <AlertTriangle className="size-3" />,
  },
}

export const MilestoneTrackerForm = ({
  projectId,
  initialData,
  selectedSolutionFromStep4,
}: Props) => {
  const [data, setData] = useState<MilestoneTrackerData>(initialData ?? defaultData)
  const [dirty, setDirty] = useState(false)

  const calcProgress = (milestones: MilestoneTrackerData['milestones']) => {
    if (milestones.length === 0) return 0
    const completed = milestones.filter((m) => m.status === 'completed').length
    return Math.round((completed / milestones.length) * 100)
  }

  const update = (
    next: Omit<MilestoneTrackerData, 'overallProgress'> & {
      milestones: MilestoneTrackerData['milestones']
    },
  ) => {
    const overallProgress = calcProgress(next.milestones)
    setData({ ...next, overallProgress })
    setDirty(true)
  }

  const handleSave = useCallback(async () => {
    const result = await saveFormData(
      projectId,
      5,
      'milestone_tracker',
      data as unknown as Record<string, unknown>,
    )
    if (result.error) {
      toast.error(result.error)
      return { error: result.error }
    }
    setDirty(false)
    return { success: true }
  }, [projectId, data])

  const addMilestone = () => {
    update({
      milestones: [
        ...data.milestones,
        {
          id: crypto.randomUUID(),
          title: '',
          targetDate: '',
          completedDate: null,
          status: 'pending',
          description: '',
          deliverables: [],
        },
      ],
    })
  }

  const removeMilestone = (id: string) => {
    update({
      milestones: data.milestones.filter((m) => m.id !== id),
    })
  }

  const updateMilestone = (id: string, field: string, value: unknown) => {
    update({
      milestones: data.milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    })
  }

  const addDeliverable = (milestoneId: string) => {
    update({
      milestones: data.milestones.map((m) =>
        m.id === milestoneId ? { ...m, deliverables: [...m.deliverables, ''] } : m,
      ),
    })
  }

  const updateDeliverable = (milestoneId: string, dIdx: number, value: string) => {
    update({
      milestones: data.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              deliverables: m.deliverables.map((d, i) => (i === dIdx ? value : d)),
            }
          : m,
      ),
    })
  }

  const removeDeliverable = (milestoneId: string, dIdx: number) => {
    update({
      milestones: data.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              deliverables: m.deliverables.filter((_, i) => i !== dIdx),
            }
          : m,
      ),
    })
  }

  return (
    <FormShell
      title="Milestone Tracker"
      description="Track progress against planned milestones and dates."
      stepNumber={5}
      projectId={projectId}
      onSave={handleSave}
      isDirty={dirty}
    >
      {selectedSolutionFromStep4 && (
        <div
          className="mb-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-4 py-3"
          data-testid="step4-context-banner"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1">
            Selected Solution (from Step 4)
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">{selectedSolutionFromStep4}</p>
        </div>
      )}
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="font-mono text-muted-foreground">{data.overallProgress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${data.overallProgress}%`,
                backgroundColor: 'var(--color-step-5)',
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {data.milestones.filter((m) => m.status === 'completed').length} of{' '}
            {data.milestones.length} milestones completed
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Add milestones with target dates and deliverables. Update their status as work progresses.
        </p>

        {/* Milestones list */}
        {data.milestones.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No milestones yet. Click &ldquo;Add Milestone&rdquo; to start tracking progress.
          </p>
        )}

        {data.milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            onUpdate={(field, value) => updateMilestone(milestone.id, field, value)}
            onRemove={() => removeMilestone(milestone.id)}
            onAddDeliverable={() => addDeliverable(milestone.id)}
            onUpdateDeliverable={(dIdx, val) => updateDeliverable(milestone.id, dIdx, val)}
            onRemoveDeliverable={(dIdx) => removeDeliverable(milestone.id, dIdx)}
          />
        ))}

        <MilestoneAddButton onAdd={addMilestone} />
      </div>
    </FormShell>
  )
}

/* ---- Add button (view-mode-aware) ---- */

const MilestoneAddButton = ({ onAdd }: { onAdd: () => void }) => {
  const mode = useFormViewMode()
  if (mode === 'view') return null
  return (
    <Button variant="outline" size="sm" onClick={onAdd}>
      <Plus className="size-4" />
      Add Milestone
    </Button>
  )
}

/* ---- Milestone Card Sub-component ---- */

type MilestoneCardProps = {
  milestone: MilestoneTrackerData['milestones'][number]
  onUpdate: (field: string, value: unknown) => void
  onRemove: () => void
  onAddDeliverable: () => void
  onUpdateDeliverable: (idx: number, value: string) => void
  onRemoveDeliverable: (idx: number) => void
}

const MilestoneCard = ({
  milestone,
  onUpdate,
  onRemove,
  onAddDeliverable,
  onUpdateDeliverable,
  onRemoveDeliverable,
}: MilestoneCardProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'
  const config = statusConfig[milestone.status]

  if (isView) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {milestone.title || 'Untitled milestone'}
          </span>
          <Badge className={cn('gap-1 text-xs', config.color)}>
            {config.icon}
            {config.label}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-tertiary)]">
          {milestone.targetDate && <span>Target: {milestone.targetDate}</span>}
          {milestone.completedDate && <span>Completed: {milestone.completedDate}</span>}
        </div>
        {milestone.description && (
          <p className="text-sm text-[var(--color-text-secondary)]">{milestone.description}</p>
        )}
        {milestone.deliverables.length > 0 && (
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-[var(--color-text-primary)]">
              Deliverables:
            </span>
            <ul className="ml-4 space-y-0.5">
              {milestone.deliverables.map((d, dIdx) => (
                <li key={dIdx} className="text-xs text-[var(--color-text-secondary)]">
                  {dIdx + 1}. {d || 'Empty'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              value={milestone.title}
              onChange={(e) => onUpdate('title', e.target.value)}
              placeholder="Milestone title"
              className="h-8 flex-1 font-medium"
            />
            <Badge className={cn('gap-1 text-xs', config.color)}>
              {config.icon}
              {config.label}
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={milestone.status} onValueChange={(v) => onUpdate('status', v)}>
                <SelectTrigger size="sm" className="h-8 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(statusConfig) as MilestoneStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusConfig[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Target Date</Label>
              <Input
                type="date"
                value={milestone.targetDate}
                onChange={(e) => onUpdate('targetDate', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Completed Date</Label>
              <Input
                type="date"
                value={milestone.completedDate ?? ''}
                onChange={(e) => onUpdate('completedDate', e.target.value || null)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <textarea
              value={milestone.description}
              onChange={(e) => onUpdate('description', e.target.value)}
              placeholder="What does this milestone represent?"
              rows={2}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          {/* Deliverables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Deliverables</Label>
              <Button variant="ghost" size="xs" onClick={onAddDeliverable}>
                <Plus className="size-3" />
                Add
              </Button>
            </div>
            {milestone.deliverables.map((d, dIdx) => (
              <div key={dIdx} className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{dIdx + 1}.</span>
                <Input
                  value={d}
                  onChange={(e) => onUpdateDeliverable(dIdx, e.target.value)}
                  placeholder="Deliverable"
                  className="h-7 text-xs"
                />
                <Button variant="ghost" size="icon-xs" onClick={() => onRemoveDeliverable(dIdx)}>
                  <Trash2 className="size-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Button variant="ghost" size="icon-xs" onClick={onRemove}>
          <Trash2 className="size-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  )
}
