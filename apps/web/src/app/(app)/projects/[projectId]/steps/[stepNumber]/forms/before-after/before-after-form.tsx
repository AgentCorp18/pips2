'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FormShell } from '@/components/pips/form-shell'
import { FormTextarea } from '@/components/pips/form-textarea'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { FormFieldView, FormInlineView } from '@/components/pips/form-field-view'
import { saveFormData } from '../actions'
import type { BeforeAfterData } from '@/lib/form-schemas'

type Props = {
  projectId: string
  initialData: BeforeAfterData | null
  /** Problem statement from Step 1, used as context for before/after comparison */
  problemStatementFromStep1?: string
}

const defaultData: BeforeAfterData = {
  metrics: [{ name: '', before: '', after: '', unit: '', improvement: '' }],
  summary: '',
}

const calcImprovement = (before: string, after: string, unit: string): string => {
  const bNum = parseFloat(before)
  const aNum = parseFloat(after)
  if (isNaN(bNum) || isNaN(aNum) || bNum === 0) return ''
  const diff = aNum - bNum
  const pct = ((diff / Math.abs(bNum)) * 100).toFixed(1)
  const sign = diff > 0 ? '+' : ''
  return `${sign}${diff}${unit ? ` ${unit}` : ''} (${sign}${pct}%)`
}

