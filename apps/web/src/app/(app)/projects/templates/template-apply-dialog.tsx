'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { type FormTemplate, VERTICALS } from '@/lib/form-templates'
import { applyTemplate } from './actions'

const STEP_LABELS: Record<string, string> = {
  identify: 'Step 1 — Identify',
  analyze: 'Step 2 — Analyze',
  generate: 'Step 3 — Generate',
  select_plan: 'Step 4 — Select & Plan',
  implement: 'Step 5 — Implement',
  evaluate: 'Step 6 — Evaluate',
}

type TemplateApplyDialogProps = {
  template: FormTemplate | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const TemplateApplyDialog = ({
  template,
  open,
  onOpenChange,
}: TemplateApplyDialogProps) => {
  const router = useRouter()
  const [projectName, setProjectName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleClose = (nextOpen: boolean) => {
    if (isPending) return
    if (!nextOpen) {
      setProjectName('')
      setError(null)
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!template) return

    const trimmed = projectName.trim()
    if (!trimmed) {
      setError('Project name is required')
      return
    }
    if (trimmed.length < 3) {
      setError('Project name must be at least 3 characters')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await applyTemplate(template.id, trimmed)

      if ('error' in result) {
        setError(result.error)
        return
      }

      toast.success('Project created from template')
      router.push(`/projects/${result.projectId}`)
    })
  }

  if (!template) return null

  const vertical = VERTICALS[template.vertical]

  // Group forms by step
  const formsByStep = template.forms.reduce<Record<string, typeof template.forms>>(
    (acc, form) => {
      const key = form.step
      if (!acc[key]) acc[key] = []
      acc[key]!.push(form)
      return acc
    },
    {},
  )

  const stepOrder = ['identify', 'analyze', 'generate', 'select_plan', 'implement', 'evaluate']

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="apply-dialog-title">{template.name}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Vertical badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              style={{ borderColor: vertical.color, color: vertical.color }}
              data-testid="apply-dialog-vertical-badge"
            >
              {vertical.label}
            </Badge>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {template.forms.length} pre-filled form{template.forms.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Included forms */}
          <div>
            <p
              className="mb-2 text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Included forms
            </p>
            <div className="space-y-2" data-testid="apply-dialog-forms-list">
              {stepOrder
                .filter((step) => formsByStep[step])
                .map((step) => (
                  <div key={step}>
                    <p
                      className="mb-1 text-[11px] font-medium"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {STEP_LABELS[step]}
                    </p>
                    <div className="space-y-1">
                      {formsByStep[step]!.map((form) => (
                        <div
                          key={`${form.step}-${form.formType}`}
                          className="flex items-center gap-2 rounded-md px-3 py-1.5"
                          style={{ backgroundColor: 'var(--color-surface)' }}
                        >
                          <CheckCircle2
                            size={13}
                            style={{ color: 'var(--color-primary)' }}
                            aria-hidden="true"
                          />
                          <span
                            className="text-xs"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {form.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Project name form */}
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="template-project-name" required>
                Project name
              </Label>
              <Input
                id="template-project-name"
                data-testid="template-project-name-input"
                type="text"
                placeholder={`e.g. ${template.name} — Q2 2026`}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isPending}
                autoFocus
                aria-required="true"
                aria-describedby={error ? 'template-name-error' : undefined}
              />
              {error && (
                <p
                  id="template-name-error"
                  className="text-sm"
                  style={{ color: 'var(--color-error)' }}
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isPending}
                data-testid="apply-dialog-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !projectName.trim()}
                data-testid="apply-dialog-submit"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Creating project...
                  </>
                ) : (
                  'Create Project from Template'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
