'use client'

import { useCallback, useState } from 'react'
import { FormShell } from '@/components/pips/form-shell'
import { FormTextarea } from '@/components/pips/form-textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ImpactAssessmentData } from '@/lib/form-schemas'

const DEFAULTS: ImpactAssessmentData = {
  financialImpact: '',
  customerImpact: '',
  employeeImpact: '',
  processImpact: '',
  severityRating: 1,
  frequencyRating: 1,
  detectionRating: 1,
  riskPriorityNumber: 1,
}

type Props = {
  projectId: string
  stepNumber: number
  initialData: Record<string, unknown> | null
}

export const ImpactAssessmentForm = ({ projectId, stepNumber, initialData }: Props) => {
  const [data, setData] = useState<ImpactAssessmentData>(() => {
    const merged = { ...DEFAULTS, ...(initialData as Partial<ImpactAssessmentData>) }
    merged.riskPriorityNumber =
      merged.severityRating * merged.frequencyRating * merged.detectionRating
    return merged
  })

  const update = useCallback(
    <K extends keyof ImpactAssessmentData>(key: K, value: ImpactAssessmentData[K]) => {
      setData((prev) => {
        const next = { ...prev, [key]: value }
        next.riskPriorityNumber = next.severityRating * next.frequencyRating * next.detectionRating
        return next
      })
    },
    [],
  )

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="impact_assessment"
      title="Impact Assessment"
      description="Quantify how this problem impacts the organization across multiple dimensions."
      data={data as unknown as Record<string, unknown>}
    >
      <div className="space-y-6">
        {/* Impact areas */}
        <FormTextarea
          id="financialImpact"
          label="Financial Impact"
          value={data.financialImpact}
          onChange={(v) => update('financialImpact', v)}
          placeholder="e.g. $50,000/year in rework costs..."
          helperText="Estimate the cost of this problem in dollars or other financial metrics."
          rows={2}
        />

        <FormTextarea
          id="customerImpact"
          label="Customer Impact"
          value={data.customerImpact}
          onChange={(v) => update('customerImpact', v)}
          placeholder="e.g. 15% of customers report delays..."
          helperText="How are external or internal customers affected?"
          rows={2}
        />

        <FormTextarea
          id="employeeImpact"
          label="Employee Impact"
          value={data.employeeImpact}
          onChange={(v) => update('employeeImpact', v)}
          placeholder="e.g. Staff spending 30% of time on workarounds..."
          helperText="How are team members or employees affected?"
          rows={2}
        />

        <FormTextarea
          id="processImpact"
          label="Process Impact"
          value={data.processImpact}
          onChange={(v) => update('processImpact', v)}
          placeholder="e.g. 3 downstream processes are delayed..."
          helperText="Which processes are affected or disrupted?"
          rows={2}
        />

        {/* Risk Priority Number */}
        <Card className="border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="text-base">Risk Priority Number (RPN)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RatingSlider
              id="severityRating"
              label="Severity"
              helperText="How severe is the impact? (1 = minimal, 5 = critical)"
              value={data.severityRating}
              onChange={(v) => update('severityRating', v)}
            />

            <RatingSlider
              id="frequencyRating"
              label="Frequency"
              helperText="How often does this occur? (1 = rarely, 5 = constantly)"
              value={data.frequencyRating}
              onChange={(v) => update('frequencyRating', v)}
            />

            <RatingSlider
              id="detectionRating"
              label="Detection Difficulty"
              helperText="How hard is it to detect? (1 = obvious, 5 = hidden)"
              value={data.detectionRating}
              onChange={(v) => update('detectionRating', v)}
            />

            <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-surface-secondary)] px-4 py-3">
              <span className="text-sm font-medium">Risk Priority Number</span>
              <span
                className="text-2xl font-bold"
                style={{ color: rpnColor(data.riskPriorityNumber) }}
              >
                {data.riskPriorityNumber}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              RPN = Severity x Frequency x Detection (range: 1-125). Higher means more urgent.
            </p>
          </CardContent>
        </Card>
      </div>
    </FormShell>
  )
}

/* ---- Rating slider ---- */

type RatingSliderProps = {
  id: string
  label: string
  helperText: string
  value: number
  onChange: (value: number) => void
}

const RatingSlider = ({ id, label, helperText, value, onChange }: RatingSliderProps) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <Label htmlFor={id}>{label}</Label>
      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{value}</span>
    </div>
    <p className="text-xs text-[var(--color-text-tertiary)]">{helperText}</p>
    <input
      id={id}
      type="range"
      min={1}
      max={5}
      step={1}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-full accent-[var(--color-primary)]"
    />
    <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)]">
      <span>1</span>
      <span>2</span>
      <span>3</span>
      <span>4</span>
      <span>5</span>
    </div>
  </div>
)

/** Color code the RPN value */
const rpnColor = (rpn: number): string => {
  if (rpn <= 20) return 'var(--color-success)'
  if (rpn <= 60) return 'var(--color-warning)'
  return 'var(--color-error)'
}
