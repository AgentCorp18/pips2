'use client'

import { useCallback, useState } from 'react'
import { FormShell } from '@/components/pips/form-shell'
import { FormTextarea } from '@/components/pips/form-textarea'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { FormSelectView, FormTagListView } from '@/components/pips/form-field-view'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X, TrendingDown, TrendingUp, DollarSign, Clock, Target } from 'lucide-react'
import type { ProblemStatementData, MeasurableRow } from '@/lib/form-schemas'
import { cn } from '@/lib/utils'

const PROBLEM_AREAS = [
  { value: 'quality', label: 'Quality' },
  { value: 'cost', label: 'Cost' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'safety', label: 'Safety' },
  { value: 'morale', label: 'Morale' },
]

const UNIT_OPTIONS = [
  { value: 'hours/week', label: 'hours/week' },
  { value: 'hours/month', label: 'hours/month' },
  { value: 'hours/day', label: 'hours/day' },
  { value: '$/year', label: '$/year' },
  { value: '$/month', label: '$/month' },
  { value: '$/quarter', label: '$/quarter' },
  { value: '%', label: '%' },
  { value: 'count', label: 'count' },
  { value: 'days', label: 'days' },
  { value: 'defects/month', label: 'defects/month' },
  { value: 'custom', label: 'custom' },
]

const DEFAULTS: ProblemStatementData = {
  asIs: '',
  desired: '',
  gap: '',
  problemStatement: '',
  teamMembers: [],
  problemArea: '',
  dataSources: [],
  measurables: [],
  hourlyRate: 75,
}

type Props = {
  projectId: string
  stepNumber: number
  initialData: Record<string, unknown> | null
}

