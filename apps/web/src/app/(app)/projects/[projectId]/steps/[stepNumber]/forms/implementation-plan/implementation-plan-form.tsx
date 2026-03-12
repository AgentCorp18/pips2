'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
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
import { FormFieldView, FormInlineView } from '@/components/pips/form-field-view'
import { saveFormData } from '../actions'
import type { ImplementationPlanData } from '@/lib/form-schemas'

type Props = {
  projectId: string
  initialData: ImplementationPlanData | null
}

const defaultData: ImplementationPlanData = {
  selectedSolution: '',
  tasks: [],
  timeline: '',
  resources: '',
  budget: '',
  risks: [],
}

const statusLabels: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export const ImplementationPlanForm = ({ projectId, initialData }: Props) => {
  const [data, setData] = useState<ImplementationPlanData>(initialData ?? defaultData)
  const [dirty, setDirty] = useState(false)

  const update = (next: ImplementationPlanData) => {
    setData(next)
    setDirty(true)
  }

  const handleSave = useCallback(async () => {
    const result = await saveFormData(
      projectId,
      4,
      'implementation_plan',
      data as unknown as Record<string, unknown>,
    )
    if (result.error) {
      toast.error(result.error)
      return { error: result.error }
    }
    setDirty(false)
    return { success: true }
  }, [projectId, data])

  const addTask = () => {
    update({
      ...data,
      tasks: [
        ...data.tasks,
        {
          id: crypto.randomUUID(),
          title: '',
          assignee: '',
          dueDate: '',
          status: 'not_started',
          notes: '',
        },
      ],
    })
  }

  const removeTask = (id: string) => {
    update({ ...data, tasks: data.tasks.filter((t) => t.id !== id) })
  }

  const updateTask = (id: string, field: string, value: string) => {
    update({
      ...data,
      tasks: data.tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    })
  }

  const addRisk = () => {
    update({ ...data, risks: [...data.risks, { risk: '', mitigation: '' }] })
  }

  const removeRisk = (idx: number) => {
    update({ ...data, risks: data.risks.filter((_, i) => i !== idx) })
  }

  const updateRisk = (idx: number, field: 'risk' | 'mitigation', value: string) => {
    update({
      ...data,
      risks: data.risks.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    })
  }

  return (
    <FormShell
      title="Implementation Plan"
      description="Create a detailed plan with tasks, timeline, resources, and risk mitigation."
      stepNumber={4}
      onSave={handleSave}
      isDirty={dirty}
    >
      <ImplementationPlanFields
        data={data}
        update={update}
        addTask={addTask}
        removeTask={removeTask}
        updateTask={updateTask}
        addRisk={addRisk}
        removeRisk={removeRisk}
        updateRisk={updateRisk}
      />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type ImplementationPlanFieldsProps = {
  data: ImplementationPlanData
  update: (next: ImplementationPlanData) => void
  addTask: () => void
  removeTask: (id: string) => void
  updateTask: (id: string, field: string, value: string) => void
  addRisk: () => void
  removeRisk: (idx: number) => void
  updateRisk: (idx: number, field: 'risk' | 'mitigation', value: string) => void
}

const ImplementationPlanFields = ({
  data,
  update,
  addTask,
  removeTask,
  updateTask,
  addRisk,
  removeRisk,
  updateRisk,
}: ImplementationPlanFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  return (
    <div className="space-y-8">
      {/* Selected solution */}
      {isView ? (
        <FormFieldView
          label="Selected Solution"
          value={data.selectedSolution}
          helperText="Which solution from the Criteria Matrix will you implement?"
        />
      ) : (
        <div className="space-y-2">
          <Label>Selected Solution</Label>
          <p className="text-xs text-muted-foreground">
            Which solution from the Criteria Matrix will you implement?
          </p>
          <Input
            value={data.selectedSolution}
            onChange={(e) => update({ ...data, selectedSolution: e.target.value })}
            placeholder="Enter the chosen solution"
          />
        </div>
      )}

      {/* Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Tasks</Label>
            <p className="text-xs text-muted-foreground">
              Break the plan into actionable tasks with owners and deadlines.
            </p>
          </div>
          {!isView && (
            <Button variant="outline" size="sm" onClick={addTask}>
              <Plus className="size-4" />
              Add Task
            </Button>
          )}
        </div>

        {data.tasks.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {isView ? 'No tasks defined.' : 'No tasks yet. Click "Add Task" to get started.'}
          </p>
        )}

        {data.tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onUpdate={(field, value) => updateTask(task.id, field, value)}
            onRemove={() => removeTask(task.id)}
          />
        ))}
      </div>

      {/* Timeline, Resources, Budget */}
      <div className="grid gap-4 sm:grid-cols-3">
        {isView ? (
          <>
            <FormFieldView label="Timeline" value={data.timeline} />
            <FormFieldView label="Resources Needed" value={data.resources} />
            <FormFieldView label="Budget" value={data.budget} />
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Timeline</Label>
              <textarea
                value={data.timeline}
                onChange={(e) => update({ ...data, timeline: e.target.value })}
                placeholder="e.g., 3 months starting April 2026"
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Resources Needed</Label>
              <textarea
                value={data.resources}
                onChange={(e) => update({ ...data, resources: e.target.value })}
                placeholder="People, tools, materials..."
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Budget</Label>
              <textarea
                value={data.budget}
                onChange={(e) => update({ ...data, budget: e.target.value })}
                placeholder="Estimated costs and budget allocation"
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
          </>
        )}
      </div>

      {/* Risks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Risks & Mitigation</Label>
            <p className="text-xs text-muted-foreground">
              Identify potential risks and how you plan to address them.
            </p>
          </div>
          {!isView && (
            <Button variant="outline" size="sm" onClick={addRisk}>
              <Plus className="size-4" />
              Add Risk
            </Button>
          )}
        </div>

        {data.risks.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {isView
              ? 'No risks identified.'
              : 'No risks identified yet. Click "Add Risk" to document potential risks.'}
          </p>
        )}

        {data.risks.map((risk, idx) => (
          <div key={idx} className="flex items-start gap-2">
            {isView ? (
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <FormInlineView value={risk.risk} placeholder="No risk description" />
                <FormInlineView value={risk.mitigation} placeholder="No mitigation" />
              </div>
            ) : (
              <>
                <div className="grid flex-1 gap-2 sm:grid-cols-2">
                  <Input
                    value={risk.risk}
                    onChange={(e) => updateRisk(idx, 'risk', e.target.value)}
                    placeholder="Risk description"
                  />
                  <Input
                    value={risk.mitigation}
                    onChange={(e) => updateRisk(idx, 'mitigation', e.target.value)}
                    placeholder="Mitigation strategy"
                  />
                </div>
                <Button variant="ghost" size="icon-xs" onClick={() => removeRisk(idx)}>
                  <Trash2 className="size-3 text-muted-foreground" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Task Row Sub-component ---- */

type TaskRowProps = {
  task: ImplementationPlanData['tasks'][number]
  onUpdate: (field: string, value: string) => void
  onRemove: () => void
}

const TaskRow = ({ task, onUpdate, onRemove }: TaskRowProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  if (isView) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {task.title || (
                <span className="italic text-[var(--color-text-tertiary)]">Untitled task</span>
              )}
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-tertiary)]">
              {task.assignee && <span>Assignee: {task.assignee}</span>}
              {task.dueDate && <span>Due: {task.dueDate}</span>}
            </div>
            {task.notes && (
              <p className="text-xs text-[var(--color-text-secondary)]">{task.notes}</p>
            )}
          </div>
          <Badge
            variant={task.status === 'completed' ? 'default' : 'secondary'}
            className="text-[10px]"
          >
            {statusLabels[task.status] ?? task.status}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
      <div className="flex items-start gap-2">
        <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            value={task.title}
            onChange={(e) => onUpdate('title', e.target.value)}
            placeholder="Task title"
            className="h-8 text-sm"
          />
          <Input
            value={task.assignee}
            onChange={(e) => onUpdate('assignee', e.target.value)}
            placeholder="Assignee"
            className="h-8 text-sm"
          />
          <Input
            type="date"
            value={task.dueDate}
            onChange={(e) => onUpdate('dueDate', e.target.value)}
            className="h-8 text-sm"
          />
          <Select value={task.status} onValueChange={(v) => onUpdate('status', v)}>
            <SelectTrigger size="sm" className="h-8 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([val, label]) => (
                <SelectItem key={val} value={val}>
                  <Badge
                    variant={val === 'completed' ? 'default' : 'secondary'}
                    className="text-[10px]"
                  >
                    {label}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onRemove}>
          <Trash2 className="size-3 text-muted-foreground" />
        </Button>
      </div>
      <Input
        value={task.notes}
        onChange={(e) => onUpdate('notes', e.target.value)}
        placeholder="Notes (optional)"
        className="mt-2 h-7 text-xs"
      />
    </div>
  )
}
