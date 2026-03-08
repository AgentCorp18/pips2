'use client'

import { useCallback, useState } from 'react'
import { FormShell } from '@/components/pips/form-shell'
import { FormTextarea } from '@/components/pips/form-textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X } from 'lucide-react'
import type { ProblemStatementData } from '@/lib/form-schemas'

const PROBLEM_AREAS = [
  { value: 'quality', label: 'Quality' },
  { value: 'cost', label: 'Cost' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'safety', label: 'Safety' },
  { value: 'morale', label: 'Morale' },
]

const DEFAULTS: ProblemStatementData = {
  asIs: '',
  desired: '',
  gap: '',
  problemStatement: '',
  teamMembers: [],
  problemArea: '',
  dataSources: [],
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
          aiFieldType="problem_statement"
          aiContext={`Problem statement form — current state (as-is). Problem area: ${data.problemArea || 'not set'}`}
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
          aiFieldType="problem_statement"
          aiContext={`Problem statement form — desired state. Current state: ${data.asIs || 'not yet defined'}`}
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
          aiFieldType="problem_statement"
          aiContext={`Problem statement form — gap analysis. As-Is: ${data.asIs || 'not yet defined'}. Desired: ${data.desired || 'not yet defined'}`}
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
          aiFieldType="problem_statement"
          aiContext={`Problem statement form — final statement. As-Is: ${data.asIs || 'not yet defined'}. Desired: ${data.desired || 'not yet defined'}. Gap: ${data.gap || 'not yet defined'}`}
        />

        {/* Problem Area */}
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

        {/* Team Members */}
        <TagListField
          label="Team Members"
          helperText="Who is involved in investigating this problem?"
          placeholder="Add a team member name..."
          values={data.teamMembers}
          onChange={(v) => update('teamMembers', v)}
        />

        {/* Data Sources */}
        <TagListField
          label="Data Sources"
          helperText="What data confirms this problem exists?"
          placeholder="e.g. Monthly KPI reports, Customer feedback..."
          values={data.dataSources}
          onChange={(v) => update('dataSources', v)}
        />
      </div>
    </FormShell>
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
