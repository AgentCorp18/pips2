'use client'

import { useState, useActionState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Lightbulb, Check, FileText, LayoutTemplate, Loader2 } from 'lucide-react'
import { PROJECT_TEMPLATES } from '@pips/shared'
import { createProject, type CreateProjectActionState } from './actions'
import { createSampleProject } from '../../dashboard/sample-project-action'

/* ============================================================
   Step config
   ============================================================ */

type StepConfig = {
  number: number
  title: string
  tip: string
}

const STEPS: StepConfig[] = [
  {
    number: 1,
    title: 'Name & Describe',
    tip: 'A good project name is specific and action-oriented, e.g. "Reduce onboarding time from 3 weeks to 1 week".',
  },
  {
    number: 2,
    title: 'Set a Target Date',
    tip: 'Setting a target date helps your team stay focused. You can always adjust it later.',
  },
  {
    number: 3,
    title: 'Review & Create',
    tip: 'Once created, PIPS will guide you through each step of the improvement methodology.',
  },
]

/* ============================================================
   Mode toggle sub-component
   ============================================================ */

type CreateMode = 'blank' | 'template'

const ModeToggle = ({
  mode,
  onModeChange,
}: {
  mode: CreateMode
  onModeChange: (mode: CreateMode) => void
}) => (
  <div
    className="mb-6 flex rounded-[var(--radius-md)] border border-[var(--color-border)] p-1"
    data-testid="create-mode-toggle"
  >
    <button
      type="button"
      onClick={() => onModeChange('blank')}
      data-testid="mode-blank"
      className={`flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors ${
        mode === 'blank'
          ? 'bg-[var(--color-primary)] text-white'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      <FileText size={14} />
      Start from scratch
    </button>
    <button
      type="button"
      onClick={() => onModeChange('template')}
      data-testid="mode-template"
      className={`flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors ${
        mode === 'template'
          ? 'bg-[var(--color-primary)] text-white'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      <LayoutTemplate size={14} />
      Use a template
    </button>
  </div>
)

/* ============================================================
   Template picker sub-component
   ============================================================ */

const TemplatePicker = () => {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const completedCount = (steps: { status: string }[]) =>
    steps.filter((s) => s.status === 'completed').length

  const handleSelect = async (templateId: string) => {
    setLoadingId(templateId)
    setError(null)

    const result = await createSampleProject(templateId)

    if (result.error) {
      setError(result.error)
      setLoadingId(null)
      return
    }

    if (result.projectId) {
      toast.success('Project created from template')
      router.push(`/projects/${result.projectId}`)
    }
  }

  return (
    <div data-testid="template-picker">
      <p className="mb-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        Start with a pre-filled project to see how PIPS works across different industries.
      </p>

      {error && (
        <p className="mb-3 text-sm" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      <div className="grid gap-2">
        {PROJECT_TEMPLATES.map((t) => {
          const done = completedCount(t.steps)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelect(t.id)}
              disabled={loadingId !== null}
              data-testid={`template-${t.id}`}
              className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-secondary)] disabled:opacity-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-medium line-clamp-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {t.name}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                    {t.industry}
                  </Badge>
                  <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                    {done}/6 steps{t.tickets.length > 0 ? ` · ${t.tickets.length} tickets` : ''}
                  </span>
                </div>
              </div>
              <div className="ml-3 shrink-0">
                {loadingId === t.id ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                    style={{ color: 'var(--color-primary)' }}
                  />
                ) : (
                  <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                    Use
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================
   Stepper sub-component
   ============================================================ */

const Stepper = ({ currentStep }: { currentStep: number }) => (
  <div className="mb-8 flex items-center justify-center gap-2" data-testid="stepper">
    {STEPS.map((step, idx) => (
      <div key={step.number} className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
          data-testid={`stepper-step-${step.number}`}
          style={{
            backgroundColor:
              currentStep > step.number
                ? 'var(--color-success)'
                : currentStep === step.number
                  ? 'var(--color-primary)'
                  : 'var(--color-surface-secondary)',
            color: currentStep >= step.number ? '#fff' : 'var(--color-text-tertiary)',
          }}
        >
          {currentStep > step.number ? <Check size={16} /> : step.number}
        </div>
        {idx < STEPS.length - 1 && (
          <div
            className="h-0.5 w-8"
            style={{
              backgroundColor:
                currentStep > step.number ? 'var(--color-success)' : 'var(--color-border)',
            }}
          />
        )}
      </div>
    ))}
  </div>
)

/* ============================================================
   Main component
   ============================================================ */

const initialState: CreateProjectActionState = {}

export const ProjectForm = () => {
  const router = useRouter()
  const hasRedirected = useRef(false)
  const [state, formAction, isPending] = useActionState(createProject, initialState)
  const [isNavigating, startTransition] = useTransition()
  const [mode, setMode] = useState<CreateMode>('blank')
  const [currentStep, setCurrentStep] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')

  useEffect(() => {
    if (state.success && state.projectId && !hasRedirected.current) {
      hasRedirected.current = true
      toast.success('Project created')
      startTransition(() => {
        router.push(`/projects/${state.projectId}`)
      })
    }
  }, [state, router])

  // Warn on browser navigation (reload, close tab) when form has unsaved data
  const hasUnsavedData = mode === 'blank' && (name.trim() !== '' || description.trim() !== '')

  useEffect(() => {
    if (!hasUnsavedData || hasRedirected.current) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedData])

  const stepConfig = STEPS[currentStep - 1]!

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl" data-testid="create-project-heading">
          Create a new project
        </CardTitle>
        <CardDescription>Start a PIPS improvement cycle by defining your project</CardDescription>
      </CardHeader>

      <CardContent>
        <ModeToggle mode={mode} onModeChange={setMode} />

        {mode === 'template' ? (
          <TemplatePicker />
        ) : (
          <>
            <Stepper currentStep={currentStep} />

            {/* Tip box */}
            <div
              className="mb-6 flex items-start gap-2 rounded-[var(--radius-md)] px-4 py-3"
              style={{ backgroundColor: 'var(--color-surface)' }}
              data-testid="step-tip"
            >
              <Lightbulb
                size={16}
                className="mt-0.5 shrink-0"
                style={{ color: 'var(--color-accent)' }}
              />
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {stepConfig.tip}
              </p>
            </div>

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

              {/* Hidden inputs so form always has data */}
              <input type="hidden" name="name" value={name} />
              <input type="hidden" name="description" value={description} />
              <input type="hidden" name="target_completion_date" value={targetDate} />

              {/* Step 1: Name & Description */}
              {currentStep === 1 && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Project name *</Label>
                    <Input
                      id="name"
                      type="text"
                      data-testid="project-name-input"
                      placeholder="e.g. Reduce onboarding time"
                      aria-required="true"
                      aria-describedby={state.fieldErrors?.name ? 'name-error' : undefined}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isPending}
                    />
                    {state.fieldErrors?.name && (
                      <p
                        id="name-error"
                        className="text-sm"
                        style={{ color: 'var(--color-error)' }}
                      >
                        {state.fieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      data-testid="project-description-input"
                      placeholder="Describe the process you want to improve..."
                      disabled={isPending}
                      rows={3}
                      aria-describedby={
                        state.fieldErrors?.description ? 'description-error' : undefined
                      }
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    {state.fieldErrors?.description && (
                      <p
                        id="description-error"
                        className="text-sm"
                        style={{ color: 'var(--color-error)' }}
                      >
                        {state.fieldErrors.description}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Step 2: Target Date */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="target_completion_date">Target completion date</Label>
                  <DatePicker
                    id="target_completion_date"
                    name="target_completion_date"
                    value={targetDate}
                    onChange={setTargetDate}
                    disabled={isPending}
                    aria-describedby={
                      state.fieldErrors?.target_completion_date ? 'target-date-error' : undefined
                    }
                  />
                  {state.fieldErrors?.target_completion_date && (
                    <p
                      id="target-date-error"
                      className="text-sm"
                      style={{ color: 'var(--color-error)' }}
                    >
                      {state.fieldErrors.target_completion_date}
                    </p>
                  )}
                </div>
              )}

              {/* Step 3: Review & Create */}
              {currentStep === 3 && (
                <div className="space-y-3" data-testid="review-summary">
                  <div>
                    <p
                      className="text-xs font-medium"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      Project name
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                      data-testid="review-name"
                    >
                      {name}
                    </p>
                  </div>
                  {description && (
                    <div>
                      <p
                        className="text-xs font-medium"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Description
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                        data-testid="review-description"
                      >
                        {description}
                      </p>
                    </div>
                  )}
                  {targetDate && (
                    <div>
                      <p
                        className="text-xs font-medium"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Target date
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                        data-testid="review-target-date"
                      >
                        {targetDate}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep((s) => s - 1)}
                    data-testid="step-back-button"
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep((s) => s + 1)}
                    disabled={currentStep === 1 && !name.trim()}
                    data-testid="step-next-button"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isPending || isNavigating}
                    data-testid="create-project-button"
                  >
                    {isPending
                      ? 'Creating project...'
                      : isNavigating
                        ? 'Redirecting...'
                        : 'Create project'}
                  </Button>
                )}
              </div>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  )
}
