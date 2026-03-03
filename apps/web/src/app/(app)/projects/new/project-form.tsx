'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createProject, type CreateProjectActionState } from './actions'

const initialState: CreateProjectActionState = {}

export const ProjectForm = () => {
  const [state, formAction, isPending] = useActionState(createProject, initialState)

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl">Create a new project</CardTitle>
        <CardDescription>Start a PIPS improvement cycle by defining your project</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {state.error && (
            <div
              role="alert"
              className="rounded-[var(--radius-md)] px-4 py-3 text-sm"
              style={{
                backgroundColor: 'var(--color-error-subtle)',
                color: 'var(--color-error)',
              }}
            >
              {state.error}
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Project name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Reduce onboarding time"
              aria-required="true"
              aria-describedby={state.fieldErrors?.name ? 'name-error' : undefined}
              required
              disabled={isPending}
            />
            {state.fieldErrors?.name && (
              <p id="name-error" className="text-sm" style={{ color: 'var(--color-error)' }}>
                {state.fieldErrors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe the process you want to improve..."
              disabled={isPending}
              rows={3}
              aria-describedby={state.fieldErrors?.description ? 'description-error' : undefined}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            {state.fieldErrors?.description && (
              <p id="description-error" className="text-sm" style={{ color: 'var(--color-error)' }}>
                {state.fieldErrors.description}
              </p>
            )}
          </div>

          {/* Target Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="target_completion_date">Target completion date</Label>
            <Input
              id="target_completion_date"
              name="target_completion_date"
              type="date"
              disabled={isPending}
              aria-describedby={
                state.fieldErrors?.target_completion_date ? 'target-date-error' : undefined
              }
            />
            {state.fieldErrors?.target_completion_date && (
              <p id="target-date-error" className="text-sm" style={{ color: 'var(--color-error)' }}>
                {state.fieldErrors.target_completion_date}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="mt-2 w-full" disabled={isPending}>
            {isPending ? 'Creating project...' : 'Create project'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
