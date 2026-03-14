'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Check,
  CloudUpload,
  Download,
  Loader2,
  Clock,
  ChevronDown,
  Lightbulb,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { saveFormData } from '@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/actions'
import type { ProductContext } from '@pips/shared'
import { buildProductContext, STEP_CONTENT } from '@pips/shared'
import type { PipsStepNumber } from '@pips/shared'
import { KnowledgeCadenceBar } from '@/components/knowledge-cadence/knowledge-cadence-bar'
import { CreateTicketFromForm } from './create-ticket-from-form'
import { FormViewProvider, type FormMode } from './form-view-context'
import { FormViewToggle } from './form-view-toggle'
import { cn } from '@/lib/utils'
import type { ZodType } from 'zod'

type DisplayStatus = 'idle' | 'saving' | 'saved' | 'unsaved'

/* Data-driven mode (Steps 1-3): FormShell handles save internally */
type DataDrivenProps = {
  projectId: string
  stepNumber: number
  formType: string
  title: string
  description: string
  required?: boolean
  cadenceContext?: ProductContext
  children: React.ReactNode
  data: Record<string, unknown>
  /** Optional Zod schema — used to validate initialData and fall back to defaults on shape mismatch */
  schema?: ZodType<Record<string, unknown>>
  /** 3.4: Callback to import sandbox data into form state */
  onImportData?: (data: Record<string, unknown>) => void
  onSaveSuccess?: () => void
  onSave?: never
  isDirty?: never
}

/* Callback mode (Steps 4-6): form handles save, FormShell triggers it */
type CallbackProps = {
  projectId?: string
  stepNumber: number
  formType?: never
  title: string
  description: string
  required?: boolean
  cadenceContext?: ProductContext
  children: React.ReactNode
  data?: never
  onSaveSuccess?: never
  onSave: () => Promise<{ success?: boolean; error?: string }>
  isDirty: boolean
}

export type FormShellProps = DataDrivenProps | CallbackProps

/** Magic projectId that triggers sandbox mode (localStorage save) */
export const SANDBOX_PROJECT_ID = '__sandbox__'

