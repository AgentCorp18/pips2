'use client'

import { useState } from 'react'
import { DollarSign, Clock, Target, Users, FileText } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormShell } from '@/components/pips/form-shell'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { FormFieldView } from '@/components/pips/form-field-view'
import type { ImpactMetricsData } from '@/lib/form-schemas'

const CURRENCY_LABELS: Record<string, string> = {
  usd: 'USD ($)',
  eur: 'EUR (€)',
  gbp: 'GBP (£)',
  other: 'Other',
}

const DEFAULTS: ImpactMetricsData = {
  financialCostAnnual: 0,
  financialCostUnit: 'usd',
  timeWastedWeeklyHours: 0,
  qualityDefectRate: 0,
  qualityDefectUnit: '% defect rate',
  customerSatisfactionBefore: 0,
  employeesAffected: 0,
  notes: '',
}

type Props = {
  projectId: string
  stepNumber: number
  initialData: Record<string, unknown> | null
}

export const ImpactMetricsForm = ({ projectId, stepNumber, initialData }: Props) => {
  const [data, setData] = useState<ImpactMetricsData>(() => ({
    ...DEFAULTS,
    ...(initialData as Partial<ImpactMetricsData>),
  }))

  const update = <K extends keyof ImpactMetricsData>(key: K, value: ImpactMetricsData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="impact_metrics"
      title="Impact Metrics"
      description="Capture quantitative baseline metrics before improvement begins. These values will be compared against results in Step 6 to calculate ROI."
      data={data as unknown as Record<string, unknown>}
    >
      <ImpactMetricsFields data={data} update={update} />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type FieldsProps = {
  data: ImpactMetricsData
  update: <K extends keyof ImpactMetricsData>(key: K, value: ImpactMetricsData[K]) => void
}

const ImpactMetricsFields = ({ data, update }: FieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  if (isView) {
    return (
      <div className="space-y-6">
        <Section icon={<DollarSign className="size-4" />} title="Financial Impact">
          <FormFieldView
            label="Annual Financial Cost"
            value={`${CURRENCY_LABELS[data.financialCostUnit] ?? data.financialCostUnit} ${data.financialCostAnnual.toLocaleString()}`}
          />
        </Section>

        <Section icon={<Clock className="size-4" />} title="Time Impact">
          <FormFieldView
            label="Weekly Hours Wasted"
            value={`${data.timeWastedWeeklyHours} hrs/week`}
          />
        </Section>

        <Section icon={<Target className="size-4" />} title="Quality Impact">
          <FormFieldView
            label="Defect Rate"
            value={`${data.qualityDefectRate} ${data.qualityDefectUnit}`}
          />
          <FormFieldView
            label="Customer Satisfaction (0–10)"
            value={`${data.customerSatisfactionBefore} / 10`}
          />
        </Section>

        <Section icon={<Users className="size-4" />} title="Scope">
          <FormFieldView
            label="Employees Affected"
            value={data.employeesAffected.toLocaleString()}
          />
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
      {/* Financial */}
      <Section icon={<DollarSign className="size-4" />} title="Financial Impact">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Estimate the annual cost of this problem in financial terms.
        </p>
        <div className="flex gap-3">
          <div className="w-36 shrink-0">
            <Label htmlFor="financialCostUnit">Currency</Label>
            <Select
              value={data.financialCostUnit}
              onValueChange={(v) =>
                update('financialCostUnit', v as ImpactMetricsData['financialCostUnit'])
              }
            >
              <SelectTrigger id="financialCostUnit" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="eur">EUR (€)</SelectItem>
                <SelectItem value="gbp">GBP (£)</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="financialCostAnnual">Annual Cost</Label>
            <Input
              id="financialCostAnnual"
              type="number"
              min={0}
              step={100}
              value={data.financialCostAnnual}
              onChange={(e) => update('financialCostAnnual', parseFloat(e.target.value) || 0)}
              className="mt-1"
              placeholder="e.g. 50000"
            />
          </div>
        </div>
      </Section>

      {/* Time */}
      <Section icon={<Clock className="size-4" />} title="Time Impact">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          How many hours per week are lost due to this problem?
        </p>
        <div>
          <Label htmlFor="timeWastedWeeklyHours">Weekly Hours Wasted</Label>
          <Input
            id="timeWastedWeeklyHours"
            type="number"
            min={0}
            step={0.5}
            value={data.timeWastedWeeklyHours}
            onChange={(e) => update('timeWastedWeeklyHours', parseFloat(e.target.value) || 0)}
            className="mt-1"
            placeholder="e.g. 8"
          />
        </div>
      </Section>

      {/* Quality */}
      <Section icon={<Target className="size-4" />} title="Quality Impact">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="qualityDefectRate">Defect Rate (%)</Label>
            <Input
              id="qualityDefectRate"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={data.qualityDefectRate}
              onChange={(e) => update('qualityDefectRate', parseFloat(e.target.value) || 0)}
              className="mt-1"
              placeholder="e.g. 12.5"
            />
          </div>
          <div>
            <Label htmlFor="qualityDefectUnit">Unit / Label</Label>
            <Input
              id="qualityDefectUnit"
              type="text"
              value={data.qualityDefectUnit}
              onChange={(e) => update('qualityDefectUnit', e.target.value)}
              className="mt-1"
              placeholder="e.g. % defect rate"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="customerSatisfactionBefore">
            Customer Satisfaction Score (0–10, before improvement)
          </Label>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            0 = very dissatisfied, 10 = very satisfied
          </p>
          <Input
            id="customerSatisfactionBefore"
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={data.customerSatisfactionBefore}
            onChange={(e) => update('customerSatisfactionBefore', parseFloat(e.target.value) || 0)}
            className="mt-1"
            placeholder="e.g. 6.2"
          />
        </div>
      </Section>

      {/* Scope */}
      <Section icon={<Users className="size-4" />} title="Scope">
        <div>
          <Label htmlFor="employeesAffected">Employees Affected</Label>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            How many people are directly impacted by this problem?
          </p>
          <Input
            id="employeesAffected"
            type="number"
            min={0}
            step={1}
            value={data.employeesAffected}
            onChange={(e) => update('employeesAffected', parseInt(e.target.value, 10) || 0)}
            className="mt-1"
            placeholder="e.g. 25"
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
            placeholder="Any additional context about these baseline metrics..."
            className="mt-1"
          />
        </div>
      </Section>
    </div>
  )
}

/* ---- Section wrapper ---- */

type SectionProps = {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

const Section = ({ icon, title, children }: SectionProps) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
      <span className="text-[var(--color-step-1)]">{icon}</span>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
    </div>
    {children}
  </div>
)
