'use client'

import { useState, useMemo } from 'react'
import {
  DollarSign,
  Clock,
  Target,
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle2,
  Minus,
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormShell } from '@/components/pips/form-shell'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { FormFieldView } from '@/components/pips/form-field-view'
import type { ImpactMetricsData, ResultsMetricsData } from '@/lib/form-schemas'
import { cn } from '@/lib/utils'

const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: '$',
  eur: '€',
  gbp: '£',
  other: '',
}

const DEFAULTS: ResultsMetricsData = {
  financialCostAfter: 0,
  financialSavingsAnnual: 0,
  timeWeeklyHoursAfter: 0,
  timeSavedWeeklyHours: 0,
  qualityDefectRateAfter: 0,
  qualityImprovement: 0,
  customerSatisfactionAfter: 0,
  roiPercent: 0,
  paybackPeriodMonths: null,
  projectCostEstimate: 0,
  notes: '',
}

type Props = {
  projectId: string
  stepNumber: number
  initialData: Record<string, unknown> | null
  impactMetricsData: Record<string, unknown> | null
}

/** Derive the ROI-related calculated fields from user inputs + baseline */
const deriveCalculations = (
  data: ResultsMetricsData,
  baseline: ImpactMetricsData | null,
): ResultsMetricsData => {
  const savingsAnnual = baseline
    ? Math.max(0, baseline.financialCostAnnual - data.financialCostAfter)
    : data.financialSavingsAnnual

  const timeSaved = baseline
    ? Math.max(0, baseline.timeWastedWeeklyHours - data.timeWeeklyHoursAfter)
    : data.timeSavedWeeklyHours

  const qualityImprovement = baseline
    ? parseFloat((baseline.qualityDefectRate - data.qualityDefectRateAfter).toFixed(2))
    : data.qualityImprovement

  const roiPercent =
    data.projectCostEstimate > 0
      ? parseFloat(
          (((savingsAnnual - data.projectCostEstimate) / data.projectCostEstimate) * 100).toFixed(
            1,
          ),
        )
      : 0

  const monthlySavings = savingsAnnual / 12
  const paybackPeriodMonths =
    monthlySavings > 0 && data.projectCostEstimate > 0
      ? parseFloat((data.projectCostEstimate / monthlySavings).toFixed(1))
      : null

  return {
    ...data,
    financialSavingsAnnual: savingsAnnual,
    timeSavedWeeklyHours: timeSaved,
    qualityImprovement,
    roiPercent,
    paybackPeriodMonths,
  }
}

export const ResultsMetricsForm = ({
  projectId,
  stepNumber,
  initialData,
  impactMetricsData,
}: Props) => {
  const baseline = impactMetricsData as ImpactMetricsData | null
  const currencySymbol = CURRENCY_SYMBOLS[baseline?.financialCostUnit ?? 'usd'] ?? ''

  const [data, setData] = useState<ResultsMetricsData>(() => {
    const merged: ResultsMetricsData = {
      ...DEFAULTS,
      ...(initialData as Partial<ResultsMetricsData>),
    }
    return deriveCalculations(merged, baseline)
  })

  const update = <K extends keyof ResultsMetricsData>(key: K, value: ResultsMetricsData[K]) => {
    setData((prev) => deriveCalculations({ ...prev, [key]: value }, baseline))
  }

  const roiStatus = useMemo(() => {
    if (data.roiPercent > 0) return 'positive'
    if (data.roiPercent === 0) return 'neutral'
    return 'negative'
  }, [data.roiPercent])

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="results_metrics"
      title="Results Metrics"
      description="Record post-improvement values. ROI, savings, and payback period are calculated automatically from your Step 1 baseline."
      data={data as unknown as Record<string, unknown>}
    >
      <ResultsMetricsFields
        data={data}
        update={update}
        baseline={baseline}
        currencySymbol={currencySymbol}
        roiStatus={roiStatus}
      />
    </FormShell>
  )
}

/* ---- Inner fields component ---- */

type FieldsProps = {
  data: ResultsMetricsData
  update: <K extends keyof ResultsMetricsData>(key: K, value: ResultsMetricsData[K]) => void
  baseline: ImpactMetricsData | null
  currencySymbol: string
  roiStatus: 'positive' | 'neutral' | 'negative'
}

