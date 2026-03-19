'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FormShell } from '@/components/pips/form-shell'
import { FormTextarea } from '@/components/pips/form-textarea'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { FormFieldView } from '@/components/pips/form-field-view'
import { saveFormData } from '../actions'
import type { EvaluationData } from '@/lib/form-schemas'
import { cn } from '@/lib/utils'

type Props = {
  projectId: string
  initialData: EvaluationData | null
}

const defaultData: EvaluationData = {
  goalsAchieved: false,
  goalDetails: '',
  effectivenessRating: 3,
  sustainabilityRating: 3,
  teamSatisfactionRating: 3,
  unexpectedOutcomes: '',
  recommendations: '',
  nextSteps: '',
}

const ratingLabels: Record<number, string> = {
  1: 'Poor',
  2: 'Below Average',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
}

export const EvaluationForm = ({ projectId, initialData }: Props) => {
  const [data, setData] = useState<EvaluationData>(initialData ?? defaultData)
  const [dirty, setDirty] = useState(false)

  const update = (next: EvaluationData) => {
    setData(next)
    setDirty(true)
  }

  const handleSave = useCallback(async () => {
    const result = await saveFormData(
      projectId,
      6,
      'evaluation',
      data as unknown as Record<string, unknown>,
    )
    if (result.error) {
      toast.error(result.error)
      return { error: result.error }
    }
    setDirty(false)
    return { success: true }
  }, [projectId, data])

  return (
    <FormShell
      title="Evaluation Summary"
      description="Assess the overall effectiveness and impact of the improvement project."
      stepNumber={6}
      onSave={handleSave}
      isDirty={dirty}
    >
      <EvaluationFields data={data} update={update} />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type EvaluationFieldsProps = {
  data: EvaluationData
  update: (next: EvaluationData) => void
}

const EvaluationFields = ({ data, update }: EvaluationFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  if (isView) {
    return (
      <div className="space-y-8">
        {/* Goals achieved */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Were the project goals achieved?
          </span>
          <div className="flex items-center gap-2">
            {data.goalsAchieved ? (
              <>
                <CheckCircle2 className="size-4 text-[var(--color-success)]" />
                <span className="text-sm font-medium text-[var(--color-success)]">Yes</span>
              </>
            ) : (
              <>
                <XCircle className="size-4 text-[var(--color-error)]" />
                <span className="text-sm font-medium text-[var(--color-error)]">No</span>
              </>
            )}
          </div>
          <FormFieldView label="Details" value={data.goalDetails} />
        </div>

        {/* Ratings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Ratings</h3>
          <RatingSlider
            label="Effectiveness of the Solution"
            description="How well did the solution address the original problem?"
            value={data.effectivenessRating}
            onChange={() => {}}
          />
          <RatingSlider
            label="Sustainability"
            description="How likely is this improvement to be maintained long-term?"
            value={data.sustainabilityRating}
            onChange={() => {}}
          />
          <RatingSlider
            label="Team Satisfaction"
            description="How satisfied is the team with the process and outcomes?"
            value={data.teamSatisfactionRating}
            onChange={() => {}}
          />
        </div>

        {/* Text fields */}
        <div className="space-y-4">
          <FormFieldView
            label="Unexpected Outcomes"
            value={data.unexpectedOutcomes}
            helperText="Were there any positive or negative outcomes that weren't anticipated?"
          />
          <FormFieldView
            label="Recommendations"
            value={data.recommendations}
            helperText="What would you recommend to others undertaking a similar project?"
          />
          <FormFieldView
            label="Next Steps"
            value={data.nextSteps}
            helperText="Should we standardize, iterate, or start a new PIPS cycle?"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Goals achieved */}
      <div className="space-y-3">
        <Label>Were the project goals achieved?</Label>
        <div className="flex gap-3">
          <Button
            variant={data.goalsAchieved ? 'default' : 'outline'}
            size="sm"
            onClick={() => update({ ...data, goalsAchieved: true })}
            className="gap-2"
          >
            <CheckCircle2 className="size-4" />
            Yes
          </Button>
          <Button
            variant={!data.goalsAchieved ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => update({ ...data, goalsAchieved: false })}
            className="gap-2"
          >
            <XCircle className="size-4" />
            No
          </Button>
        </div>
        <FormTextarea
          id="goalDetails"
          label="Details"
          value={data.goalDetails}
          onChange={(v) => update({ ...data, goalDetails: v })}
          placeholder="Explain what goals were met, partially met, or missed..."
          rows={3}
          aiFieldType="goal_details"
          aiContext={`Goals achieved: ${data.goalsAchieved ? 'Yes' : 'No'}. Effectiveness rating: ${data.effectivenessRating}/5 (${ratingLabels[data.effectivenessRating]}). Sustainability rating: ${data.sustainabilityRating}/5. Team satisfaction: ${data.teamSatisfactionRating}/5.`}
        />
      </div>

      {/* Ratings */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold">Rate the following aspects (1-5)</h3>
        <RatingSlider
          label="Effectiveness of the Solution"
          description="How well did the solution address the original problem?"
          value={data.effectivenessRating}
          onChange={(v) => update({ ...data, effectivenessRating: v })}
        />
        <RatingSlider
          label="Sustainability"
          description="How likely is this improvement to be maintained long-term?"
          value={data.sustainabilityRating}
          onChange={(v) => update({ ...data, sustainabilityRating: v })}
        />
        <RatingSlider
          label="Team Satisfaction"
          description="How satisfied is the team with the process and outcomes?"
          value={data.teamSatisfactionRating}
          onChange={(v) => update({ ...data, teamSatisfactionRating: v })}
        />
      </div>

      {/* Text areas */}
      <div className="space-y-4">
        <FormTextarea
          id="unexpectedOutcomes"
          label="Unexpected Outcomes"
          value={data.unexpectedOutcomes}
          onChange={(v) => update({ ...data, unexpectedOutcomes: v })}
          placeholder="Describe any surprises, side effects, or unintended consequences..."
          helperText="Were there any positive or negative outcomes that weren't anticipated?"
          rows={3}
          aiFieldType="unexpected_outcomes"
          aiContext={`Goals achieved: ${data.goalsAchieved ? 'Yes' : 'No'}. Goal details: ${data.goalDetails || 'not provided'}. Effectiveness: ${data.effectivenessRating}/5. Sustainability: ${data.sustainabilityRating}/5. Team satisfaction: ${data.teamSatisfactionRating}/5.`}
        />

        <FormTextarea
          id="recommendations"
          label="Recommendations"
          value={data.recommendations}
          onChange={(v) => update({ ...data, recommendations: v })}
          placeholder="Share advice, best practices, or things to watch out for..."
          helperText="What would you recommend to others undertaking a similar project?"
          rows={3}
          aiFieldType="evaluation_recommendations"
          aiContext={`Goals achieved: ${data.goalsAchieved ? 'Yes' : 'No'}. Goal details: ${data.goalDetails || 'not provided'}. Unexpected outcomes: ${data.unexpectedOutcomes || 'none noted'}. Effectiveness: ${data.effectivenessRating}/5. Sustainability: ${data.sustainabilityRating}/5.`}
        />

        <FormTextarea
          id="nextSteps"
          label="Next Steps"
          value={data.nextSteps}
          onChange={(v) => update({ ...data, nextSteps: v })}
          placeholder="Outline the path forward: standardize this change, continue improving, or identify a new problem..."
          helperText="Should we standardize, iterate, or start a new PIPS cycle?"
          rows={3}
          aiFieldType="evaluation_next_steps"
          aiContext={`Goals achieved: ${data.goalsAchieved ? 'Yes' : 'No'}. Goal details: ${data.goalDetails || 'not provided'}. Recommendations: ${data.recommendations || 'not provided'}. Unexpected outcomes: ${data.unexpectedOutcomes || 'none noted'}. Effectiveness: ${data.effectivenessRating}/5. Sustainability: ${data.sustainabilityRating}/5. Team satisfaction: ${data.teamSatisfactionRating}/5.`}
        />
      </div>
    </div>
  )
}

/* ---- Rating Slider Sub-component ---- */

type RatingSliderProps = {
  label: string
  description: string
  value: number
  onChange: (v: number) => void
}

const RatingSlider = ({ label, description, value, onChange }: RatingSliderProps) => {
  const mode = useFormViewMode()

  if (mode === 'view') {
    return (
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
          <p className="text-xs text-[var(--color-text-tertiary)]">{description}</p>
        </div>
        <span className="text-sm font-medium text-[var(--color-step-6)]">
          {value}/5 ({ratingLabels[value] ?? ''})
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label>{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="text-sm font-medium text-[var(--color-step-6)]">
          {ratingLabels[value] ?? ''}
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              'flex h-10 flex-1 items-center justify-center rounded-[var(--radius-sm)] text-sm font-medium transition-all',
              n <= value
                ? 'bg-[var(--color-step-6)] text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