export const FormShell = (props: FormShellProps) => {
  const { title, description, stepNumber, required = false, cadenceContext, children } = props
  const formType = 'formType' in props ? (props.formType as string | undefined) : undefined
  const derivedCadenceContext = cadenceContext ?? buildProductContext(stepNumber, formType)

  // 1.2: Derive time estimate and tips from STEP_CONTENT for this form
  const stepContent =
    stepNumber >= 1 && stepNumber <= 6 ? STEP_CONTENT[stepNumber as PipsStepNumber] : undefined
  const formDef = stepContent?.forms.find((f) => f.type === formType)
  const formTimeEstimate = formDef?.timeEstimate
  const aboutThisTool = stepContent?.methodology.tips
  const bestPractices = stepContent?.methodology.bestPractices

  const [viewMode, setViewMode] = useState<FormMode>('edit')
  const isViewMode = viewMode === 'view'

  /* BUG 3 FIX: Validate initialData through the Zod schema on first render.
     If the stored shape doesn't match (e.g. after a schema migration) fall back
     to the schema's own defaults so the form never crashes.  */
  const validatedInitialData = (() => {
    if (!props.data) return undefined
    if (!('schema' in props) || !props.schema) return props.data
    const result = props.schema.safeParse(props.data)
    if (result.success) return result.data
    const fallback = props.schema.safeParse({})
    return fallback.success ? fallback.data : props.data
  })()

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  // 4.1: Track whether this form has ever been saved in this session for first-save celebration
  const hasBeenSavedRef = useRef(!!validatedInitialData)
  const [lastSaved, setLastSaved] = useState<string>(
    validatedInitialData ? JSON.stringify(validatedInitialData) : '',
  )
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /* BUG 1 FIX: Track the in-flight save with an AbortController ref.
     When a new save is triggered while one is already in-flight, the previous
     request is aborted so its result can never overwrite newer data.  */
  const abortRef = useRef<AbortController | null>(null)

  /* Derive pending-changes status from state (no refs in render) */
  const hasPendingChanges = props.onSave
    ? props.isDirty
    : props.data
      ? JSON.stringify(props.data) !== lastSaved
      : false

  /* Compute display status */
  const displayStatus: DisplayStatus =
    saveState === 'saving'
      ? 'saving'
      : hasPendingChanges
        ? 'unsaved'
        : saveState === 'saved'
          ? 'saved'
          : 'idle'

  const isSandbox = 'projectId' in props && props.projectId === SANDBOX_PROJECT_ID
  const onImportData = 'onImportData' in props ? props.onImportData : undefined

  /* Extract specific prop values to avoid stale-closure from `props` object reference */
  const onSave = 'onSave' in props ? props.onSave : undefined
  const data = props.data
  const projectId = 'projectId' in props ? props.projectId : undefined
  const onSaveSuccess = 'onSaveSuccess' in props ? props.onSaveSuccess : undefined

  /* Unified save function — returns true on success, false on failure */
  const doSave = useCallback(async (): Promise<boolean> => {
    // BUG 1 FIX: Cancel any in-flight save before starting a new one
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller

    setSaveState('saving')

    if (onSave) {
      const result = await onSave()
      if (controller.signal.aborted) return false
      if (result.error) {
        setSaveState('idle')
        toast.error(result.error)
        return false
      } else {
        setSaveState('saved')
        return true
      }
    } else if (isSandbox && data && formType) {
      // Sandbox mode: save to localStorage
      try {
        const key = `pips-sandbox-${formType}`
        localStorage.setItem(key, JSON.stringify(data))
        if (controller.signal.aborted) return false
        setSaveState('saved')
        setLastSaved(JSON.stringify(data))
        onSaveSuccess?.()
        return true
      } catch {
        if (controller.signal.aborted) return false
        setSaveState('idle')
        toast.error('Failed to save to local storage')
        return false
      }
    } else if (data && projectId && formType) {
      const result = await saveFormData(projectId, stepNumber, formType, data)
      if (controller.signal.aborted) return false
      if (result.success) {
        setSaveState('saved')
        setLastSaved(JSON.stringify(data))
        // 4.1: First-save celebration for required forms
        if (!hasBeenSavedRef.current && required) {
          hasBeenSavedRef.current = true
          const nextStepHint =
            stepNumber < 6
              ? ` Great progress! Next up: advance to Step ${stepNumber + 1} when you're ready.`
              : ' You can now complete the evaluation.'
          toast.success(`${title} saved!${nextStepHint}`, { duration: 5000 })
        }
        onSaveSuccess?.()
        return true
      } else {
        setSaveState('idle')
        toast.error(result.error ?? 'Failed to save')
        return false
      }
    }

    return false
  }, [onSave, data, formType, projectId, stepNumber, onSaveSuccess, isSandbox, required, title])

  /* Auto-save with 2-second debounce — no synchronous setState */
  useEffect(() => {
    if (!hasPendingChanges) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void doSave()
    }, 2000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [hasPendingChanges, doSave])

  /* beforeunload warning — prompt when navigating away with unsaved changes */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingChanges) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasPendingChanges])

  /* BUG 2 FIX: Only show success toast when doSave actually succeeded */
  const handleManualSave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    void doSave().then((succeeded: boolean) => {
      if (succeeded) toast.success('Saved')
    })
  }

  return (
    <FormViewProvider value={viewMode}>
      <div className="space-y-4">
        {/* Back link + save status bar */}
        <div className="flex items-center justify-between">
          {isSandbox ? (
            <Link
              href="/tools"
              className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              data-testid="back-to-tools-link"
            >
              <ArrowLeft size={14} />
              Back to tools
            </Link>
          ) : projectId ? (
            <Link
              href={`/projects/${projectId}/steps/${stepNumber}`}
              className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              data-testid="back-to-step-link"
            >
              <ArrowLeft size={14} />
              Back to step
            </Link>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            {/* 3.2: Create Ticket button — only in project mode */}
            {!isSandbox && projectId && (
              <CreateTicketFromForm
                projectId={projectId}
                stepNumber={stepNumber}
                formTitle={title}
              />
            )}
            <FormViewToggle
              mode={viewMode}
              onToggle={() => setViewMode((m) => (m === 'edit' ? 'view' : 'edit'))}
            />
            {!isViewMode && (
              <>
                <SaveIndicator status={displayStatus} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSave}
                  disabled={saveState === 'saving'}
                  data-testid="form-save-button"
                >
                  <CloudUpload size={14} />
                  Save
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 3.4: Sandbox import banner — show when project form has sandbox data available */}
        {!isSandbox && formType && onImportData && (
          <SandboxImportBanner formType={formType} onImport={onImportData} />
        )}

        {/* Form card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              {isSandbox && (
                <Badge variant="outline" className="text-[10px]">
                  Sandbox
                </Badge>
              )}
              {required && !isSandbox && (
                <Badge variant="secondary" className="text-[10px]">
                  Required
                </Badge>
              )}
              {/* 1.2: Time estimate badge from form definition */}
              {formTimeEstimate && (
                <Badge
                  variant="outline"
                  className="gap-1 text-[10px] text-[var(--color-text-tertiary)]"
                  data-testid="form-time-badge"
                >
                  <Clock size={10} />
                  {formTimeEstimate}
                </Badge>
              )}
            </div>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        {/* 1.2: About This Tool — collapsible guidance from methodology */}
        {aboutThisTool && <AboutThisToolSection tips={aboutThisTool} />}

        {/* 2.4: Best Practices — collapsible panel */}
        {bestPractices && bestPractices.length > 0 && (
          <BestPracticesSection practices={bestPractices} />
        )}

        {/* Knowledge Cadence Bar — contextual content links */}
        <KnowledgeCadenceBar context={derivedCadenceContext} defaultCollapsed />
      </div>
    </FormViewProvider>
  )
}

/* ---- Best Practices (collapsible, progressive disclosure) ---- */

const BestPracticesSection = ({ practices }: { practices: string[] }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (practices.length === 0) return null

  return (
    <div className="rounded-lg border border-[var(--color-border)]" data-testid="best-practices">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
          <Check size={14} className="text-[var(--color-success)]" />
          Best Practices
          {!isOpen && (
            <span className="text-xs font-normal text-[var(--color-text-tertiary)]">
              — {practices[0]?.replace(/\*\*/g, '').slice(0, 50)}...
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'text-[var(--color-text-tertiary)] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <ul className="space-y-2">
            {practices.map((practice) => (
              <li
                key={practice}
                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-success)]" />
                <span
                  dangerouslySetInnerHTML={{
                    __html: practice
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>'),
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ---- About This Tool (collapsible tips) ---- */

const AboutThisToolSection = ({ tips }: { tips: string[] }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-lg border border-[var(--color-border)]" data-testid="about-this-tool">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
          <Lightbulb size={14} className="text-[var(--color-accent)]" />
          About This Tool
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'text-[var(--color-text-tertiary)] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <ul className="space-y-2">
            {tips.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                <span
                  dangerouslySetInnerHTML={{
                    __html: tip
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>'),
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ---- 3.4: Sandbox import banner ---- */

const checkSandboxData = (formType: string): boolean => {
  try {
    return !!localStorage.getItem(`pips-sandbox-${formType}`)
  } catch {
    return false
  }
}

const SandboxImportBanner = ({
  formType,
  onImport,
}: {
  formType: string
  onImport: (data: Record<string, unknown>) => void
}) => {
  const [dismissed, setDismissed] = useState(false)
  const hasSandboxData = checkSandboxData(formType)

  if (dismissed || !hasSandboxData) return null

  const handleImport = () => {
    try {
      const raw = localStorage.getItem(`pips-sandbox-${formType}`)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, unknown>
      onImport(parsed)
      setDismissed(true)
      toast.success('Sandbox data imported successfully')
    } catch {
      toast.error('Failed to import sandbox data')
    }
  }

  return (
    <div
      className="flex items-center justify-between rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-4 py-3"
      data-testid="sandbox-import-banner"
    >
      <div className="flex items-center gap-2">
        <Download size={14} className="text-[var(--color-primary)]" />
        <span className="text-sm text-[var(--color-text-secondary)]">
          You have sandbox data for this form.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="xs" onClick={handleImport}>
          Import
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

/* ---- Save status indicator ---- */

const SaveIndicator = ({ status }: { status: DisplayStatus }) => {
  switch (status) {
    case 'saving':
      return (
        <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
          <Loader2 size={12} className="animate-spin" />
          <span data-testid="save-indicator-saving">Saving...</span>
        </span>
      )
    case 'saved':
      return (
        <span className="flex items-center gap-1.5 text-xs text-[var(--color-success)]">
          <Check size={12} />
          <span data-testid="save-indicator-saved">Saved</span>
        </span>
      )
    case 'unsaved':
      return (
        <span className="flex items-center gap-1.5 text-xs text-[var(--color-warning)]">
          <span data-testid="save-indicator-unsaved">Unsaved changes</span>
        </span>
      )
    default:
      return null
  }
}
