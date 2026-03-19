'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, TrendingUp, TrendingDown, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormShell } from '@/components/pips/form-shell'
import { FormTextarea } from '@/components/pips/form-textarea'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { FormFieldView } from '@/components/pips/form-field-view'
import { saveFormData } from '../actions'
import type { BalanceSheetData } from '@/lib/form-schemas'
import { cn } from '@/lib/utils'

type Props = {
  projectId: string
  initialData: BalanceSheetData | null
}

const createDefaultData = (): BalanceSheetData => ({
  gains: [{ id: crypto.randomUUID(), description: '', impact: 'medium', evidence: '' }],
  losses: [{ id: crypto.randomUUID(), description: '', impact: 'medium', mitigation: '' }],
  observations: [{ id: crypto.randomUUID(), description: '', category: '' }],
  summary: '',
  recommendation: '',
})

const impactColors: Record<string, string> = {
  high: 'text-[var(--color-error)]',
  medium: 'text-[var(--color-warning)]',
  low: 'text-[var(--color-text-tertiary)]',
}

const recommendationLabels: Record<string, string> = {
  sustain: 'Sustain -- Standardize and maintain the improvement',
  modify: 'Modify -- Iterate with adjustments and run another cycle',
  abandon: 'Abandon -- Stop this approach and try a different solution',
}

