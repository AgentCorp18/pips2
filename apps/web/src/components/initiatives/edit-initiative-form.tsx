'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateInitiative } from '@/app/(app)/initiatives/actions'
import type { Initiative, InitiativeStatus } from '@/types/initiatives'

type EditInitiativeFormProps = {
  initiative: Initiative
}

const STATUS_OPTIONS: { value: InitiativeStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

export const EditInitiativeForm = ({ initiative }: EditInitiativeFormProps) => {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)

    const formData = new FormData(e.currentTarget)
    const data: Record<string, unknown> = {
      title: formData.get('title'),
      description: formData.get('description') || '',
      status: formData.get('status'),
      objective: formData.get('objective') || '',
      target_metric: formData.get('target_metric') || '',
      baseline_value: formData.get('baseline_value') || '',
      target_value: formData.get('target_value') || '',
      current_value: formData.get('current_value') || '',
    }

    const result = await updateInitiative(initiative.id, data)
    setPending(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Initiative updated')
      router.push(`/initiatives/${initiative.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="edit-initiative-form">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" required>Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initiative.title}
          required
          aria-required="true"
          data-testid="initiative-title-input"
        />
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select name="status" defaultValue={initiative.status}>
          <SelectTrigger className="w-full" aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initiative.description ?? ''}
          rows={3}
        />
      </div>

      {/* Objective + Target Metric */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="objective">Objective</Label>
          <Textarea
            id="objective"
            name="objective"
            defaultValue={initiative.objective ?? ''}
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target_metric">Target Metric</Label>
          <Input
            id="target_metric"
            name="target_metric"
            defaultValue={initiative.target_metric ?? ''}
          />
        </div>
      </div>

      {/* Measurement */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="baseline_value">Baseline Value</Label>
          <Input
            id="baseline_value"
            name="baseline_value"
            defaultValue={initiative.baseline_value ?? ''}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="current_value">Current Value</Label>
          <Input
            id="current_value"
            name="current_value"
            defaultValue={initiative.current_value ?? ''}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target_value">Target Value</Label>
          <Input
            id="target_value"
            name="target_value"
            defaultValue={initiative.target_value ?? ''}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending} data-testid="save-initiative-button">
          {pending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
