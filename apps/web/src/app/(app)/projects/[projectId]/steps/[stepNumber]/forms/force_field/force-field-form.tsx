'use client'

import { useCallback, useState } from 'react'
import { FormShell } from '@/components/pips/form-shell'
import { FormTextarea } from '@/components/pips/form-textarea'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type { ForceFieldData } from '@/lib/form-schemas'

type Force = { text: string; strength: number }

const DEFAULTS: ForceFieldData = {
  problemStatement: '',
  drivingForces: [],
  restrainingForces: [],
  strategy: '',
}

type Props = {
  projectId: string
  stepNumber: number
  initialData: Record<string, unknown> | null
  problemStatementFromStep1: string
}

export const ForceFieldForm = ({
  projectId,
  stepNumber,
  initialData,
  problemStatementFromStep1,
}: Props) => {
  const [data, setData] = useState<ForceFieldData>(() => {
    const merged = { ...DEFAULTS, ...(initialData as Partial<ForceFieldData>) }
    if (!merged.problemStatement && problemStatementFromStep1) {
      merged.problemStatement = problemStatementFromStep1
    }
    return merged
  })

  const addForce = useCallback((side: 'drivingForces' | 'restrainingForces') => {
    setData((prev) => ({
      ...prev,
      [side]: [...prev[side], { text: '', strength: 3 }],
    }))
  }, [])

  const updateForce = useCallback(
    (
      side: 'drivingForces' | 'restrainingForces',
      index: number,
      field: keyof Force,
      value: string | number,
    ) => {
      setData((prev) => {
        const forces = [...prev[side]]
        const force = forces[index]
        if (!force) return prev
        forces[index] = { ...force, [field]: value }
        return { ...prev, [side]: forces }
      })
    },
    [],
  )

  const removeForce = useCallback((side: 'drivingForces' | 'restrainingForces', index: number) => {
    setData((prev) => ({
      ...prev,
      [side]: prev[side].filter((_, i) => i !== index),
    }))
  }, [])

  const drivingTotal = data.drivingForces.reduce((sum, f) => sum + f.strength, 0)
  const restrainingTotal = data.restrainingForces.reduce((sum, f) => sum + f.strength, 0)

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="force_field"
      title="Force Field Analysis"
      description="Identify the forces driving change and the forces restraining it. Understanding both helps develop an effective strategy."
      data={data as unknown as Record<string, unknown>}
    >
      <div className="space-y-6">
        {/* Problem statement context */}
        {data.problemStatement && (
          <div className="rounded-[var(--radius-md)] border-l-4 border-l-[var(--color-step-2)] bg-[var(--color-step-2-subtle)] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Problem Statement
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-primary)]">{data.problemStatement}</p>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Driving Forces */}
          <ForceColumn
            title="Driving Forces"
            subtitle="Forces pushing toward change"
            color="var(--color-success)"
            forces={data.drivingForces}
            total={drivingTotal}
            onAdd={() => addForce('drivingForces')}
            onUpdate={(i, f, v) => updateForce('drivingForces', i, f, v)}
            onRemove={(i) => removeForce('drivingForces', i)}
          />

          {/* Restraining Forces */}
          <ForceColumn
            title="Restraining Forces"
            subtitle="Forces resisting change"
            color="var(--color-error)"
            forces={data.restrainingForces}
            total={restrainingTotal}
            onAdd={() => addForce('restrainingForces')}
            onUpdate={(i, f, v) => updateForce('restrainingForces', i, f, v)}
            onRemove={(i) => removeForce('restrainingForces', i)}
          />
        </div>

        {/* Balance indicator */}
        <div className="flex items-center justify-center gap-4 rounded-[var(--radius-md)] bg-[var(--color-surface-secondary)] px-4 py-3">
          <span className="text-sm" style={{ color: 'var(--color-success)' }}>
            Driving: {drivingTotal}
          </span>
          <span className="text-lg font-bold text-[var(--color-text-tertiary)]">vs</span>
          <span className="text-sm" style={{ color: 'var(--color-error)' }}>
            Restraining: {restrainingTotal}
          </span>
        </div>

        {/* Strategy */}
        <FormTextarea
          id="strategy"
          label="Strategy"
          value={data.strategy}
          onChange={(v) => setData((prev) => ({ ...prev, strategy: v }))}
          placeholder="Based on this analysis, our strategy is to..."
          helperText="How will you strengthen driving forces or weaken restraining forces?"
          rows={4}
          aiFieldType="force_field_strategy"
          aiContext={`Problem statement: ${data.problemStatement || 'not set'}. Driving forces (total strength ${drivingTotal}): ${data.drivingForces.map((f) => `${f.text} (strength ${f.strength})`).join(', ') || 'none'}. Restraining forces (total strength ${restrainingTotal}): ${data.restrainingForces.map((f) => `${f.text} (strength ${f.strength})`).join(', ') || 'none'}.`}
        />
      </div>
    </FormShell>
  )
}

/* ---- Force column sub-component ---- */

type ForceColumnProps = {
  title: string
  subtitle: string
  color: string
  forces: Force[]
  total: number
  onAdd: () => void
  onUpdate: (index: number, field: keyof Force, value: string | number) => void
  onRemove: (index: number) => void
}

const ForceColumn = ({
  title,
  subtitle,
  color,
  forces,
  onAdd,
  onUpdate,
  onRemove,
}: ForceColumnProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold" style={{ color }}>
          {title}
        </h3>
        <p className="text-xs text-[var(--color-text-tertiary)]">{subtitle}</p>
      </div>

      {isView ? (
        forces.length === 0 ? (
          <p className="text-sm italic text-[var(--color-text-tertiary)]">No forces identified</p>
        ) : (
          forces.map((force, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
            >
              <span className="text-sm text-[var(--color-text-secondary)]">
                {force.text || (
                  <span className="italic text-[var(--color-text-tertiary)]">Unnamed force</span>
                )}
              </span>
              <span className="text-xs font-semibold text-[var(--color-text-tertiary)]">
                Strength: {force.strength}/5
              </span>
            </div>
          ))
        )
      ) : (
        <>
          {forces.map((force, i) => (
            <div
              key={i}
              className="space-y-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={force.text}
                  onChange={(e) => onUpdate(i, 'text', e.target.value)}
                  placeholder="Describe this force..."
                  className="text-sm"
                />
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => onRemove(i)}>
                  <Trash2 size={12} />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-[var(--color-text-tertiary)]">Strength:</Label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={force.strength}
                  onChange={(e) => onUpdate(i, 'strength', parseInt(e.target.value, 10))}
                  className="flex-1 accent-[var(--color-primary)]"
                />
                <span className="w-4 text-center text-xs font-semibold">{force.strength}</span>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={onAdd} className="w-full">
            <Plus size={12} />
            Add Force
          </Button>
        </>
      )}
    </div>
  )
}
