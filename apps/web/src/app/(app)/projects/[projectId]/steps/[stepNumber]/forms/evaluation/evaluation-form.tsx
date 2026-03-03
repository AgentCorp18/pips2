'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FormShell } from '@/components/pips/form-shell'
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
  const [saveVersion, setSaveVersion] = useState(0)

  const update = (next: EvaluationData) => {
    setData(next)
    setDirty(true)
    setSaveVersion((v) => v + 1)
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
      key={saveVersion}
    >
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
          <textarea
            value={data.goalDetails}
            onChange={(e) => update({ ...data, goalDetails: e.target.value })}
            placeholder="Explain what goals were met, partially met, or missed..."
            rows={3}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
          <div className="space-y-2">
            <Label>Unexpected Outcomes</Label>
            <p className="text-xs text-muted-foreground">
              Were there any positive or negative outcomes that weren&apos;t anticipated?
            </p>
            <textarea
              value={data.unexpectedOutcomes}
              onChange={(e) => update({ ...data, unexpectedOutcomes: e.target.value })}
              placeholder="Describe any surprises, side effects, or unintended consequences..."
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Recommendations</Label>
            <p className="text-xs text-muted-foreground">
              What would you recommend to others undertaking a similar project?
            </p>
            <textarea
              value={data.recommendations}
              onChange={(e) => update({ ...data, recommendations: e.target.value })}
              placeholder="Share advice, best practices, or things to watch out for..."
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Next Steps</Label>
            <p className="text-xs text-muted-foreground">
              Should we standardize, iterate, or start a new PIPS cycle?
            </p>
            <textarea
              value={data.nextSteps}
              onChange={(e) => update({ ...data, nextSteps: e.target.value })}
              placeholder="Outline the path forward: standardize this change, continue improving, or identify a new problem..."
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
        </div>
      </div>
    </FormShell>
  )
}

/* ---- Rating Slider Sub-component ---- */

type RatingSliderProps = {
  label: string
  description: string
  value: number
  onChange: (v: number) => void
}

const RatingSlider = ({ label, description, value, onChange }: RatingSliderProps) => (
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
