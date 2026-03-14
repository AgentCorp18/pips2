'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { createInitiative, type InitiativeActionState } from '@/app/(app)/initiatives/actions'

const COLORS = [
  '#4F46E5', // Primary indigo
  '#2563EB', // Signal Blue
  '#D97706', // Insight Amber
  '#059669', // Spark Green
  '#4338CA', // Blueprint Indigo
  '#CA8A04', // Action Gold
  '#0891B2', // Loop Teal
  '#DC2626', // Red
  '#7C3AED', // Purple
  '#0D9488', // Teal
]

const initialState: InitiativeActionState = {}

export const CreateInitiativeForm = () => {
  const router = useRouter()
  const hasRedirected = useRef(false)
  const [state, formAction, pending] = useActionState(createInitiative, initialState)

  useEffect(() => {
    if (state.success && state.redirectTo && !hasRedirected.current) {
      hasRedirected.current = true
      toast.success('Initiative created')
      router.push(state.redirectTo)
    }
    if (state.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-6" data-testid="create-initiative-form">
      {state.error && (
        <div
          role="alert"
          className="rounded-md border px-4 py-3 text-sm"
          style={{
            borderColor: 'var(--color-error)',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            color: 'var(--color-error)',
          }}
        >
          {state.error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g., Reduce manufacturing defects by 30%"
          aria-invalid={!!state.fieldErrors?.title}
          aria-required="true"
          required
          data-testid="initiative-title-input"
        />
        {state.fieldErrors?.title && (
          <p className="text-xs" style={{ color: 'var(--color-error)' }}>
            {state.fieldErrors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What is this initiative about?"
          rows={3}
          data-testid="initiative-description-input"
        />
      </div>

      {/* Objective + Target Metric */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="objective">Objective</Label>
          <Textarea
            id="objective"
            name="objective"
            placeholder="What does success look like?"
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target_metric">Target Metric</Label>
          <Input
            id="target_metric"
            name="target_metric"
            placeholder="e.g., Reduce defects from 15% to 5%"
          />
        </div>
      </div>

      {/* Baseline + Target Values */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="baseline_value">Baseline Value</Label>
          <Input id="baseline_value" name="baseline_value" placeholder="Starting measurement" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target_value">Target Value</Label>
          <Input id="target_value" name="target_value" placeholder="Goal measurement" />
        </div>
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="target_start">Target Start</Label>
          <DatePicker id="target_start" name="target_start" />
          {state.fieldErrors?.target_start && (
            <p className="text-xs" style={{ color: 'var(--color-error)' }}>
              {state.fieldErrors.target_start}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target_end">Target End</Label>
          <DatePicker id="target_end" name="target_end" />
          {state.fieldErrors?.target_end && (
            <p className="text-xs" style={{ color: 'var(--color-error)' }}>
              {state.fieldErrors.target_end}
            </p>
          )}
        </div>
      </div>

      {/* Color + Tags */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <label key={color} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={color}
                  defaultChecked={color === '#4F46E5'}
                  className="peer sr-only"
                />
                <div
                  className="h-8 w-8 rounded-full border-2 border-transparent transition-all peer-checked:border-gray-900 peer-checked:ring-2 peer-checked:ring-offset-2"
                  style={{ backgroundColor: color }}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            name="tags"
            placeholder="Comma-separated tags"
            data-testid="initiative-tags-input"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending} data-testid="create-initiative-submit">
          {pending ? 'Creating...' : 'Create Initiative'}
        </Button>
      </div>
    </form>
  )
}
