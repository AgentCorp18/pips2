'use client'

import { useCallback, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormShell } from '@/components/pips/form-shell'
import { useFormViewMode } from '@/components/pips/form-view-context'
import type { ParetoData } from '@/lib/form-schemas'
import { cn } from '@/lib/utils'

type Props = {
  projectId: string
  stepNumber: number
  initialData: ParetoData | null
}

type Category = ParetoData['categories'][number]

const createDefaultData = (): ParetoData => ({
  title: '',
  categories: [{ id: crypto.randomUUID(), name: '', count: 0, percentage: 0, cumulative: 0 }],
  eightyTwentyLine: '',
  notes: '',
})

/** Re-compute percentage and cumulative after any change to categories */
const recalculate = (categories: Category[]): Category[] => {
  const sorted = [...categories].sort((a, b) => b.count - a.count)
  const total = sorted.reduce((sum, c) => sum + c.count, 0)
  let cumulative = 0
  return sorted.map((c) => {
    const pct = total > 0 ? Math.round((c.count / total) * 100) : 0
    cumulative += pct
    return { ...c, percentage: pct, cumulative }
  })
}

/** Determine which categories fall within the 80% threshold */
const getEightyPercentCategories = (categories: Category[]): string[] => {
  const sorted = recalculate(categories)
  const results: string[] = []
  let running = 0
  for (const cat of sorted) {
    if (running >= 80) break
    if (cat.name) results.push(cat.name)
    running += cat.percentage
  }
  return results
}

export const ParetoForm = ({ projectId, stepNumber, initialData }: Props) => {
  const [data, setData] = useState<ParetoData>(() => {
    const d = initialData ?? createDefaultData()
    return { ...d, categories: recalculate(d.categories) }
  })

  const update = useCallback((next: ParetoData) => {
    setData({ ...next, categories: recalculate(next.categories) })
  }, [])

  const addCategory = () =>
    update({
      ...data,
      categories: [
        ...data.categories,
        { id: crypto.randomUUID(), name: '', count: 0, percentage: 0, cumulative: 0 },
      ],
    })

  const removeCategory = (id: string) =>
    update({ ...data, categories: data.categories.filter((c) => c.id !== id) })

  const updateCategory = (
    id: string,
    field: keyof Pick<Category, 'name' | 'count'>,
    value: string | number,
  ) =>
    update({
      ...data,
      categories: data.categories.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    })

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="pareto"
      title="Pareto Analysis"
      description="Identify the vital few causes that account for the majority of problems using the 80/20 principle."
      data={data as unknown as Record<string, unknown>}
    >
      <ParetoFields
        data={data}
        update={update}
        addCategory={addCategory}
        removeCategory={removeCategory}
        updateCategory={updateCategory}
      />
    </FormShell>
  )
}

/* ---- Inner fields component ---- */

type FieldsProps = {
  data: ParetoData
  update: (next: ParetoData) => void
  addCategory: () => void
  removeCategory: (id: string) => void
  updateCategory: (
    id: string,
    field: keyof Pick<Category, 'name' | 'count'>,
    value: string | number,
  ) => void
}