export const BalanceSheetForm = ({ projectId, initialData }: Props) => {
  const [data, setData] = useState<BalanceSheetData>(() => initialData ?? createDefaultData())
  const [dirty, setDirty] = useState(false)

  const update = (next: BalanceSheetData) => {
    setData(next)
    setDirty(true)
  }

  const handleSave = useCallback(async () => {
    const result = await saveFormData(
      projectId,
      6,
      'balance_sheet',
      data as unknown as Record<string, unknown>,
    )
    if (result.error) {
      toast.error(result.error)
      return { error: result.error }
    }
    setDirty(false)
    return { success: true }
  }, [projectId, data])

  /* ---- Gains ---- */
  const addGain = () => {
    update({
      ...data,
      gains: [
        ...data.gains,
        { id: crypto.randomUUID(), description: '', impact: 'medium', evidence: '' },
      ],
    })
  }

  const removeGain = (id: string) => {
    update({ ...data, gains: data.gains.filter((g) => g.id !== id) })
  }

  const updateGain = (id: string, field: string, value: string) => {
    update({
      ...data,
      gains: data.gains.map((g) => (g.id === id ? { ...g, [field]: value } : g)),
    })
  }

  /* ---- Losses ---- */
  const addLoss = () => {
    update({
      ...data,
      losses: [
        ...data.losses,
        { id: crypto.randomUUID(), description: '', impact: 'medium', mitigation: '' },
      ],
    })
  }

  const removeLoss = (id: string) => {
    update({ ...data, losses: data.losses.filter((l) => l.id !== id) })
  }

  const updateLoss = (id: string, field: string, value: string) => {
    update({
      ...data,
      losses: data.losses.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    })
  }

  /* ---- Observations ---- */
  const addObservation = () => {
    update({
      ...data,
      observations: [
        ...data.observations,
        { id: crypto.randomUUID(), description: '', category: '' },
      ],
    })
  }

  const removeObservation = (id: string) => {
    update({ ...data, observations: data.observations.filter((o) => o.id !== id) })
  }

  const updateObservation = (id: string, field: string, value: string) => {
    update({
      ...data,
      observations: data.observations.map((o) => (o.id === id ? { ...o, [field]: value } : o)),
    })
  }

  return (
    <FormShell
      title="Balance Sheet"
      description="Weigh gains against losses and observations to decide the path forward for this improvement."
      stepNumber={6}
      projectId={projectId}
      onSave={handleSave}
      isDirty={dirty}
    >
      <BalanceSheetFields
        data={data}
        update={update}
        addGain={addGain}
        removeGain={removeGain}
        updateGain={updateGain}
        addLoss={addLoss}
        removeLoss={removeLoss}
        updateLoss={updateLoss}
        addObservation={addObservation}
        removeObservation={removeObservation}
        updateObservation={updateObservation}
      />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type BalanceSheetFieldsProps = {
  data: BalanceSheetData
  update: (next: BalanceSheetData) => void
  addGain: () => void
  removeGain: (id: string) => void
  updateGain: (id: string, field: string, value: string) => void
  addLoss: () => void
  removeLoss: (id: string) => void
  updateLoss: (id: string, field: string, value: string) => void
  addObservation: () => void
  removeObservation: (id: string) => void
  updateObservation: (id: string, field: string, value: string) => void
}

const BalanceSheetFields = ({
  data,
  update,
  addGain,
  removeGain,
  updateGain,
  addLoss,
  removeLoss,
  updateLoss,
  addObservation,
  removeObservation,
  updateObservation,
}: BalanceSheetFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  if (isView) {
    return (
      <div className="space-y-8">
        <p className="text-sm text-muted-foreground">
          Balance of gains, losses, and observations from the improvement effort.
        </p>

        {/* Gains */}
        <SectionCard
          title="Gains"
          subtitle="Positive outcomes and improvements achieved"
          icon={<TrendingUp className="size-5" />}
          accentClass="border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
          iconClass="text-emerald-600 dark:text-emerald-400"
        >
          <div className="space-y-3">
            {data.gains.filter((g) => g.description).length === 0 ? (
              <p className="text-sm italic text-[var(--color-text-tertiary)]">No gains listed.</p>
            ) : (
              data.gains
                .filter((g) => g.description)
                .map((gain) => (
                  <div
                    key={gain.id}
                    className="space-y-1 rounded-[var(--radius-md)] border border-emerald-200 bg-white p-3 dark:border-emerald-800 dark:bg-emerald-950/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-primary)]">
                        {gain.description}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn('text-xs', impactColors[gain.impact])}
                      >
                        {gain.impact}
                      </Badge>
                    </div>
                    {gain.evidence && (
                      <p className="text-xs text-[var(--color-text-tertiary)]">
                        Evidence: {gain.evidence}
                      </p>
                    )}
                  </div>
                ))
            )}
          </div>
        </SectionCard>

        {/* Losses */}
        <SectionCard
          title="Losses"
          subtitle="Negative outcomes, remaining issues, or trade-offs"
          icon={<TrendingDown className="size-5" />}
          accentClass="border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
          iconClass="text-red-600 dark:text-red-400"
        >
          <div className="space-y-3">
            {data.losses.filter((l) => l.description).length === 0 ? (
              <p className="text-sm italic text-[var(--color-text-tertiary)]">No losses listed.</p>
            ) : (
              data.losses
                .filter((l) => l.description)
                .map((loss) => (
                  <div
                    key={loss.id}
                    className="space-y-1 rounded-[var(--radius-md)] border border-red-200 bg-white p-3 dark:border-red-800 dark:bg-red-950/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--color-text-primary)]">
                        {loss.description}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn('text-xs', impactColors[loss.impact])}
                      >
                        {loss.impact}
                      </Badge>
                    </div>
                    {loss.mitigation && (
                      <p className="text-xs text-[var(--color-text-tertiary)]">
                        Mitigation: {loss.mitigation}
                      </p>
                    )}
                  </div>
                ))
            )}
          </div>
        </SectionCard>

        {/* Observations */}
        <SectionCard
          title="Observations"
          subtitle="Neutral findings, notes, or things to watch"
          icon={<Eye className="size-5" />}
          accentClass="border-l-slate-400 bg-slate-50/50 dark:bg-slate-950/20"
          iconClass="text-slate-500 dark:text-slate-400"
        >
          <div className="space-y-3">
            {data.observations.filter((o) => o.description).length === 0 ? (
              <p className="text-sm italic text-[var(--color-text-tertiary)]">
                No observations listed.
              </p>
            ) : (
              data.observations
                .filter((o) => o.description)
                .map((obs) => (
                  <div
                    key={obs.id}
                    className="rounded-[var(--radius-md)] border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950/30"
                  >
                    <span className="text-sm text-[var(--color-text-primary)]">
                      {obs.description}
                    </span>
                    {obs.category && (
                      <span className="ml-2 text-xs text-[var(--color-text-tertiary)]">
                        ({obs.category})
                      </span>
                    )}
                  </div>
                ))
            )}
          </div>
        </SectionCard>

        {/* Summary */}
        <FormFieldView
          label="Overall Assessment"
          value={data.summary}
          helperText="Balance of gains vs. losses and what it means for the project."
        />

        {/* Recommendation */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Recommendation
          </span>
          {data.recommendation ? (
            <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-step-6)] bg-[var(--color-step-6)]/10 px-4 py-3 text-sm text-[var(--color-text-primary)]">
              <RecommendationIcon
                type={data.recommendation as 'sustain' | 'modify' | 'abandon'}
                active={true}
              />
              <span>{recommendationLabels[data.recommendation]}</span>
            </div>
          ) : (
            <p className="text-sm italic text-[var(--color-text-tertiary)]">
              No recommendation selected.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        List the positive outcomes (gains), negative outcomes or remaining issues (losses), and
        neutral observations from the improvement effort. Then summarize your overall assessment and
        recommend next steps.
      </p>

      {/* ---- Gains Section ---- */}
      <SectionCard
        title="Gains"
        subtitle="Positive outcomes and improvements achieved"
        icon={<TrendingUp className="size-5" />}
        accentClass="border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
        iconClass="text-emerald-600 dark:text-emerald-400"
      >
        <div className="space-y-4">
          {data.gains.map((gain) => (
            <div
              key={gain.id}
              className="space-y-3 rounded-[var(--radius-md)] border border-emerald-200 bg-white p-4 dark:border-emerald-800 dark:bg-emerald-950/30"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <Input
                    value={gain.description}
                    onChange={(e) => updateGain(gain.id, 'description', e.target.value)}
                    placeholder="Describe the positive outcome..."
                    className="text-sm"
                  />
                </div>
                <ImpactSelector
                  value={gain.impact}
                  onChange={(v) => updateGain(gain.id, 'impact', v)}
                />
                {data.gains.length > 1 && (
                  <Button variant="ghost" size="icon-xs" onClick={() => removeGain(gain.id)}>
                    <Trash2 className="size-3 text-muted-foreground" />
                  </Button>
                )}
              </div>
              <Input
                value={gain.evidence}
                onChange={(e) => updateGain(gain.id, 'evidence', e.target.value)}
                placeholder="Supporting evidence or data..."
                className="text-xs"
              />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addGain} className="gap-1.5">
            <Plus className="size-4" />
            Add Gain
          </Button>
        </div>
      </SectionCard>

      {/* ---- Losses Section ---- */}
      <SectionCard
        title="Losses"
        subtitle="Negative outcomes, remaining issues, or trade-offs"
        icon={<TrendingDown className="size-5" />}
        accentClass="border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
        iconClass="text-red-600 dark:text-red-400"
      >
        <div className="space-y-4">
          {data.losses.map((loss) => (
            <div
              key={loss.id}
              className="space-y-3 rounded-[var(--radius-md)] border border-red-200 bg-white p-4 dark:border-red-800 dark:bg-red-950/30"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <Input
                    value={loss.description}
                    onChange={(e) => updateLoss(loss.id, 'description', e.target.value)}
                    placeholder="Describe the negative outcome or remaining issue..."
                    className="text-sm"
                  />
                </div>
                <ImpactSelector
                  value={loss.impact}
                  onChange={(v) => updateLoss(loss.id, 'impact', v)}
                />
                {data.losses.length > 1 && (
                  <Button variant="ghost" size="icon-xs" onClick={() => removeLoss(loss.id)}>
                    <Trash2 className="size-3 text-muted-foreground" />
                  </Button>
                )}
              </div>
              <Input
                value={loss.mitigation}
                onChange={(e) => updateLoss(loss.id, 'mitigation', e.target.value)}
                placeholder="Proposed mitigation or action to address this..."
                className="text-xs"
              />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addLoss} className="gap-1.5">
            <Plus className="size-4" />
            Add Loss
          </Button>
        </div>
      </SectionCard>

      {/* ---- Observations Section ---- */}
      <SectionCard
        title="Observations"
        subtitle="Neutral findings, notes, or things to watch"
        icon={<Eye className="size-5" />}
        accentClass="border-l-slate-400 bg-slate-50/50 dark:bg-slate-950/20"
        iconClass="text-slate-500 dark:text-slate-400"
      >
        <div className="space-y-4">
          {data.observations.map((obs) => (
            <div
              key={obs.id}
              className="flex items-start gap-3 rounded-[var(--radius-md)] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950/30"
            >
              <div className="flex-1 space-y-2">
                <Input
                  value={obs.description}
                  onChange={(e) => updateObservation(obs.id, 'description', e.target.value)}
                  placeholder="Describe the observation..."
                  className="text-sm"
                />
                <Input
                  value={obs.category}
                  onChange={(e) => updateObservation(obs.id, 'category', e.target.value)}
                  placeholder="Category (e.g., Process, Culture, Technical)..."
                  className="text-xs"
                />
              </div>
              {data.observations.length > 1 && (
                <Button variant="ghost" size="icon-xs" onClick={() => removeObservation(obs.id)}>
                  <Trash2 className="size-3 text-muted-foreground" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addObservation} className="gap-1.5">
            <Plus className="size-4" />
            Add Observation
          </Button>
        </div>
      </SectionCard>

      {/* ---- Summary ---- */}
      <FormTextarea
        id="summary"
        label="Overall Assessment"
        value={data.summary}
        onChange={(v) => update({ ...data, summary: v })}
        placeholder="Describe the overall balance of outcomes, key takeaways, and what the findings suggest..."
        helperText="Summarize the balance of gains vs. losses and what it means for the project."
        rows={4}
        aiFieldType="balance_sheet_assessment"
        aiContext={`Gains (${data.gains.filter((g) => g.description).length}): ${
          data.gains
            .filter((g) => g.description)
            .map((g) => `${g.description} (${g.impact} impact)`)
            .join('; ') || 'none'
        }. Losses (${data.losses.filter((l) => l.description).length}): ${
          data.losses
            .filter((l) => l.description)
            .map((l) => `${l.description} (${l.impact} impact)`)
            .join('; ') || 'none'
        }. Observations: ${
          data.observations
            .filter((o) => o.description)
            .map((o) => o.description)
            .join('; ') || 'none'
        }.`}
      />

      {/* ---- Recommendation ---- */}
      <div className="space-y-2">
        <Label>Recommendation</Label>
        <p className="text-xs text-muted-foreground">
          Based on the balance sheet, what should the team do next?
        </p>
        <div className="flex flex-col gap-2">
          {(['sustain', 'modify', 'abandon'] as const).map((rec) => (
            <button
              key={rec}
              type="button"
              onClick={() => update({ ...data, recommendation: rec })}
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-left text-sm transition-all',
                data.recommendation === rec
                  ? 'border-[var(--color-step-6)] bg-[var(--color-step-6)]/10 text-[var(--color-text-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]',
              )}
            >
              <RecommendationIcon type={rec} active={data.recommendation === rec} />
              <span>{recommendationLabels[rec]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---- Sub-components ---- */

type SectionCardProps = {
  title: string
  subtitle: string
  icon: React.ReactNode
  accentClass: string
  iconClass: string
  children: React.ReactNode
}

const SectionCard = ({
  title,
  subtitle,
  icon,
  accentClass,
  iconClass,
  children,
}: SectionCardProps) => (
  <div className={cn('rounded-[var(--radius-md)] border-l-4 p-5', accentClass)}>
    <div className="mb-4 flex items-center gap-2">
      <span className={iconClass}>{icon}</span>
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
        <p className="text-xs text-[var(--color-text-tertiary)]">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
)

type ImpactSelectorProps = {
  value: string
  onChange: (value: string) => void
}

const ImpactSelector = ({ value, onChange }: ImpactSelectorProps) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger size="sm" className="w-[100px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="high">
        <span className={impactColors.high}>High</span>
      </SelectItem>
      <SelectItem value="medium">
        <span className={impactColors.medium}>Medium</span>
      </SelectItem>
      <SelectItem value="low">
        <span className={impactColors.low}>Low</span>
      </SelectItem>
    </SelectContent>
  </Select>
)

type RecommendationIconProps = {
  type: 'sustain' | 'modify' | 'abandon'
  active: boolean
}

const RecommendationIcon = ({ type, active }: RecommendationIconProps) => {
  const baseClass = cn(
    'flex size-8 items-center justify-center rounded-full text-xs font-bold',
    active ? 'bg-[var(--color-step-6)] text-white' : 'bg-muted text-muted-foreground',
  )

  const icons: Record<string, string> = {
    sustain: 'S',
    modify: 'M',
    abandon: 'A',
  }

  return <span className={baseClass}>{icons[type]}</span>
}
