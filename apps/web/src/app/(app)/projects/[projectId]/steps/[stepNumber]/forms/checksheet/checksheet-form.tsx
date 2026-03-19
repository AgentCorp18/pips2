'use client'

import { useCallback, useState } from 'react'
import { FormShell } from '@/components/pips/form-shell'
import { FormTextarea } from '@/components/pips/form-textarea'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { FormFieldView } from '@/components/pips/form-field-view'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Minus } from 'lucide-react'
import type { ChecksheetData } from '@/lib/form-schemas'

const DEFAULTS: ChecksheetData = {
  title: '',
  categories: [],
  timePeriods: [],
  tallies: {},
  notes: '',
}

type Props = {
  projectId: string
  stepNumber: number
  initialData: Record<string, unknown> | null
  problemStatementFromStep1: string
}

export const ChecksheetForm = ({
  projectId,
  stepNumber,
  initialData,
  problemStatementFromStep1,
}: Props) => {
  const [data, setData] = useState<ChecksheetData>(() => {
    const merged = { ...DEFAULTS, ...(initialData as Partial<ChecksheetData>) }
    if (!Array.isArray(merged.categories)) merged.categories = []
    if (!Array.isArray(merged.timePeriods)) merged.timePeriods = []
    return merged
  })

  const addCategory = useCallback(() => {
    setData((prev) => ({
      ...prev,
      categories: [...prev.categories, { id: crypto.randomUUID(), label: '' }],
    }))
  }, [])

  const updateCategoryLabel = useCallback((id: string, label: string) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, label } : c)),
    }))
  }, [])

  const removeCategory = useCallback((id: string) => {
    setData((prev) => {
      const newTallies = { ...prev.tallies }
      for (const key of Object.keys(newTallies)) {
        if (key.startsWith(`${id}-`)) {
          delete newTallies[key]
        }
      }
      return {
        ...prev,
        categories: prev.categories.filter((c) => c.id !== id),
        tallies: newTallies,
      }
    })
  }, [])

  const addTimePeriod = useCallback(() => {
    setData((prev) => ({
      ...prev,
      timePeriods: [...prev.timePeriods, { id: crypto.randomUUID(), label: '' }],
    }))
  }, [])

  const updateTimePeriodLabel = useCallback((id: string, label: string) => {
    setData((prev) => ({
      ...prev,
      timePeriods: prev.timePeriods.map((t) => (t.id === id ? { ...t, label } : t)),
    }))
  }, [])

  const removeTimePeriod = useCallback((id: string) => {
    setData((prev) => {
      const newTallies = { ...prev.tallies }
      for (const key of Object.keys(newTallies)) {
        if (key.endsWith(`-${id}`)) {
          delete newTallies[key]
        }
      }
      return {
        ...prev,
        timePeriods: prev.timePeriods.filter((t) => t.id !== id),
        tallies: newTallies,
      }
    })
  }, [])

  const getTally = (categoryId: string, timePeriodId: string): number =>
    data.tallies[`${categoryId}-${timePeriodId}`] ?? 0

  const setTally = useCallback((categoryId: string, timePeriodId: string, value: number) => {
    const clamped = Math.max(0, value)
    setData((prev) => ({
      ...prev,
      tallies: {
        ...prev.tallies,
        [`${categoryId}-${timePeriodId}`]: clamped,
      },
    }))
  }, [])

  const getRowTotal = (categoryId: string): number =>
    data.timePeriods.reduce((sum, tp) => sum + getTally(categoryId, tp.id), 0)

  const getColumnTotal = (timePeriodId: string): number =>
    data.categories.reduce((sum, cat) => sum + getTally(cat.id, timePeriodId), 0)

  const grandTotal = data.categories.reduce((sum, cat) => sum + getRowTotal(cat.id), 0)

  const showGrid = data.categories.length > 0 && data.timePeriods.length > 0

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="checksheet"
      title="Check Sheet"
      description="A structured tally sheet to collect and quantify data by category over time periods. Define your categories (rows) and time periods (columns), then record occurrences."
      data={data as unknown as Record<string, unknown>}
    >
      <ChecksheetFields
        data={data}
        setData={setData}
        problemStatementFromStep1={problemStatementFromStep1}
        addCategory={addCategory}
        updateCategoryLabel={updateCategoryLabel}
        removeCategory={removeCategory}
        addTimePeriod={addTimePeriod}
        updateTimePeriodLabel={updateTimePeriodLabel}
        removeTimePeriod={removeTimePeriod}
        getTally={getTally}
        setTally={setTally}
        getRowTotal={getRowTotal}
        getColumnTotal={getColumnTotal}
        grandTotal={grandTotal}
        showGrid={showGrid}
      />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type ChecksheetFieldsProps = {
  data: ChecksheetData
  setData: React.Dispatch<React.SetStateAction<ChecksheetData>>
  problemStatementFromStep1: string
  addCategory: () => void
  updateCategoryLabel: (id: string, label: string) => void
  removeCategory: (id: string) => void
  addTimePeriod: () => void
  updateTimePeriodLabel: (id: string, label: string) => void
  removeTimePeriod: (id: string) => void
  getTally: (categoryId: string, timePeriodId: string) => number
  setTally: (categoryId: string, timePeriodId: string, value: number) => void
  getRowTotal: (categoryId: string) => number
  getColumnTotal: (timePeriodId: string) => number
  grandTotal: number
  showGrid: boolean
}