const ParetoFields = ({
  data,
  update,
  addCategory,
  removeCategory,
  updateCategory,
}: FieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  const sorted = data.categories

  const eightyPctCategories = getEightyPercentCategories(data.categories)
  const maxCount = Math.max(...data.categories.map((c) => c.count), 1)

  if (isView) {
    return (
      <div className="space-y-8">
        {/* Title */}
        <div className="space-y-1">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Analysis Title
          </span>
          {data.title ? (
            <p className="text-sm text-[var(--color-text-secondary)]">{data.title}</p>
          ) : (
            <p className="text-sm italic text-[var(--color-text-tertiary)]">Not provided</p>
          )}
        </div>

        {/* Table */}
        <ParetoTable categories={sorted} />

        {/* Bar chart */}
        {sorted.some((c) => c.count > 0) && (
          <ParetoBarChart categories={sorted} maxCount={maxCount} />
        )}

        {/* 80/20 indicator */}
        {eightyPctCategories.length > 0 && <EightyTwentyNote categories={eightyPctCategories} />}

        {/* Notes */}
        <div className="space-y-1">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Notes</span>
          {data.notes ? (
            <p className="whitespace-pre-wrap text-sm text-[var(--color-text-secondary)]">
              {data.notes}
            </p>
          ) : (
            <p className="text-sm italic text-[var(--color-text-tertiary)]">Not provided</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Enter each defect category or problem type with its count. Categories are automatically
        sorted by frequency and the 80/20 threshold is calculated.
      </p>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="paretoTitle">Analysis Title</Label>
        <Input
          id="paretoTitle"
          value={data.title}
          onChange={(e) => update({ ...data, title: e.target.value })}
          placeholder="e.g. Customer Complaint Categories Q1 2026"
        />
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Categories</Label>
          <p className="text-xs text-muted-foreground">Sorted by count (highest first)</p>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_100px_80px_80px_32px] gap-2 px-1">
          <span className="text-xs font-medium text-[var(--color-text-tertiary)]">
            Category Name
          </span>
          <span className="text-xs font-medium text-[var(--color-text-tertiary)]">Count</span>
          <span className="text-xs font-medium text-[var(--color-text-tertiary)]">%</span>
          <span className="text-xs font-medium text-[var(--color-text-tertiary)]">Cumulative</span>
          <span />
        </div>

        {sorted.map((cat) => (
          <div
            key={cat.id}
            className="grid grid-cols-[1fr_100px_80px_80px_32px] items-center gap-2"
          >
            <Input
              value={cat.name}
              onChange={(e) => updateCategory(cat.id, 'name', e.target.value)}
              placeholder="Category name..."
              className="text-sm"
            />
            <Input
              type="number"
              min={0}
              value={cat.count}
              onChange={(e) => updateCategory(cat.id, 'count', parseInt(e.target.value, 10) || 0)}
              className="text-sm"
            />
            <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
              {cat.percentage}%
            </div>
            <div
              className={cn(
                'flex h-9 items-center rounded-md border px-3 text-sm font-medium',
                cat.cumulative <= 80
                  ? 'border-[var(--color-step-2)] bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                  : 'border-input bg-muted text-muted-foreground',
              )}
            >
              {cat.cumulative}%
            </div>
            {data.categories.length > 1 ? (
              <Button variant="ghost" size="icon-xs" onClick={() => removeCategory(cat.id)}>
                <Trash2 className="size-3 text-muted-foreground" />
              </Button>
            ) : (
              <div className="size-8" />
            )}
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addCategory} className="gap-1.5">
          <Plus className="size-4" />
          Add Category
        </Button>
      </div>

      {/* Bar chart preview */}
      {sorted.some((c) => c.count > 0) && (
        <ParetoBarChart categories={sorted} maxCount={maxCount} />
      )}

      {/* 80/20 indicator */}
      {eightyPctCategories.length > 0 && <EightyTwentyNote categories={eightyPctCategories} />}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="paretoNotes">Notes</Label>
        <p className="text-xs text-muted-foreground">
          Observations, next steps, or context for this analysis.
        </p>
        <textarea
          id="paretoNotes"
          value={data.notes}
          onChange={(e) => update({ ...data, notes: e.target.value })}
          placeholder="e.g. The top 2 categories account for 78% of defects. Recommend focusing improvement efforts on..."
          rows={3}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
    </div>
  )
}

/* ---- Sub-components ---- */

const ParetoTable = ({ categories }: { categories: Category[] }) => {
  const hasData = categories.some((c) => c.name || c.count > 0)
  if (!hasData) {
    return <p className="text-sm italic text-[var(--color-text-tertiary)]">No categories added.</p>
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
            <th className="px-3 py-2 text-left font-medium text-[var(--color-text-primary)]">
              Category
            </th>
            <th className="px-3 py-2 text-right font-medium text-[var(--color-text-primary)]">
              Count
            </th>
            <th className="px-3 py-2 text-right font-medium text-[var(--color-text-primary)]">%</th>
            <th className="px-3 py-2 text-right font-medium text-[var(--color-text-primary)]">
              Cumulative
            </th>
          </tr>
        </thead>
        <tbody>
          {categories
            .filter((c) => c.name || c.count > 0)
            .map((cat, i) => (
              <tr key={cat.id} className="border-b border-[var(--color-border)] last:border-0">
                <td
                  className={cn(
                    'px-3 py-2',
                    i < 3
                      ? 'font-medium text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)]',
                  )}
                >
                  {cat.name || '—'}
                </td>
                <td className="px-3 py-2 text-right text-[var(--color-text-secondary)]">
                  {cat.count}
                </td>
                <td className="px-3 py-2 text-right text-[var(--color-text-secondary)]">
                  {cat.percentage}%
                </td>
                <td
                  className={cn(
                    'px-3 py-2 text-right font-medium',
                    cat.cumulative <= 80
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-[var(--color-text-tertiary)]',
                  )}
                >
                  {cat.cumulative}%
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

type ParetoBarChartProps = {
  categories: Category[]
  maxCount: number
}

const ParetoBarChart = ({ categories, maxCount }: ParetoBarChartProps) => {
  const withData = categories.filter((c) => c.name || c.count > 0)
  if (withData.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">
        Frequency Chart
      </p>
      <div className="space-y-1.5">
        {withData.map((cat, i) => (
          <div key={cat.id} className="flex items-center gap-2">
            <span className="w-36 shrink-0 truncate text-xs text-[var(--color-text-secondary)]">
              {cat.name || 'Unnamed'}
            </span>
            <div className="relative flex-1">
              <div
                className={cn(
                  'h-6 rounded-sm transition-all duration-300',
                  i === 0
                    ? 'bg-[var(--color-step-2)]'
                    : i === 1
                      ? 'bg-amber-400'
                      : i === 2
                        ? 'bg-amber-300'
                        : 'bg-amber-200 dark:bg-amber-800',
                )}
                style={{
                  width: maxCount > 0 ? `${(cat.count / maxCount) * 100}%` : '0%',
                  minWidth: cat.count > 0 ? '4px' : '0',
                }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-xs font-medium text-[var(--color-text-secondary)]">
              {cat.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const EightyTwentyNote = ({ categories }: { categories: string[] }) => (
  <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
    <span className="shrink-0 text-lg">80/20</span>
    <div>
      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
        Vital Few — 80% Rule
      </p>
      <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400">
        {categories.length === 1
          ? `"${categories[0]}" accounts for approximately 80% or more of occurrences.`
          : `"${categories.slice(0, -1).join('", "')}" and "${categories[categories.length - 1]}" together account for approximately 80% of occurrences.`}{' '}
        Focus improvement efforts here first.
      </p>
    </div>
  </div>
)
