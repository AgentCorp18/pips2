'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { STEP_CONTENT } from '@pips/shared'
import type { PipsStepNumber } from '@pips/shared'

type ProjectOption = {
  id: string
  name: string
}

type FormListFiltersProps = {
  projects: ProjectOption[]
}

// Collect all unique form types across all steps
const ALL_FORM_OPTIONS = (() => {
  const options: { value: string; label: string }[] = []
  for (let step = 1; step <= 6; step++) {
    const content = STEP_CONTENT[step as PipsStepNumber]
    for (const form of content.forms) {
      options.push({ value: form.type, label: form.name })
    }
  }
  return options
})()

export const FormListFilters = ({ projects }: FormListFiltersProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      // Reset to page 1 whenever a filter changes
      params.delete('page')
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.replace(`/forms?${params.toString()}`)
    },
    [router, searchParams],
  )

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams()
    // Preserve view param
    const view = searchParams.get('view')
    if (view) params.set('view', view)
    router.replace(`/forms?${params.toString()}`)
  }, [router, searchParams])

  const hasFilters =
    searchParams.has('search') ||
    searchParams.has('step') ||
    searchParams.has('form_type') ||
    searchParams.has('project_id')

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <Input
        placeholder="Search forms..."
        className="w-full sm:max-w-[220px]"
        defaultValue={searchParams.get('search') ?? ''}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setFilter('search', e.currentTarget.value)
          }
        }}
        onBlur={(e) => setFilter('search', e.currentTarget.value)}
      />

      {/* Step filter */}
      <Select value={searchParams.get('step') ?? ''} onValueChange={(v) => setFilter('step', v)}>
        <SelectTrigger className="w-full sm:w-[150px]" size="sm">
          <SelectValue placeholder="Step" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="identify">Step 1: Identify</SelectItem>
          <SelectItem value="analyze">Step 2: Analyze</SelectItem>
          <SelectItem value="generate">Step 3: Generate</SelectItem>
          <SelectItem value="select_plan">Step 4: Select &amp; Plan</SelectItem>
          <SelectItem value="implement">Step 5: Implement</SelectItem>
          <SelectItem value="evaluate">Step 6: Evaluate</SelectItem>
        </SelectContent>
      </Select>

      {/* Form type filter */}
      <Select
        value={searchParams.get('form_type') ?? ''}
        onValueChange={(v) => setFilter('form_type', v)}
      >
        <SelectTrigger className="w-full sm:w-[180px]" size="sm">
          <SelectValue placeholder="Form Type" />
        </SelectTrigger>
        <SelectContent>
          {ALL_FORM_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Project filter */}
      {projects.length > 0 && (
        <Select
          value={searchParams.get('project_id') ?? ''}
          onValueChange={(v) => setFilter('project_id', v)}
        >
          <SelectTrigger className="w-full sm:w-[180px]" size="sm">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X size={14} />
          Clear
        </Button>
      )}
    </div>
  )
}