const ChecksheetFields = ({
  data,
  setData,
  problemStatementFromStep1,
  addCategory,
  updateCategoryLabel,
  removeCategory,
  addTimePeriod,
  updateTimePeriodLabel,
  removeTimePeriod,
  getTally,
  setTally,
  getRowTotal,
  getColumnTotal,
  grandTotal,
  showGrid,
}: ChecksheetFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  return (
    <div className="space-y-6">
      {/* Problem statement context */}
      {problemStatementFromStep1 && (
        <div className="rounded-[var(--radius-md)] border-l-4 border-l-[var(--color-step-2)] bg-[var(--color-step-2-subtle)] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Problem Statement
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-primary)]">
            {problemStatementFromStep1}
          </p>
        </div>
      )}

      {/* Title */}
      {isView ? (
        <FormFieldView label="Title" value={data.title} helperText="Name what you are measuring" />
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="checksheet-title">Title</Label>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Name what you are measuring (e.g., &quot;Defect Types in Assembly Line&quot;)
          </p>
          <Input
            id="checksheet-title"
            value={data.title}
            onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="What are you tracking?"
            className="text-sm"
          />
        </div>
      )}

      {/* Categories and Time Periods setup — hide in view mode */}
      {!isView && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Categories (Rows)
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                The items or defects being counted
              </p>
            </div>
            {data.categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <Input
                  value={cat.label}
                  onChange={(e) => updateCategoryLabel(cat.id, e.target.value)}
                  placeholder="Category name..."
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeCategory(cat.id)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCategory}
              className="w-full"
            >
              <Plus size={12} />
              Add Category
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Time Periods (Columns)
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                When you are collecting data (e.g., Mon, Tue, Wed)
              </p>
            </div>
            {data.timePeriods.map((tp) => (
              <div key={tp.id} className="flex items-center gap-2">
                <Input
                  value={tp.label}
                  onChange={(e) => updateTimePeriodLabel(tp.id, e.target.value)}
                  placeholder="Time period label..."
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeTimePeriod(tp.id)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTimePeriod}
              className="w-full"
            >
              <Plus size={12} />
              Add Time Period
            </Button>
          </div>
        </div>
      )}

      {/* Tally Grid — read-only in view mode */}
      {showGrid && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Tally Grid</h3>
          <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-secondary)]">
                  <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">
                    Category
                  </th>
                  {data.timePeriods.map((tp) => (
                    <th
                      key={tp.id}
                      className="px-3 py-2 text-center font-medium text-[var(--color-text-secondary)]"
                    >
                      {tp.label || '\u2014'}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-semibold text-[var(--color-text-primary)]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map((cat) => (
                  <tr key={cat.id} className="border-t border-[var(--color-border)]">
                    <td className="px-3 py-2 font-medium text-[var(--color-text-primary)]">
                      {cat.label || '\u2014'}
                    </td>
                    {data.timePeriods.map((tp) => (
                      <td key={tp.id} className="px-1 py-1 text-center">
                        {isView ? (
                          <span className="text-sm font-mono text-[var(--color-text-secondary)]">
                            {getTally(cat.id, tp.id)}
                          </span>
                        ) : (
                          <TallyCell
                            value={getTally(cat.id, tp.id)}
                            onChange={(v) => setTally(cat.id, tp.id, v)}
                          />
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-semibold font-mono text-[var(--color-text-primary)]">
                      {getRowTotal(cat.id)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
                  <td className="px-3 py-2 font-semibold text-[var(--color-text-primary)]">
                    Total
                  </td>
                  {data.timePeriods.map((tp) => (
                    <td
                      key={tp.id}
                      className="px-3 py-2 text-center font-semibold font-mono text-[var(--color-text-primary)]"
                    >
                      {getColumnTotal(tp.id)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center font-bold font-mono text-[var(--color-primary)]">
                    {grandTotal}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!showGrid && (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-6 py-8 text-center">
          <p className="text-sm text-[var(--color-text-tertiary)]">
            {isView
              ? 'No categories or time periods have been defined.'
              : 'Add at least one category and one time period above to start tallying data.'}
          </p>
        </div>
      )}

      {/* Notes */}
      <FormTextarea
        id="checksheet-notes"
        label="Notes"
        value={data.notes}
        onChange={(v) => setData((prev) => ({ ...prev, notes: v }))}
        placeholder="Observations about the data collected..."
        helperText="Record any patterns, anomalies, or insights you notice in the data."
        rows={4}
        aiFieldType="checksheet_notes"
        aiContext={`Problem statement: ${problemStatementFromStep1 || 'not set'}. Check sheet title: ${data.title || 'untitled'}. Categories: ${
          data.categories
            .map((c) => c.label)
            .filter(Boolean)
            .join(', ') || 'none'
        }. Time periods: ${
          data.timePeriods
            .map((t) => t.label)
            .filter(Boolean)
            .join(', ') || 'none'
        }. Grand total: ${grandTotal}.`}
      />
    </div>
  )
}

/* ---- Tally cell sub-component ---- */

type TallyCellProps = {
  value: number
  onChange: (value: number) => void
}

const TallyCell = ({ value, onChange }: TallyCellProps) => (
  <div className="flex items-center justify-center gap-0.5">
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={() => onChange(value - 1)}
      disabled={value <= 0}
      className="h-6 w-6"
    >
      <Minus size={10} />
    </Button>
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => {
        const parsed = parseInt(e.target.value, 10)
        onChange(isNaN(parsed) ? 0 : parsed)
      }}
      className="w-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-transparent px-1 py-0.5 text-center text-xs font-mono focus:outline-none focus:border-[var(--color-primary)]"
    />
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={() => onChange(value + 1)}
      className="h-6 w-6"
    >
      <Plus size={10} />
    </Button>
  </div>
)
