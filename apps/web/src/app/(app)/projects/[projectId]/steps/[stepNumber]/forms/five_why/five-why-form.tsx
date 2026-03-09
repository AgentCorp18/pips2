'use client'

import { useCallback, useState } from 'react'
import { FormShell } from '@/components/pips/form-shell'
import { FormTextarea } from '@/components/pips/form-textarea'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import type { FiveWhyData } from '@/lib/form-schemas'

const DEFAULTS: FiveWhyData = {
  problemStatement: '',
  whys: [
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
  ],
  rootCause: '',
}

type Props = {
  projectId: string
  stepNumber: number
  initialData: Record<string, unknown> | null
  problemStatementFromStep1: string
}

export const FiveWhyForm = ({
  projectId,
  stepNumber,
  initialData,
  problemStatementFromStep1,
}: Props) => {
  const [data, setData] = useState<FiveWhyData>(() => {
    const merged = { ...DEFAULTS, ...(initialData as Partial<FiveWhyData>) }
    if (!merged.problemStatement && problemStatementFromStep1) {
      merged.problemStatement = problemStatementFromStep1
    }
    if (!merged.whys || merged.whys.length === 0) {
      merged.whys = DEFAULTS.whys
    }
    return merged
  })

  const updateWhy = useCallback((index: number, field: 'question' | 'answer', value: string) => {
    setData((prev) => {
      const whys = [...prev.whys]
      const entry = whys[index]
      if (!entry) return prev
      whys[index] = { ...entry, [field]: value }
      return { ...prev, whys }
    })
  }, [])

  const addWhy = () => {
    setData((prev) => ({
      ...prev,
      whys: [...prev.whys, { question: '', answer: '' }],
    }))
  }

  /** Build a suggested "why" question from the previous answer */
  const buildSuggestion = (index: number): string => {
    if (index === 0) {
      return data.problemStatement
        ? `Why does "${data.problemStatement}" happen?`
        : 'Why does this problem happen?'
    }
    const prevAnswer = data.whys[index - 1]?.answer
    if (prevAnswer) {
      return `Why does "${prevAnswer}" happen?`
    }
    return `Why? (Level ${index + 1})`
  }

  return (
    <FormShell
      projectId={projectId}
      stepNumber={stepNumber}
      formType="five_why"
      title="5 Why Analysis"
      description="Drill down to the root cause by asking 'why' iteratively. Each answer feeds the next question."
      data={data as unknown as Record<string, unknown>}
    >
      <FiveWhyFields
        data={data}
        setData={setData}
        updateWhy={updateWhy}
        addWhy={addWhy}
        buildSuggestion={buildSuggestion}
      />
    </FormShell>
  )
}

/* ---- Inner fields component (reads view mode from context) ---- */

type FiveWhyFieldsProps = {
  data: FiveWhyData
  setData: React.Dispatch<React.SetStateAction<FiveWhyData>>
  updateWhy: (index: number, field: 'question' | 'answer', value: string) => void
  addWhy: () => void
  buildSuggestion: (index: number) => string
}

const FiveWhyFields = ({
  data,
  setData,
  updateWhy,
  addWhy,
  buildSuggestion,
}: FiveWhyFieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  return (
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

      {/* Why chain */}
      {data.whys.map((why, i) => (
        <Card key={i}>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center gap-2">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: 'var(--color-step-2)' }}
              >
                {i + 1}
              </span>
              <span className="text-sm font-medium">Why #{i + 1}</span>
            </div>

            {/* Suggestion (edit mode only) */}
            {!isView && !why.question && (
              <button
                type="button"
                onClick={() => updateWhy(i, 'question', buildSuggestion(i))}
                className="text-xs text-[var(--color-text-link)] hover:underline"
              >
                Use suggested question: &quot;{buildSuggestion(i)}&quot;
              </button>
            )}

            <FormTextarea
              id={`why-q-${i}`}
              label="Question"
              value={why.question}
              onChange={(v) => updateWhy(i, 'question', v)}
              placeholder={buildSuggestion(i)}
              rows={2}
              aiFieldType="root_cause"
              aiContext={`5-Why analysis — question #${i + 1}. Problem: ${data.problemStatement || 'not set'}`}
            />

            <FormTextarea
              id={`why-a-${i}`}
              label="Answer"
              value={why.answer}
              onChange={(v) => updateWhy(i, 'answer', v)}
              placeholder="Because..."
              helperText={
                i < data.whys.length - 1 ? 'This answer feeds the next "why" question.' : ''
              }
              rows={2}
              aiFieldType="root_cause"
              aiContext={`5-Why analysis — answer #${i + 1}. Question: ${why.question || buildSuggestion(i)}`}
            />
          </CardContent>
        </Card>
      ))}

      {!isView && (
        <Button type="button" variant="outline" size="sm" onClick={addWhy}>
          <Plus size={14} />
          Add another Why
        </Button>
      )}

      {/* Root Cause */}
      <FormTextarea
        id="rootCause"
        label="Root Cause Conclusion"
        value={data.rootCause}
        onChange={(v) => setData((prev) => ({ ...prev, rootCause: v }))}
        placeholder="Based on the analysis above, the root cause is..."
        helperText="Summarize the fundamental root cause identified through the 5-Why process."
        rows={3}
        aiFieldType="root_cause"
        aiContext={`5-Why analysis — root cause conclusion. Problem: ${data.problemStatement || 'not set'}. Why chain: ${data.whys.map((w, idx) => `#${idx + 1} Q: ${w.question} A: ${w.answer}`).join('; ')}`}
      />
    </div>
  )
}
