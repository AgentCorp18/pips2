'use client'

import { useCallback, useMemo, useState } from 'react'
import { FormShell } from '@/components/pips/form-shell'
import { FormTextarea } from '@/components/pips/form-textarea'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Check, X } from 'lucide-react'
import type { ListReductionData } from '@/lib/form-schemas'

const DEFAULTS: ListReductionData = {
  items: [],
  criteria: '',
  finalList: [],
}

type Props = {
  projectId: string
  stepNumber: number
  initialData: Record<string, unknown> | null
  problemStatementContext?: Record<string, unknown> | null
}

export const ListReductionForm = ({
  projectId,
  stepNumber,
  initialData,
  problemStatementContext,
}: Props) => {
  const [data, setData] = useState<ListReductionData>({
    ...DEFAULTS,
    ...(initialData as Partial<ListReductionData>),
  })
  const [newItem, setNewItem] = useState('')

  const addItem = useCallback(() => {
    const text = newItem.trim()
    if (!text) return
    setData((prev) => {
      const updated = {
        ...prev,
        items: [...prev.items, { id: crypto.randomUUID(), text, kept: true, reason: '' }],
      }
      return { ...updated, finalList: updated.items.filter((i) => i.kept).map((i) => i.text) }
    })
    setNewItem('')
  }, [newItem])

  const toggleKept = useCallback((id: string) => {
    setData((prev) => {
      const updated = {
        ...prev,
        items: prev.items.map((item) =>
          item.id === id
            ? { ...item, kept: !item.kept, reason: item.kept ? item.reason : '' }
            : item,
        ),
      }
      return { ...updated, finalList: updated.items.filter((i) => i.kept).map((i) => i.text) }
    })
  }, [])

  const updateReason = useCallback((id: string, reason: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, reason } : item)),
    }))
  }, [])

  const updateCriteria = useCallback((value: string) => {
    setData((prev) => ({ ...prev, criteria: value }))
  }, [])

  const keptItems = data.items.filter((i) => i.kept)
  const eliminatedItems = data.items.filter((i) => !i.kept)

  // Build cross-form context from the problem statement
  const psCtx = problemStatementContext as {
    problemStatement?: string
    problemArea?: string
    asIs?: string
  } | null

  const aiBaseContext = useMemo(() => {
    const parts = [
      psCtx?.problemStatement && `Problem statement: ${psCtx.problemStatement}`,
      psCtx?.problemArea && `Problem area: ${psCtx.problemArea}`,
      psCtx?.asIs && `Current state: ${psCtx.asIs}`,
      data.items.length > 0 && `Items in list: ${data.items.map((i) => i.text).join(', ')}`,
    ]
    return parts.filter(Boolean).join('. ')
  }, [psCtx, data.items])

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="list_reduction"
      title="List Reduction"
      description="Apply elimination criteria to narrow a long list down to the most important items. Toggle each item as kept or eliminated and provide a reason when eliminating."
      required
      data={data as unknown as Record<string, unknown>}
    >
      <ListReductionFields
        data={data}
        keptItems={keptItems}
        eliminatedItems={eliminatedItems}
        newItem={newItem}
        setNewItem={setNewItem}
        addItem={addItem}
        toggleKept={toggleKept}
        updateReason={updateReason}
        updateCriteria={updateCriteria}
        aiBaseContext={aiBaseContext}
      />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type ListReductionFieldsProps = {
  data: ListReductionData
  keptItems: ListReductionData['items']
  eliminatedItems: ListReductionData['items']
  newItem: string
  setNewItem: (v: string) => void
  addItem: () => void
  toggleKept: (id: string) => void
  updateReason: (id: string, reason: string) => void
  updateCriteria: (value: string) => void
  aiBaseContext: string
}

