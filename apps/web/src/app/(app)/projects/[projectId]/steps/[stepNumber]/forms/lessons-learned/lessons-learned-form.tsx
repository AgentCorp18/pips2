'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, ThumbsUp, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AiAssistButton } from '@/components/ui/ai-assist-button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FormShell } from '@/components/pips/form-shell'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { FormFieldView } from '@/components/pips/form-field-view'
import { saveFormData } from '../actions'
import type { LessonsLearnedData } from '@/lib/form-schemas'

type Props = {
  projectId: string
  initialData: LessonsLearnedData | null
}

const defaultData: LessonsLearnedData = {
  wentWell: [''],
  improvements: [''],
  actionItems: [],
  keyTakeaways: '',
}

export const LessonsLearnedForm = ({ projectId, initialData }: Props) => {
  const [data, setData] = useState<LessonsLearnedData>(initialData ?? defaultData)
  const [dirty, setDirty] = useState(false)
  const takeawaysRef = useRef<HTMLTextAreaElement>(null)

  const update = (next: LessonsLearnedData) => {
    setData(next)
    setDirty(true)
  }

  const handleSave = useCallback(async () => {
    const result = await saveFormData(
      projectId,
      6,
      'lessons_learned',
      data as unknown as Record<string, unknown>,
    )
    if (result.error) {
      toast.error(result.error)
      return { error: result.error }
    }
    setDirty(false)
    return { success: true }
  }, [projectId, data])

  /* Went well */
  const addWentWell = () => update({ ...data, wentWell: [...data.wentWell, ''] })
  const removeWentWell = (idx: number) =>
    update({ ...data, wentWell: data.wentWell.filter((_, i) => i !== idx) })
  const updateWentWell = (idx: number, value: string) =>
    update({ ...data, wentWell: data.wentWell.map((v, i) => (i === idx ? value : v)) })

  /* Improvements */
  const addImprovement = () => update({ ...data, improvements: [...data.improvements, ''] })
  const removeImprovement = (idx: number) =>
    update({ ...data, improvements: data.improvements.filter((_, i) => i !== idx) })
  const updateImprovement = (idx: number, value: string) =>
    update({ ...data, improvements: data.improvements.map((v, i) => (i === idx ? value : v)) })

  /* Action items */
  const addAction = () =>
    update({
      ...data,
      actionItems: [...data.actionItems, { description: '', owner: '', dueDate: '' }],
    })
  const removeAction = (idx: number) =>
    update({ ...data, actionItems: data.actionItems.filter((_, i) => i !== idx) })
  const updateAction = (idx: number, field: string, value: string) =>
    update({
      ...data,
      actionItems: data.actionItems.map((a, i) => (i === idx ? { ...a, [field]: value } : a)),
    })

  return (
    <FormShell
      title="Lessons Learned"
      description="Document insights, successes, and areas for improvement from this project."
      stepNumber={6}
      projectId={projectId}
      onSave={handleSave}
      isDirty={dirty}
    >
      <LessonsLearnedFields
        data={data}
        update={update}
        takeawaysRef={takeawaysRef}
        addWentWell={addWentWell}
        removeWentWell={removeWentWell}
        updateWentWell={updateWentWell}
        addImprovement={addImprovement}
        removeImprovement={removeImprovement}
        updateImprovement={updateImprovement}
        addAction={addAction}
        removeAction={removeAction}
        updateAction={updateAction}
      />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type LessonsLearnedFieldsProps = {
  data: LessonsLearnedData
  update: (next: LessonsLearnedData) => void
  takeawaysRef: React.RefObject<HTMLTextAreaElement | null>
  addWentWell: () => void
  removeWentWell: (idx: number) => void
  updateWentWell: (idx: number, value: string) => void
  addImprovement: () => void
  removeImprovement: (idx: number) => void
  updateImprovement: (idx: number, value: string) => void
  addAction: () => void
  removeAction: (idx: number) => void
  updateAction: (idx: number, field: string, value: string) => void
}

const LessonsLearnedFields = ({
  data,
  update,
  takeawaysRef,
  addWentWell,
  removeWentWell,
  updateWentWell,
  addImprovement,
  removeImprovement,
  updateImprovement,
  addAction,
  removeAction,
  updateAction,
}: LessonsLearnedFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  if (isView) {
    return (
      <div className="space-y-8">
        <p className="text-sm text-muted-foreground">Reflections from this improvement project.</p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Went well */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ThumbsUp className="size-4 text-[var(--color-success)]" />
              <span className="text-sm font-medium text-[var(--color-success)]">
                What Went Well
              </span>
            </div>
            <ul className="space-y-1">
              {data.wentWell.filter(Boolean).map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-1.5 text-sm text-[var(--color-text-secondary)]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    +
                  </span>
                  {item}
                </li>
              ))}
              {data.wentWell.filter(Boolean).length === 0 && (
                <p className="text-sm italic text-[var(--color-text-tertiary)]">None listed</p>
              )}
            </ul>
          </div>

          {/* Could improve */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-[var(--color-warning)]" />
              <span className="text-sm font-medium text-[var(--color-warning)]">
                Could Be Improved
              </span>
            </div>
            <ul className="space-y-1">
              {data.improvements.filter(Boolean).map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-1.5 text-sm text-[var(--color-text-secondary)]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    !
                  </span>
                  {item}
                </li>
              ))}
              {data.improvements.filter(Boolean).length === 0 && (
                <p className="text-sm italic text-[var(--color-text-tertiary)]">None listed</p>
              )}
            </ul>
          </div>
        </div>

        {/* Action items */}
        <div className="space-y-3">
          <Label>Action Items</Label>
          {data.actionItems.length === 0 ? (
            <p className="text-sm italic text-[var(--color-text-tertiary)]">No action items.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[140px]">Owner</TableHead>
                  <TableHead className="w-[140px]">Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.actionItems.map((action, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-sm text-[var(--color-text-secondary)]">
                      {action.description || 'Not described'}
                    </TableCell>
                    <TableCell className="text-sm text-[var(--color-text-secondary)]">
                      {action.owner || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-[var(--color-text-secondary)]">
                      {action.dueDate || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Key takeaways */}
        <FormFieldView
          label="Key Takeaways"
          value={data.keyTakeaways}
          helperText="The most important lessons from this improvement cycle."
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Reflect on the project as a team. What went well? What could be improved? Capture action
        items to carry forward.
      </p>

      {/* Two-column layout: Went Well / Could Improve */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Went well */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ThumbsUp className="size-4 text-[var(--color-success)]" />
            <Label className="text-[var(--color-success)]">What Went Well</Label>
          </div>
          <div className="space-y-2">
            {data.wentWell.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  +
                </span>
                <Input
                  value={item}
                  onChange={(e) => updateWentWell(idx, e.target.value)}
                  placeholder="Something that went well..."
                  className="h-8 text-sm"
                />
                {data.wentWell.length > 1 && (
                  <Button variant="ghost" size="icon-xs" onClick={() => removeWentWell(idx)}>
                    <Trash2 className="size-3 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="ghost" size="xs" onClick={addWentWell} className="text-xs">
              <Plus className="size-3" />
              Add
            </Button>
          </div>
        </div>

        {/* Could improve */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-[var(--color-warning)]" />
            <Label className="text-[var(--color-warning)]">Could Be Improved</Label>
          </div>
          <div className="space-y-2">
            {data.improvements.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  !
                </span>
                <Input
                  value={item}
                  onChange={(e) => updateImprovement(idx, e.target.value)}
                  placeholder="Something to improve..."
                  className="h-8 text-sm"
                />
                {data.improvements.length > 1 && (
                  <Button variant="ghost" size="icon-xs" onClick={() => removeImprovement(idx)}>
                    <Trash2 className="size-3 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="ghost" size="xs" onClick={addImprovement} className="text-xs">
              <Plus className="size-3" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Action items table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Action Items</Label>
            <p className="text-xs text-muted-foreground">
              Tasks to carry forward from these lessons.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addAction}>
            <Plus className="size-4" />
            Add Action
          </Button>
        </div>

        {data.actionItems.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No action items yet. Click &ldquo;Add Action&rdquo; to capture follow-up tasks.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="w-[140px]">Owner</TableHead>
                <TableHead className="w-[140px]">Due Date</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.actionItems.map((action, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Input
                      value={action.description}
                      onChange={(e) => updateAction(idx, 'description', e.target.value)}
                      placeholder="What needs to happen?"
                      className="h-7 text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={action.owner}
                      onChange={(e) => updateAction(idx, 'owner', e.target.value)}
                      placeholder="Who?"
                      className="h-7 text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={action.dueDate}
                      onChange={(e) => updateAction(idx, 'dueDate', e.target.value)}
                      className="h-7 text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon-xs" onClick={() => removeAction(idx)}>
                      <Trash2 className="size-3 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Key takeaways */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Label>Key Takeaways</Label>
          <AiAssistButton
            fieldRef={takeawaysRef}
            fieldType="lessons_learned"
            context={`Lessons learned. Went well: ${data.wentWell.filter(Boolean).join(', ') || 'none'}. Improvements: ${data.improvements.filter(Boolean).join(', ') || 'none'}`}
            onAccept={(text) => update({ ...data, keyTakeaways: text })}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Summarize the most important lessons from this improvement cycle.
        </p>
        <textarea
          ref={takeawaysRef}
          value={data.keyTakeaways}
          onChange={(e) => update({ ...data, keyTakeaways: e.target.value })}
          placeholder="What are the top 2-3 things this team should remember?"
          rows={4}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
    </div>
  )
}