export const BeforeAfterForm = ({ projectId, initialData, problemStatementFromStep1 }: Props) => {
  const [data, setData] = useState<BeforeAfterData>(initialData ?? defaultData)
  const [dirty, setDirty] = useState(false)

  const update = (next: BeforeAfterData) => {
    setData(next)
    setDirty(true)
  }

  const handleSave = useCallback(async () => {
    const result = await saveFormData(
      projectId,
      6,
      'before_after',
      data as unknown as Record<string, unknown>,
    )
    if (result.error) {
      toast.error(result.error)
      return { error: result.error }
    }
    setDirty(false)
    return { success: true }
  }, [projectId, data])

  const addMetric = () => {
    update({
      ...data,
      metrics: [...data.metrics, { name: '', before: '', after: '', unit: '', improvement: '' }],
    })
  }

  const removeMetric = (idx: number) => {
    update({ ...data, metrics: data.metrics.filter((_, i) => i !== idx) })
  }

  const updateMetric = (idx: number, field: string, value: string) => {
    const next = data.metrics.map((m, i) => {
      if (i !== idx) return m
      const updated = { ...m, [field]: value }
      // Auto-calculate improvement when before/after change
      if (field === 'before' || field === 'after' || field === 'unit') {
        const auto = calcImprovement(
          field === 'before' ? value : updated.before,
          field === 'after' ? value : updated.after,
          field === 'unit' ? value : updated.unit,
        )
        if (auto) updated.improvement = auto
      }
      return updated
    })
    update({ ...data, metrics: next })
  }

  const getImprovementIcon = (before: string, after: string) => {
    const bNum = parseFloat(before)
    const aNum = parseFloat(after)
    if (isNaN(bNum) || isNaN(aNum)) return <Minus className="size-4 text-muted-foreground" />
    if (aNum > bNum) return <TrendingUp className="size-4 text-[var(--color-success)]" />
    if (aNum < bNum) return <TrendingDown className="size-4 text-[var(--color-error)]" />
    return <Minus className="size-4 text-muted-foreground" />
  }

  return (
    <FormShell
      title="Before & After Comparison"
      description="Compare baseline metrics with post-implementation results to measure impact."
      stepNumber={6}
      onSave={handleSave}
      isDirty={dirty}
    >
      {problemStatementFromStep1 && (
        <div
          className="mb-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-4 py-3"
          data-testid="step1-context-banner"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1">
            Problem Statement (from Step 1)
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">{problemStatementFromStep1}</p>
        </div>
      )}
      <BeforeAfterFields
        data={data}
        update={update}
        updateMetric={updateMetric}
        addMetric={addMetric}
        removeMetric={removeMetric}
        getImprovementIcon={getImprovementIcon}
      />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type BeforeAfterFieldsProps = {
  data: BeforeAfterData
  update: (next: BeforeAfterData) => void
  updateMetric: (idx: number, field: string, value: string) => void
  addMetric: () => void
  removeMetric: (idx: number) => void
  getImprovementIcon: (before: string, after: string) => React.ReactNode
}

const BeforeAfterFields = ({
  data,
  update,
  updateMetric,
  addMetric,
  removeMetric,
  getImprovementIcon,
}: BeforeAfterFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {isView
          ? 'Baseline vs. post-implementation comparison.'
          : 'For each metric, enter the baseline (before) and current (after) values. The improvement will be auto-calculated when both values are numeric.'}
      </p>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px]">Metric</TableHead>
              <TableHead className="min-w-[100px]">Unit</TableHead>
              <TableHead className="min-w-[120px]">Before</TableHead>
              <TableHead className="w-8" />
              <TableHead className="min-w-[120px]">After</TableHead>
              <TableHead className="min-w-[160px]">Improvement</TableHead>
              {!isView && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.metrics.map((metric, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  {isView ? (
                    <FormInlineView
                      value={metric.name}
                      placeholder="Unnamed metric"
                      className="text-xs font-medium text-[var(--color-text-primary)]"
                    />
                  ) : (
                    <Input
                      value={metric.name}
                      onChange={(e) => updateMetric(idx, 'name', e.target.value)}
                      placeholder="e.g., Processing Time"
                      className="h-7 text-xs"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {isView ? (
                    <FormInlineView
                      value={metric.unit}
                      className="text-xs text-[var(--color-text-tertiary)]"
                    />
                  ) : (
                    <Input
                      value={metric.unit}
                      onChange={(e) => updateMetric(idx, 'unit', e.target.value)}
                      placeholder="e.g., min"
                      className="h-7 w-20 text-xs"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {isView ? (
                    <FormInlineView
                      value={metric.before}
                      placeholder="-"
                      className="text-xs text-[var(--color-text-secondary)]"
                    />
                  ) : (
                    <Input
                      value={metric.before}
                      onChange={(e) => updateMetric(idx, 'before', e.target.value)}
                      placeholder="Baseline"
                      className="h-7 text-xs"
                    />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <ArrowRight className="mx-auto size-4 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  {isView ? (
                    <FormInlineView
                      value={metric.after}
                      placeholder="-"
                      className="text-xs text-[var(--color-text-secondary)]"
                    />
                  ) : (
                    <Input
                      value={metric.after}
                      onChange={(e) => updateMetric(idx, 'after', e.target.value)}
                      placeholder="Current"
                      className="h-7 text-xs"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getImprovementIcon(metric.before, metric.after)}
                    {isView ? (
                      <FormInlineView
                        value={metric.improvement}
                        placeholder="N/A"
                        className="text-xs text-[var(--color-text-secondary)]"
                      />
                    ) : (
                      <Input
                        value={metric.improvement}
                        onChange={(e) => updateMetric(idx, 'improvement', e.target.value)}
                        placeholder="Auto-calculated"
                        className="h-7 text-xs"
                      />
                    )}
                  </div>
                </TableCell>
                {!isView && (
                  <TableCell>
                    {data.metrics.length > 1 && (
                      <Button variant="ghost" size="icon-xs" onClick={() => removeMetric(idx)}>
                        <Trash2 className="size-3 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!isView && (
        <Button variant="outline" size="sm" onClick={addMetric}>
          <Plus className="size-4" />
          Add Metric
        </Button>
      )}

      {/* Summary */}
      {isView ? (
        <FormFieldView
          label="Summary"
          value={data.summary}
          helperText="Overall improvement and key takeaways from the data."
        />
      ) : (
        <FormTextarea
          id="summary"
          label="Summary"
          value={data.summary}
          onChange={(v) => update({ ...data, summary: v })}
          placeholder="Describe the overall results and what the data shows..."
          helperText="Summarize the overall improvement and key takeaways from the data."
          rows={4}
          aiFieldType="before_after_summary"
          aiContext={`Metrics comparison: ${
            data.metrics
              .filter((m) => m.name)
              .map(
                (m) =>
                  `${m.name}: before=${m.before}${m.unit ? ' ' + m.unit : ''}, after=${m.after}${m.unit ? ' ' + m.unit : ''}, improvement=${m.improvement}`,
              )
              .join('; ') || 'no metrics defined'
          }.`}
        />
      )}
    </div>
  )
}