const ListReductionFields = ({
  data,
  keptItems,
  eliminatedItems,
  newItem,
  setNewItem,
  addItem,
  toggleKept,
  updateReason,
  updateCriteria,
  aiBaseContext,
}: ListReductionFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  if (isView) {
    return (
      <div className="space-y-6">
        {/* Criteria */}
        {data.criteria && (
          <div className="space-y-1">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              Elimination Criteria
            </span>
            <p className="text-sm text-[var(--color-text-secondary)]">{data.criteria}</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-3 text-xs text-[var(--color-text-secondary)]">
          <span>Total: {data.items.length}</span>
          <span>Kept: {keptItems.length}</span>
          <span>Eliminated: {eliminatedItems.length}</span>
        </div>

        {/* All items */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">All Items</span>
          {data.items.length === 0 ? (
            <p className="text-sm italic text-[var(--color-text-tertiary)]">No items yet</p>
          ) : (
            data.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-[var(--radius-md)] border p-3 ${
                  item.kept
                    ? 'border-[var(--color-success)] bg-[var(--color-success-subtle)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-secondary)] opacity-60'
                }`}
              >
                <Badge
                  variant={item.kept ? 'default' : 'secondary'}
                  className="shrink-0 text-[10px]"
                >
                  {item.kept ? 'Kept' : 'Eliminated'}
                </Badge>
                <div className="flex-1 space-y-0.5">
                  <p
                    className={`text-sm text-[var(--color-text-primary)] ${!item.kept ? 'line-through' : ''}`}
                  >
                    {item.text}
                  </p>
                  {!item.kept && item.reason && (
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      Reason: {item.reason}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Final list */}
        {keptItems.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              Final List ({keptItems.length} items)
            </span>
            <ol className="space-y-1">
              {keptItems.map((item, idx) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
                >
                  <span className="text-xs font-semibold text-[var(--color-text-tertiary)]">
                    {idx + 1}.
                  </span>
                  {item.text}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Elimination Criteria */}
      <FormTextarea
        id="elimination-criteria"
        label="Elimination Criteria"
        value={data.criteria}
        onChange={updateCriteria}
        placeholder="e.g. Must be achievable within 3 months with current resources, estimated cost < $50k"
        helperText="Define objective criteria for eliminating items. Items that fail these criteria will be removed."
        rows={2}
        maxLength={1000}
        aiFieldType="elimination_criteria"
        aiContext={aiBaseContext}
      />

      {/* Add Item */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <Label>Add an item</Label>
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Type item text..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addItem()
                }
              }}
              className="flex-1"
            />
            <Button type="button" onClick={addItem}>
              <Plus size={14} />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="flex gap-3 text-xs text-[var(--color-text-secondary)]">
        <span>Total: {data.items.length}</span>
        <span>Kept: {keptItems.length}</span>
        <span>Eliminated: {eliminatedItems.length}</span>
      </div>

      {/* Item list */}
      <div className="space-y-2">
        {data.items.length === 0 ? (
          <p className="text-sm italic text-[var(--color-text-tertiary)]">
            No items yet. Add items above to start reducing.
          </p>
        ) : (
          data.items.map((item) => (
            <div
              key={item.id}
              className={`rounded-[var(--radius-md)] border p-3 ${
                item.kept
                  ? 'border-[var(--color-success)] bg-[var(--color-success-subtle)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-secondary)]'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Toggle button */}
                <button
                  type="button"
                  onClick={() => toggleKept(item.id)}
                  className={`flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                    item.kept
                      ? 'bg-[var(--color-success)] text-white'
                      : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]'
                  }`}
                  title={item.kept ? 'Mark as eliminated' : 'Mark as kept'}
                >
                  {item.kept ? (
                    <>
                      <Check size={12} />
                      Kept
                    </>
                  ) : (
                    <>
                      <X size={12} />
                      Eliminated
                    </>
                  )}
                </button>

                {/* Item text */}
                <p
                  className={`flex-1 text-sm ${
                    !item.kept
                      ? 'text-[var(--color-text-tertiary)] line-through'
                      : 'text-[var(--color-text-primary)]'
                  }`}
                >
                  {item.text}
                </p>
              </div>

              {/* Reason field — shown when eliminated */}
              {!item.kept && (
                <div className="mt-2 pl-16">
                  <Input
                    value={item.reason}
                    onChange={(e) => updateReason(item.id, e.target.value)}
                    placeholder="Reason for elimination..."
                    className="h-7 text-xs"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Final List summary */}
      {keptItems.length > 0 && (
        <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Final List ({keptItems.length} items)
          </span>
          <ol className="space-y-1">
            {keptItems.map((item, idx) => (
              <li
                key={item.id}
                className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <span className="text-xs font-semibold text-[var(--color-text-tertiary)]">
                  {idx + 1}.
                </span>
                {item.text}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
