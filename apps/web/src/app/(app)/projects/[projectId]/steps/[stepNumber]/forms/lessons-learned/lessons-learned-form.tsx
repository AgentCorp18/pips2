'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, ThumbsUp, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FormShell } from '@/components/pips/form-shell'
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
  const [saveVersion, setSaveVersion] = useState(0)

  const update = (next: LessonsLearnedData) => {
    setData(next)
    setDirty(true)
    setSaveVersion((v) => v + 1)
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
      onSave={handleSave}
      isDirty={dirty}
      key={saveVersion}
    >
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
          <Label>Key Takeaways</Label>
          <p className="text-xs text-muted-foreground">
            Summarize the most important lessons from this improvement cycle.
          </p>
          <textarea
            value={data.keyTakeaways}
            onChange={(e) => update({ ...data, keyTakeaways: e.target.value })}
            placeholder="What are the top 2-3 things this team should remember?"
            rows={4}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
      </div>
    </FormShell>
  )
}