export const ProblemStatementForm = ({ projectId, stepNumber, initialData }: Props) => {
  const [data, setData] = useState<ProblemStatementData>({
    ...DEFAULTS,
    ...(initialData as Partial<ProblemStatementData>),
  })

  const update = useCallback(
    <K extends keyof ProblemStatementData>(key: K, value: ProblemStatementData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="problem_statement"
      title="Problem Statement"
      description="Define the current state, desired state, and the gap between them to craft a clear problem statement."
      required
      data={data as unknown as Record<string, unknown>}
    >
      <ProblemStatementFields data={data} update={update} />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

const ProblemStatementFields = ({
  data,
  update,
}: {
  data: ProblemStatementData
  update: <K extends keyof ProblemStatementData>(key: K, value: ProblemStatementData[K]) => void
}) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  return (
    <div className="space-y-6">
      {/* As-Is State */}
      <FormTextarea
        id="asIs"
        label="Current State (As-Is)"
        value={data.asIs}
        onChange={(v) => update('asIs', v)}
        placeholder="Describe how things work today..."
        helperText="What is the current state of the process? Be specific with numbers and observations."
        rows={4}
        aiFieldType="as_is_state"
        aiContext={`Problem area: ${data.problemArea || 'not yet selected'}. Team members: ${data.teamMembers.length > 0 ? data.teamMembers.join(', ') : 'none listed'}. Data sources: ${data.dataSources.length > 0 ? data.dataSources.join(', ') : 'none listed'}.`}
      />

      {/* Desired State */}
      <FormTextarea
        id="desired"
        label="Desired State"
        value={data.desired}
        onChange={(v) => update('desired', v)}
        placeholder="Describe what success looks like..."
        helperText="What would the ideal outcome look like? Include measurable targets."
        rows={4}
        aiFieldType="desired_state"
        aiContext={`Problem area: ${data.problemArea || 'not yet selected'}. Current state (as-is): ${data.asIs || 'not yet defined'}.`}
      />

      {/* Gap */}
      <FormTextarea
        id="gap"
        label="Gap Analysis"
        value={data.gap}
        onChange={(v) => update('gap', v)}
        placeholder="What is the difference between current and desired?"
        helperText="Clearly articulate the gap. This helps frame the problem."
        rows={3}
        aiFieldType="gap_analysis"
        aiContext={`Problem area: ${data.problemArea || 'not yet selected'}. Current state (as-is): ${data.asIs || 'not yet defined'}. Desired state: ${data.desired || 'not yet defined'}.`}
      />

      {/* Problem Statement */}
      <FormTextarea
        id="problemStatement"
        label="Problem Statement"
        value={data.problemStatement}
        onChange={(v) => update('problemStatement', v)}
        placeholder="Summarize the problem in one or two clear sentences..."
        helperText="Combine the As-Is, Desired State, and Gap into a concise, measurable statement."
        rows={3}
        required
        aiFieldType="final_problem_statement"
        aiContext={`Problem area: ${data.problemArea || 'not yet selected'}. Current state (as-is): ${data.asIs || 'not yet defined'}. Desired state: ${data.desired || 'not yet defined'}. Gap analysis: ${data.gap || 'not yet defined'}. Team members: ${data.teamMembers.length > 0 ? data.teamMembers.join(', ') : 'none listed'}.`}
      />

      {/* Key Measurables */}
      <MeasurablesSection
        measurables={data.measurables}
        hourlyRate={data.hourlyRate}
        onMeasurablesChange={(v) => update('measurables', v)}
        onHourlyRateChange={(v) => update('hourlyRate', v)}
        isView={isView}
      />

      {/* Problem Area */}
      {isView ? (
        <FormSelectView
          label="Problem Area"
          value={data.problemArea}
          options={PROBLEM_AREAS}
          helperText="Which category does this problem fall into?"
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="problemArea">Problem Area</Label>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Which category does this problem fall into?
          </p>
          <Select value={data.problemArea} onValueChange={(v) => update('problemArea', v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {PROBLEM_AREAS.map((area) => (
                <SelectItem key={area.value} value={area.value}>
                  {area.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Team Members */}
      {isView ? (
        <FormTagListView
          label="Team Members"
          values={data.teamMembers}
          helperText="Who is involved in investigating this problem?"
        />
      ) : (
        <TagListField
          label="Team Members"
          helperText="Who is involved in investigating this problem?"
          placeholder="Add a team member name..."
          values={data.teamMembers}
          onChange={(v) => update('teamMembers', v)}
        />
      )}

      {/* Data Sources */}
      {isView ? (
        <FormTagListView
          label="Data Sources"
          values={data.dataSources}
          helperText="What data confirms this problem exists?"
        />
      ) : (
        <TagListField
          label="Data Sources"
          helperText="What data confirms this problem exists?"
          placeholder="e.g. Monthly KPI reports, Customer feedback..."
          values={data.dataSources}
          onChange={(v) => update('dataSources', v)}
        />
      )}
    </div>
  )
}

/* ---- Measurables Section ---- */

type MeasurablesSectionProps = {
  measurables: MeasurableRow[]
  hourlyRate: number
  onMeasurablesChange: (rows: MeasurableRow[]) => void
  onHourlyRateChange: (rate: number) => void
  isView: boolean
}

const MeasurablesSection = ({
  measurables,
  hourlyRate,
  onMeasurablesChange,
  onHourlyRateChange,
  isView,
}: MeasurablesSectionProps) => {
  const addRow = () => {
    const newRow: MeasurableRow = {
      id: crypto.randomUUID(),
      metric: '',
      unit: 'hours/week',
      direction: 'decrease',
      asIsValue: 0,
      targetValue: 0,
    }
    onMeasurablesChange([...measurables, newRow])
  }

  const updateRow = (
    id: string,
    field: keyof MeasurableRow,
    value: MeasurableRow[keyof MeasurableRow],
  ) => {
    onMeasurablesChange(
      measurables.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  const deleteRow = (id: string) => {
    onMeasurablesChange(measurables.filter((row) => row.id !== id))
  }

  const savings = computeSavings(measurables, hourlyRate)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
        <span className="text-[var(--color-step-1)]">
          <Target className="size-4" />
        </span>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Key Measurables</h3>
      </div>
      <p className="text-xs text-[var(--color-text-tertiary)]">
        Define specific metrics you will track from current state to target. These flow directly
        into your Step 6 results comparison.
      </p>

      {measurables.length === 0 && isView ? (
        <p className="text-sm text-[var(--color-text-tertiary)] italic">No measurables defined.</p>
      ) : (
        <>
          {/* Table header */}
          {measurables.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="pb-2 pr-2 text-left text-xs font-medium text-[var(--color-text-tertiary)]">
                      Metric
                    </th>
                    <th className="pb-2 pr-2 text-left text-xs font-medium text-[var(--color-text-tertiary)]">
                      Unit
                    </th>
                    <th className="pb-2 pr-2 text-left text-xs font-medium text-[var(--color-text-tertiary)]">
                      Direction
                    </th>
                    <th className="pb-2 pr-2 text-right text-xs font-medium text-[var(--color-text-tertiary)]">
                      As-Is
                    </th>
                    <th className="pb-2 pr-2 text-right text-xs font-medium text-[var(--color-text-tertiary)]">
                      Target
                    </th>
                    <th className="pb-2 pr-2 text-right text-xs font-medium text-[var(--color-text-tertiary)]">
                      Delta
                    </th>
                    <th className="pb-2 pr-2 text-right text-xs font-medium text-[var(--color-text-tertiary)]">
                      % Change
                    </th>
                    {!isView && (
                      <th className="pb-2 text-right text-xs font-medium text-[var(--color-text-tertiary)]" />
                    )}
                  </tr>
                </thead>
                <tbody>
                  {measurables.map((row, idx) => {
                    const delta = Math.abs(row.asIsValue - row.targetValue)
                    const pctChange =
                      row.asIsValue !== 0
                        ? Math.abs(((row.targetValue - row.asIsValue) / row.asIsValue) * 100)
                        : 0
                    const isImprovement =
                      row.direction === 'decrease'
                        ? row.targetValue < row.asIsValue
                        : row.targetValue > row.asIsValue

                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          'border-b border-[var(--color-border)] last:border-0',
                          idx % 2 === 0
                            ? 'bg-transparent'
                            : 'bg-[var(--color-surface-secondary)]/50',
                        )}
                      >
                        <td className="py-2 pr-2">
                          {isView ? (
                            <span className="font-medium">{row.metric || '—'}</span>
                          ) : (
                            <Input
                              value={row.metric}
                              onChange={(e) => updateRow(row.id, 'metric', e.target.value)}
                              placeholder="e.g. Processing time"
                              className="h-8 text-sm"
                            />
                          )}
                        </td>
                        <td className="py-2 pr-2">
                          {isView ? (
                            <span className="text-[var(--color-text-secondary)]">{row.unit}</span>
                          ) : (
                            <Select
                              value={row.unit}
                              onValueChange={(v) => updateRow(row.id, 'unit', v)}
                            >
                              <SelectTrigger className="h-8 w-[130px] text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {UNIT_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </td>
                        <td className="py-2 pr-2">
                          {isView ? (
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                                row.direction === 'decrease'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-emerald-50 text-emerald-700',
                              )}
                            >
                              {row.direction === 'decrease' ? (
                                <TrendingDown className="size-3" />
                              ) : (
                                <TrendingUp className="size-3" />
                              )}
                              {row.direction}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                updateRow(
                                  row.id,
                                  'direction',
                                  row.direction === 'decrease' ? 'increase' : 'decrease',
                                )
                              }
                              className={cn(
                                'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors',
                                row.direction === 'decrease'
                                  ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                              )}
                            >
                              {row.direction === 'decrease' ? (
                                <TrendingDown className="size-3" />
                              ) : (
                                <TrendingUp className="size-3" />
                              )}
                              {row.direction === 'decrease' ? 'Decrease' : 'Increase'}
                            </button>
                          )}
                        </td>
                        <td className="py-2 pr-2 text-right">
                          {isView ? (
                            <span>{row.asIsValue}</span>
                          ) : (
                            <Input
                              type="number"
                              value={row.asIsValue}
                              onChange={(e) =>
                                updateRow(row.id, 'asIsValue', parseFloat(e.target.value) || 0)
                              }
                              className="h-8 w-20 text-right text-sm"
                            />
                          )}
                        </td>
                        <td className="py-2 pr-2 text-right">
                          {isView ? (
                            <span>{row.targetValue}</span>
                          ) : (
                            <Input
                              type="number"
                              value={row.targetValue}
                              onChange={(e) =>
                                updateRow(row.id, 'targetValue', parseFloat(e.target.value) || 0)
                              }
                              className="h-8 w-20 text-right text-sm"
                            />
                          )}
                        </td>
                        <td className="py-2 pr-2 text-right">
                          <span
                            className={cn(
                              'font-medium',
                              isImprovement
                                ? 'text-[var(--color-success)]'
                                : 'text-[var(--color-error)]',
                            )}
                          >
                            {delta.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-2 pr-2 text-right">
                          <span
                            className={cn(
                              'font-medium',
                              isImprovement
                                ? 'text-[var(--color-success)]'
                                : 'text-[var(--color-error)]',
                            )}
                          >
                            {pctChange.toFixed(1)}%
                          </span>
                        </td>
                        {!isView && (
                          <td className="py-2 text-right">
                            <button
                              type="button"
                              onClick={() => deleteRow(row.id)}
                              className="rounded p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]"
                              aria-label={`Remove ${row.metric || 'measurable'} row`}
                            >
                              <X className="size-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!isView && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              className="w-fit gap-1.5"
            >
              <Plus className="size-3.5" />
              Add Measurable
            </Button>
          )}
        </>
      )}

      {/* Projected Savings Summary Card */}
      {savings.hasData && (
        <ProjectedSavingsCard
          savings={savings}
          hourlyRate={hourlyRate}
          isView={isView}
          onHourlyRateChange={onHourlyRateChange}
        />
      )}

      {/* Hourly rate input shown even without savings when not view mode and there are measurables */}
      {!isView && !savings.hasData && measurables.length > 0 && (
        <div className="flex items-center gap-3">
          <Label htmlFor="hourlyRate" className="shrink-0 text-xs">
            Hourly rate ($/hr)
          </Label>
          <Input
            id="hourlyRate"
            type="number"
            min={0}
            step={5}
            value={hourlyRate}
            onChange={(e) => onHourlyRateChange(parseFloat(e.target.value) || 0)}
            className="h-7 w-24 text-sm"
          />
        </div>
      )}
    </div>
  )
}

/* ---- Savings computation ---- */

type SavingsResult = {
  hasData: boolean
  hoursPerWeek: number
  hoursPerYear: number
  laborValueAnnual: number
  costSavingsAnnual: number
  percentagePointImprovement: number
  totalProjectedAnnual: number
}

const computeSavings = (measurables: MeasurableRow[], hourlyRate: number): SavingsResult => {
  let hoursPerWeek = 0
  let costSavingsAnnual = 0
  let percentagePointImprovement = 0
  let hasData = false

  for (const row of measurables) {
    const delta =
      row.direction === 'decrease'
        ? row.asIsValue - row.targetValue
        : row.targetValue - row.asIsValue

    if (delta <= 0) continue
    hasData = true

    if (row.unit === 'hours/week') {
      hoursPerWeek += delta
    } else if (row.unit === 'hours/month') {
      hoursPerWeek += delta / 4.33
    } else if (row.unit === 'hours/day') {
      hoursPerWeek += delta * 5
    } else if (row.unit === '$/year') {
      costSavingsAnnual += delta
    } else if (row.unit === '$/month') {
      costSavingsAnnual += delta * 12
    } else if (row.unit === '$/quarter') {
      costSavingsAnnual += delta * 4
    } else if (row.unit === '%') {
      percentagePointImprovement += delta
    }
  }

  const hoursPerYear = hoursPerWeek * 52
  const laborValueAnnual = hoursPerYear * hourlyRate
  const totalProjectedAnnual = laborValueAnnual + costSavingsAnnual

  return {
    hasData,
    hoursPerWeek,
    hoursPerYear,
    laborValueAnnual,
    costSavingsAnnual,
    percentagePointImprovement,
    totalProjectedAnnual,
  }
}

/* ---- Projected Savings Card ---- */

type ProjectedSavingsCardProps = {
  savings: SavingsResult
  hourlyRate: number
  isView: boolean
  onHourlyRateChange: (rate: number) => void
}

const ProjectedSavingsCard = ({
  savings,
  hourlyRate,
  isView,
  onHourlyRateChange,
}: ProjectedSavingsCardProps) => {
  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="flex items-center gap-2 text-base text-emerald-800">
          <DollarSign className="size-4 text-emerald-600" />
          Projected Annual Value
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {savings.hoursPerWeek > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Time Savings</span>
              </div>
              <p className="text-xl font-bold text-emerald-800">
                {savings.hoursPerWeek.toFixed(1)} hrs/wk
              </p>
              <p className="text-xs text-emerald-600">{fmt(savings.hoursPerYear)} hrs/year</p>
            </div>
          )}

          {savings.hoursPerWeek > 0 && hourlyRate > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <DollarSign className="size-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Labor Value</span>
              </div>
              <p className="text-xl font-bold text-emerald-800">
                ${fmt(savings.laborValueAnnual)}/yr
              </p>
              <p className="text-xs text-emerald-600">At ${hourlyRate}/hr</p>
            </div>
          )}

          {savings.costSavingsAnnual > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <DollarSign className="size-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Cost Savings</span>
              </div>
              <p className="text-xl font-bold text-emerald-800">
                ${fmt(savings.costSavingsAnnual)}/yr
              </p>
            </div>
          )}

          {savings.percentagePointImprovement > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Quality Gain</span>
              </div>
              <p className="text-xl font-bold text-emerald-800">
                +{savings.percentagePointImprovement.toFixed(1)} pp
              </p>
              <p className="text-xs text-emerald-600">percentage point improvement</p>
            </div>
          )}
        </div>

        {savings.totalProjectedAnnual > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-white/60 px-4 py-3">
            <span className="text-sm font-semibold text-emerald-800">
              Total Projected Annual Value
            </span>
            <span className="text-2xl font-bold text-emerald-700">
              ${fmt(savings.totalProjectedAnnual)}
            </span>
          </div>
        )}

        {!isView && (
          <div className="mt-3 flex items-center gap-2">
            <Label htmlFor="hourlyRateCard" className="shrink-0 text-xs text-emerald-700">
              Hourly rate ($/hr):
            </Label>
            <Input
              id="hourlyRateCard"
              type="number"
              min={0}
              step={5}
              value={hourlyRate}
              onChange={(e) => onHourlyRateChange(parseFloat(e.target.value) || 0)}
              className="h-7 w-24 border-emerald-200 bg-white/80 text-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ---- Reusable tag list input ---- */

type TagListFieldProps = {
  label: string
  helperText?: string
  placeholder?: string
  values: string[]
  onChange: (values: string[]) => void
}

const TagListField = ({ label, helperText, placeholder, values, onChange }: TagListFieldProps) => {
  const [inputValue, setInputValue] = useState('')

  const addItem = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || values.includes(trimmed)) return
    onChange([...values, trimmed])
    setInputValue('')
  }

  const removeItem = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {helperText && <p className="text-xs text-[var(--color-text-tertiary)]">{helperText}</p>}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addItem()
            }
          }}
        />
        <Button type="button" variant="outline" size="default" onClick={addItem}>
          <Plus size={14} />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {values.map((item, i) => (
            <Badge key={i} variant="secondary" className="gap-1 pr-1">
              {item}
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-black/10"
              >
                <X size={10} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
