'use client'

import { useCallback, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, CheckSquare, Square, TicketPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormShell } from '@/components/pips/form-shell'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { saveFormData } from '../actions'
import { createTicketsFromChecklist } from './checklist-ticket-actions'
import type { ImplementationChecklistData } from '@/lib/form-schemas'
import { cn } from '@/lib/utils'

type Props = {
  projectId: string
  initialData: ImplementationChecklistData | null
}

const defaultData: ImplementationChecklistData = {
  items: [],
}

export const ImplementationChecklistForm = ({ projectId, initialData }: Props) => {
  const [data, setData] = useState<ImplementationChecklistData>(initialData ?? defaultData)
  const [dirty, setDirty] = useState(false)
  const [saveVersion, setSaveVersion] = useState(0)
  const [isCreatingTickets, startTicketTransition] = useTransition()

  const update = (next: ImplementationChecklistData) => {
    setData(next)
    setDirty(true)
    setSaveVersion((v) => v + 1)
  }

  const handleSave = useCallback(async () => {
    const result = await saveFormData(
      projectId,
      5,
      'implementation_checklist',
      data as unknown as Record<string, unknown>,
    )
    if (result.error) {
      toast.error(result.error)
      return { error: result.error }
    }
    setDirty(false)
    return { success: true }
  }, [projectId, data])

  const addItem = (category: string = '') => {
    update({
      items: [
        ...data.items,
        {
          id: crypto.randomUUID(),
          text: '',
          completed: false,
          assignee: '',
          notes: '',
          category,
        },
      ],
    })
  }

  const removeItem = (id: string) => {
    update({ items: data.items.filter((item) => item.id !== id) })
  }

  const updateItem = (id: string, field: string, value: unknown) => {
    update({
      items: data.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    })
  }

  const toggleItem = (id: string) => {
    update({
      items: data.items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    })
  }

  const handleCreateTickets = () => {
    startTicketTransition(async () => {
      const result = await createTicketsFromChecklist(
        projectId,
        data.items.map((item) => ({
          text: item.text,
          assignee: item.assignee,
          completed: item.completed,
        })),
      )
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          `Created ${result.created} ticket${result.created === 1 ? '' : 's'} from checklist items`,
        )
      }
    })
  }

  // Group items by category
  const grouped = useMemo(() => {
    const groups: Record<string, ImplementationChecklistData['items']> = {}
    for (const item of data.items) {
      const cat = item.category || 'Uncategorized'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    }
    return groups
  }, [data.items])

  const completedCount = data.items.filter((i) => i.completed).length
  const totalCount = data.items.length
  const incompleteWithText = data.items.filter(
    (i) => !i.completed && i.text.trim().length > 0,
  ).length

  return (
    <FormShell
      title="Implementation Checklist"
      description="Track detailed tasks with status, owners, and notes grouped by category."
      stepNumber={5}
      onSave={handleSave}
      isDirty={dirty}
      key={saveVersion}
    >
      <ChecklistFields
        grouped={grouped}
        completedCount={completedCount}
        totalCount={totalCount}
        incompleteWithText={incompleteWithText}
        isCreatingTickets={isCreatingTickets}
        toggleItem={toggleItem}
        updateItem={updateItem}
        removeItem={removeItem}
        addItem={addItem}
        handleCreateTickets={handleCreateTickets}
      />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type ChecklistFieldsProps = {
  grouped: Record<string, ImplementationChecklistData['items']>
  completedCount: number
  totalCount: number
  incompleteWithText: number
  isCreatingTickets: boolean
  toggleItem: (id: string) => void
  updateItem: (id: string, field: string, value: unknown) => void
  removeItem: (id: string) => void
  addItem: (category?: string) => void
  handleCreateTickets: () => void
}

const ChecklistFields = ({
  grouped,
  completedCount,
  totalCount,
  incompleteWithText,
  isCreatingTickets,
  toggleItem,
  updateItem,
  removeItem,
  addItem,
  handleCreateTickets,
}: ChecklistFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  return (
    <div className="space-y-6">
      {/* Progress count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isView
            ? 'Implementation checklist status.'
            : 'Track each task as you execute the implementation plan.'}
        </p>
        {totalCount > 0 && (
          <span className="text-sm font-medium text-muted-foreground">
            {completedCount} of {totalCount} completed
          </span>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%`,
              backgroundColor: 'var(--color-step-5)',
            }}
          />
        </div>
      )}

      {/* Grouped items */}
      {totalCount === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {isView
            ? 'No checklist items.'
            : 'No items yet. Click \u201CAdd Item\u201D to start building your checklist.'}
        </p>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{category}</h3>
            <span className="text-xs text-muted-foreground">
              {items.filter((i) => i.completed).length}/{items.length}
            </span>
          </div>

          {items.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={() => toggleItem(item.id)}
              onUpdate={(field, value) => updateItem(item.id, field, value)}
              onRemove={() => removeItem(item.id)}
            />
          ))}

          {!isView && (
            <Button
              variant="ghost"
              size="xs"
              className="text-xs text-muted-foreground"
              onClick={() => addItem(category === 'Uncategorized' ? '' : category)}
            >
              <Plus className="size-3" />
              Add to {category}
            </Button>
          )}
        </div>
      ))}

      {/* Add item + Create tickets */}
      {!isView && (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => addItem()}>
            <Plus className="size-4" />
            Add Item
          </Button>
          {incompleteWithText > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateTickets}
              disabled={isCreatingTickets}
              className="gap-1.5"
            >
              <TicketPlus className="size-4" />
              {isCreatingTickets
                ? 'Creating...'
                : `Create ${incompleteWithText} Ticket${incompleteWithText === 1 ? '' : 's'} from Checklist`}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/* ---- Checklist Item Sub-component ---- */

type ChecklistItemProps = {
  item: ImplementationChecklistData['items'][number]
  onToggle: () => void
  onUpdate: (field: string, value: unknown) => void
  onRemove: () => void
}

const ChecklistItem = ({ item, onToggle, onUpdate, onRemove }: ChecklistItemProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  if (isView) {
    return (
      <div
        className={cn(
          'flex items-start gap-2 rounded-[var(--radius-md)] border p-3',
          item.completed
            ? 'border-[var(--color-success)] bg-[var(--color-success-subtle)]'
            : 'border-[var(--color-border)]',
        )}
      >
        {item.completed ? (
          <CheckSquare className="mt-0.5 size-4 flex-shrink-0 text-[var(--color-success)]" />
        ) : (
          <Square className="mt-0.5 size-4 flex-shrink-0 text-muted-foreground" />
        )}
        <div className="flex-1 space-y-0.5">
          <span
            className={cn(
              'text-sm text-[var(--color-text-primary)]',
              item.completed && 'line-through text-muted-foreground',
            )}
          >
            {item.text || 'Untitled task'}
          </span>
          <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-tertiary)]">
            {item.assignee && <span>Assignee: {item.assignee}</span>}
            {item.notes && <span>Notes: {item.notes}</span>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-[var(--radius-md)] border p-3 transition-colors',
        item.completed
          ? 'border-[var(--color-success)] bg-[var(--color-success-subtle)]'
          : 'border-[var(--color-border)]',
      )}
    >
      <button type="button" onClick={onToggle} className="mt-1 flex-shrink-0">
        {item.completed ? (
          <CheckSquare className="size-4 text-[var(--color-success)]" />
        ) : (
          <Square className="size-4 text-muted-foreground" />
        )}
      </button>

      <div className="flex-1 space-y-2">
        <div className="grid gap-2 sm:grid-cols-3">
          <Input
            value={item.text}
            onChange={(e) => onUpdate('text', e.target.value)}
            placeholder="Task description"
            className={cn(
              'h-7 text-xs sm:col-span-2',
              item.completed && 'line-through text-muted-foreground',
            )}
          />
          <Input
            value={item.assignee}
            onChange={(e) => onUpdate('assignee', e.target.value)}
            placeholder="Assignee"
            className="h-7 text-xs"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            value={item.category}
            onChange={(e) => onUpdate('category', e.target.value)}
            placeholder="Category"
            className="h-7 text-xs"
          />
          <Input
            value={item.notes}
            onChange={(e) => onUpdate('notes', e.target.value)}
            placeholder="Notes (optional)"
            className="h-7 text-xs"
          />
        </div>
      </div>

      <Button variant="ghost" size="icon-xs" onClick={onRemove}>
        <Trash2 className="size-3 text-muted-foreground" />
      </Button>
    </div>
  )
}