const ResultsMetricsFields = ({
  data,
  update,
  baseline,
  currencySymbol,
  roiStatus,
}: FieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  if (isView) {
    return (
      <div className="space-y-6">
        <RoiSummaryCard
          data={data}
          baseline={baseline}
          currencySymbol={currencySymbol}
          roiStatus={roiStatus}
        />

        <Section icon={<DollarSign className="size-4" />} title="Financial">
          {baseline && (
            <BeforeAfterRow
              label="Annual Financial Cost"
              before={`${currencySymbol}${baseline.financialCostAnnual.toLocaleString()}`}
              after={`${currencySymbol}${data.financialCostAfter.toLocaleString()}`}
            />
          )}
          <FormFieldView
            label="Annual Savings"
            value={`${currencySymbol}${data.financialSavingsAnnual.toLocaleString()}`}
          />
          <FormFieldView
            label="Project Cost"
            value={`${currencySymbol}${data.projectCostEstimate.toLocaleString()}`}
          />
        </Section>

        <Section icon={<Clock className="size-4" />} title="Time">
          {baseline && (
            <BeforeAfterRow
              label="Weekly Hours Wasted"
              before={`${baseline.timeWastedWeeklyHours} hrs/week`}
              after={`${data.timeWeeklyHoursAfter} hrs/week`}
            />
          )}
          <FormFieldView
            label="Weekly Hours Saved"
            value={`${data.timeSavedWeeklyHours} hrs/week`}
          />
        </Section>

        <Section icon={<Target className="size-4" />} title="Quality">
          {baseline && (
            <BeforeAfterRow
              label="Defect Rate"
              before={`${baseline.qualityDefectRate} ${baseline.qualityDefectUnit}`}
              after={`${data.qualityDefectRateAfter} ${baseline.qualityDefectUnit}`}
            />
          )}
          {baseline && (
            <BeforeAfterRow
              label="Customer Satisfaction"
              before={`${baseline.customerSatisfactionBefore} / 10`}
              after={`${data.customerSatisfactionAfter} / 10`}
            />
          )}
        </Section>

        {data.notes && (
          <Section icon={<FileText className="size-4" />} title="Notes">
            <FormFieldView label="Additional Notes" value={data.notes} />
          </Section>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <RoiSummaryCard
        data={data}
        baseline={baseline}
        currencySymbol={currencySymbol}
        roiStatus={roiStatus}
      />

      {/* Financial */}
      <Section icon={<DollarSign className="size-4" />} title="Financial">
        {baseline && (
          <BaselineRow
            label="Baseline annual cost"
            value={`${currencySymbol}${baseline.financialCostAnnual.toLocaleString()}`}
          />
        )}
        <div>
          <Label htmlFor="financialCostAfter">Annual Financial Cost (after improvement)</Label>
          <Input
            id="financialCostAfter"
            type="number"
            min={0}
            step={100}
            value={data.financialCostAfter}
            onChange={(e) => update('financialCostAfter', parseFloat(e.target.value) || 0)}
            className="mt-1"
            placeholder="e.g. 15000"
          />
        </div>
        <ReadOnlyMetric
          label="Annual Savings (auto-calculated)"
          value={`${currencySymbol}${data.financialSavingsAnnual.toLocaleString()}`}
          positive={data.financialSavingsAnnual > 0}
        />
        <div>
          <Label htmlFor="projectCostEstimate">Project Cost (total investment to implement)</Label>
          <Input
            id="projectCostEstimate"
            type="number"
            min={0}
            step={100}
            value={data.projectCostEstimate}
            onChange={(e) => update('projectCostEstimate', parseFloat(e.target.value) || 0)}
            className="mt-1"
            placeholder="e.g. 20000"
          />
        </div>
      </Section>

      {/* Time */}
      <Section icon={<Clock className="size-4" />} title="Time">
        {baseline && (
          <BaselineRow
            label="Baseline weekly hours wasted"
            value={`${baseline.timeWastedWeeklyHours} hrs/week`}
          />
        )}
        <div>
          <Label htmlFor="timeWeeklyHoursAfter">Weekly Hours Wasted (after improvement)</Label>
          <Input
            id="timeWeeklyHoursAfter"
            type="number"
            min={0}
            step={0.5}
            value={data.timeWeeklyHoursAfter}
            onChange={(e) => update('timeWeeklyHoursAfter', parseFloat(e.target.value) || 0)}
            className="mt-1"
            placeholder="e.g. 2"
          />
        </div>
        <ReadOnlyMetric
          label="Weekly Hours Saved (auto-calculated)"
          value={`${data.timeSavedWeeklyHours} hrs/week`}
          positive={data.timeSavedWeeklyHours > 0}
        />
      </Section>

      {/* Quality */}
      <Section icon={<Target className="size-4" />} title="Quality">
        {baseline && (
          <BaselineRow
            label="Baseline defect rate"
            value={`${baseline.qualityDefectRate} ${baseline.qualityDefectUnit}`}
          />
        )}
        <div>
          <Label htmlFor="qualityDefectRateAfter">Defect Rate (after improvement)</Label>
          <Input
            id="qualityDefectRateAfter"
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={data.qualityDefectRateAfter}
            onChange={(e) => update('qualityDefectRateAfter', parseFloat(e.target.value) || 0)}
            className="mt-1"
            placeholder="e.g. 3.5"
          />
        </div>
        <ReadOnlyMetric
          label={`Quality Improvement (auto-calculated, ${baseline?.qualityDefectUnit ?? '% defect rate'})`}
          value={`${data.qualityImprovement >= 0 ? '+' : ''}${data.qualityImprovement}`}
          positive={data.qualityImprovement > 0}
        />

        {baseline && (
          <BaselineRow
            label="Baseline customer satisfaction"
            value={`${baseline.customerSatisfactionBefore} / 10`}
          />
        )}
        <div>
          <Label htmlFor="customerSatisfactionAfter">Customer Satisfaction (0–10, after)</Label>
          <Input
            id="customerSatisfactionAfter"
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={data.customerSatisfactionAfter}
            onChange={(e) => update('customerSatisfactionAfter', parseFloat(e.target.value) || 0)}
            className="mt-1"
            placeholder="e.g. 8.5"
          />
        </div>
      </Section>

      {/* Notes */}
      <Section icon={<FileText className="size-4" />} title="Notes">
        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={data.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={3}
            placeholder="Any additional context about these results..."
            className="mt-1"
          />
        </div>
      </Section>
    </div>
  )
}

/* ---- ROI Summary Card ---- */

type RoiSummaryCardProps = {
  data: ResultsMetricsData
  baseline: ImpactMetricsData | null
  currencySymbol: string
  roiStatus: 'positive' | 'neutral' | 'negative'
}

const RoiSummaryCard = ({ data, baseline, currencySymbol, roiStatus }: RoiSummaryCardProps) => {
  const statusConfig = {
    positive: {
      icon: <CheckCircle2 className="size-5 text-[var(--color-success)]" />,
      badge: 'Positive ROI',
      badgeClass:
        'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
      borderClass: 'border-[var(--color-success)]/30',
    },
    neutral: {
      icon: <Minus className="size-5 text-[var(--color-warning)]" />,
      badge: 'Break-even',
      badgeClass:
        'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20',
      borderClass: 'border-[var(--color-warning)]/30',
    },
    negative: {
      icon: <AlertCircle className="size-5 text-[var(--color-error)]" />,
      badge: 'Negative ROI',
      badgeClass:
        'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20',
      borderClass: 'border-[var(--color-error)]/30',
    },
  }[roiStatus]

  const hasData = data.projectCostEstimate > 0 || data.financialSavingsAnnual > 0

  return (
    <Card
      className={cn(
        'border-2',
        hasData ? statusConfig.borderClass : 'border-[var(--color-border)]',
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-[var(--color-step-6)]" />
            ROI Summary
          </CardTitle>
          {hasData && (
            <Badge variant="outline" className={cn('text-xs', statusConfig.badgeClass)}>
              {statusConfig.icon}
              <span className="ml-1">{statusConfig.badge}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <RoiStat
            label="Annual Savings"
            value={`${currencySymbol}${data.financialSavingsAnnual.toLocaleString()}`}
            positive={data.financialSavingsAnnual > 0}
          />
          <RoiStat
            label="ROI"
            value={`${data.roiPercent >= 0 ? '+' : ''}${data.roiPercent}%`}
            positive={data.roiPercent > 0}
          />
          <RoiStat
            label="Payback Period"
            value={data.paybackPeriodMonths !== null ? `${data.paybackPeriodMonths} mo` : '—'}
            positive={data.paybackPeriodMonths !== null && data.paybackPeriodMonths < 12}
          />
          <RoiStat
            label="Hours Saved/Week"
            value={`${data.timeSavedWeeklyHours} hrs`}
            positive={data.timeSavedWeeklyHours > 0}
          />
        </div>
        {!baseline && (
          <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
            Fill out the Impact Metrics form in Step 1 to enable automatic before/after comparison.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

const RoiStat = ({
  label,
  value,
  positive,
}: {
  label: string
  value: string
  positive: boolean
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-[var(--color-text-tertiary)]">{label}</span>
    <span
      className={cn(
        'text-lg font-semibold',
        positive ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]',
      )}
    >
      {value}
    </span>
  </div>
)

/* ---- Helper sub-components ---- */

const BaselineRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-[var(--radius-sm)] bg-[var(--color-surface-secondary)] px-3 py-2 text-sm">
    <span className="text-[var(--color-text-tertiary)]">{label}</span>
    <span className="font-medium text-[var(--color-text-secondary)]">{value}</span>
  </div>
)

const ReadOnlyMetric = ({
  label,
  value,
  positive,
}: {
  label: string
  value: string
  positive: boolean
}) => (
  <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border)] px-3 py-2 text-sm">
    <span className="text-[var(--color-text-secondary)]">{label}</span>
    <span
      className={cn(
        'font-semibold',
        positive ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]',
      )}
    >
      {value}
    </span>
  </div>
)

const BeforeAfterRow = ({
  label,
  before,
  after,
}: {
  label: string
  before: string
  after: string
}) => (
  <div className="space-y-1">
    <span className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</span>
    <div className="flex items-center gap-3 text-sm">
      <span className="rounded bg-[var(--color-error)]/10 px-2 py-0.5 text-[var(--color-error)]">
        Before: {before}
      </span>
      <span className="text-[var(--color-text-tertiary)]">→</span>
      <span className="rounded bg-[var(--color-success)]/10 px-2 py-0.5 text-[var(--color-success)]">
        After: {after}
      </span>
    </div>
  </div>
)

/* ---- Section wrapper ---- */

type SectionProps = {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

const Section = ({ icon, title, children }: SectionProps) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
      <span className="text-[var(--color-step-6)]">{icon}</span>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
    </div>
    {children}
  </div>
)
