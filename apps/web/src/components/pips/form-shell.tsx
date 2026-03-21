'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Check,
  CloudUpload,
  Download,
  Clock,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  saveFormData,
  getProjectTitle,
} from '@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/actions'
import type { ProductContext } from '@pips/shared'
import { buildProductContext, STEP_CONTENT } from '@pips/shared'
import type { PipsStepNumber } from '@pips/shared'
import { KnowledgeCadenceBar } from '@/components/knowledge-cadence/knowledge-cadence-bar'
import { CreateTicketFromForm } from './create-ticket-from-form'
import { CopyFromProjectDialog } from './copy-from-project-dialog'
import { FormViewProvider, type FormMode } from './form-view-context'
import { FormViewToggle } from './form-view-toggle'
import { SaveStatusIndicator, type SaveState } from './save-status-indicator'
import { PostFormNudge } from './post-form-nudge'
import { cn } from '@/lib/utils'
import type { ZodType } from 'zod'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog'

type DisplayStatus = 'idle' | 'saving' | 'saved' | 'unsaved' | 'error'

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
  /** Optional project title for the breadcrumb — fetched automatically if omitted */
  projectTitle?: string
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
  /** Optional project title for the breadcrumb — fetched automatically if omitted */
  projectTitle?: string
}

export type FormShellProps = DataDrivenProps | CallbackProps

/** Magic projectId that triggers sandbox mode (localStorage save) */
export const SANDBOX_PROJECT_ID = '__sandbox__'

export const FormShell = (props: FormShellProps) => {
  const { title, description, stepNumber, required = false, cadenceContext, children } = props
  const formType = 'formType' in props ? (props.formType as string | undefined) : undefined
  const derivedCadenceContext = cadenceContext ?? buildProductContext(stepNumber, formType)
  const propProjectTitle = 'projectTitle' in props ? props.projectTitle : undefined

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

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  // Track whether to show the PostFormNudge after a successful save
  const [showNudge, setShowNudge] = useState(false)
  // 4.1: Track whether this form has ever been saved in this session for first-save celebration
  const hasBeenSavedRef = useRef(!!validatedInitialData)
  const [lastSaved, setLastSaved] = useState<string>(
    validatedInitialData ? JSON.stringify(validatedInitialData) : '',
  )
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
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

  /* Compute display status.
     Priority order: saving > error (show retry) > unsaved > saved > idle.
     Error takes precedence over unsaved so "Save failed" + Retry is shown
     after a failed auto-save rather than "Unsaved changes". */
  const displayStatus: DisplayStatus =
    saveState === 'saving'
      ? 'saving'
      : saveState === 'error'
        ? 'error'
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

  // Fetch project title for breadcrumb if not passed as prop
  const [fetchedProjectTitle, setFetchedProjectTitle] = useState<string | null>(
    propProjectTitle ?? null,
  )
  useEffect(() => {
    if (propProjectTitle || !projectId || isSandbox) return
    void getProjectTitle(projectId).then((t) => {
      if (t) setFetchedProjectTitle(t)
    })
  }, [projectId, isSandbox, propProjectTitle])

  const breadcrumbProjectTitle = propProjectTitle ?? fetchedProjectTitle

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
        setSaveState('error')
        toast.error(result.error)
        return false
      } else {
        setSaveState('saved')
        setLastSavedAt(new Date())
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
        setLastSavedAt(new Date())
        onSaveSuccess?.()
        return true
      } catch {
        if (controller.signal.aborted) return false
        setSaveState('error')
        toast.error('Failed to save to local storage')
        return false
      }
    } else if (data && projectId && formType) {
      const result = await saveFormData(projectId, stepNumber, formType, data)
      if (controller.signal.aborted) return false
      if (result.success) {
        setSaveState('saved')
        setLastSaved(JSON.stringify(data))
        setLastSavedAt(new Date())
        setShowNudge(true)
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
        setSaveState('error')
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

  /* Unsaved changes — beforeunload + client-side navigation dialog */
  const router = useRouter()
  const {
    showDialog,
    confirmDiscard,
    cancelDiscard,
    guardNavigation: baseGuard,
  } = useUnsavedChanges({
    isDirty: hasPendingChanges,
  })

  /* Flush-save wrapper: on navigation attempt, cancel debounce and save
     immediately. If save succeeds → navigate without dialog. Only show
     discard dialog when the save actually fails. This prevents the false-
     positive dialog when auto-save would have saved the data anyway. */
  const guardNavigation = useCallback(
    (action: () => void) => {
      if (!hasPendingChanges) {
        action()
        return
      }
      // Cancel pending debounce timer
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      // Flush save immediately
      void doSave().then((succeeded) => {
        if (succeeded) {
          action() // Navigate without dialog
        } else {
          baseGuard(action) // Show discard dialog
        }
      })
    },
    [hasPendingChanges, doSave, baseGuard],
  )

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
        {/* Breadcrumb + save status bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {isSandbox ? (
            <GuardedLink
              href="/forms"
              className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              data-testid="back-to-forms-link"
              isDirty={hasPendingChanges}
              guardNavigation={guardNavigation}
              router={router}
            >
              <ArrowLeft size={14} />
              Back to forms
            </GuardedLink>
          ) : projectId ? (
            <nav aria-label="Breadcrumb" data-testid="form-breadcrumb" className="min-w-0">
              <ol className="flex flex-wrap items-center gap-1 text-sm">
                <li>
                  <GuardedLink
                    href="/projects"
                    className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                    isDirty={hasPendingChanges}
                    guardNavigation={guardNavigation}
                    router={router}
                  >
                    Projects
                  </GuardedLink>
                </li>
                <li>
                  <ChevronRight size={12} className="text-[var(--color-text-tertiary)]" />
                </li>
                <li className="hidden sm:block">
                  <GuardedLink
                    href={`/projects/${projectId}`}
                    className="max-w-[160px] truncate text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                    isDirty={hasPendingChanges}
                    guardNavigation={guardNavigation}
                    router={router}
                  >
                    {breadcrumbProjectTitle
                      ? breadcrumbProjectTitle.length > 30
                        ? `${breadcrumbProjectTitle.slice(0, 30)}…`
                        : breadcrumbProjectTitle
                      : 'Project'}
                  </GuardedLink>
                </li>
                <li className="hidden sm:block">
                  <ChevronRight size={12} className="text-[var(--color-text-tertiary)]" />
                </li>
                <li>
                  <GuardedLink
                    href={`/projects/${projectId}/steps/${stepNumber}`}
                    className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                    isDirty={hasPendingChanges}
                    guardNavigation={guardNavigation}
                    router={router}
                  >
                    Step {stepNumber}
                    {stepContent ? `: ${stepContent.title}` : ''}
                  </GuardedLink>
                </li>
                <li>
                  <ChevronRight size={12} className="text-[var(--color-text-tertiary)]" />
                </li>
                <li
                  aria-current="page"
                  className="min-w-0 truncate font-medium text-[var(--color-text-primary)] max-w-[160px] sm:max-w-[200px]"
                >
                  {title}
                </li>
              </ol>
            </nav>
          ) : (
            <div />
          )}
          <div className="flex shrink-0 items-center gap-3">
            {/* 3.2: Create Ticket button — only in project mode */}
            {!isSandbox && projectId && (
              <CreateTicketFromForm
                projectId={projectId}
                stepNumber={stepNumber}
                formTitle={title}
              />
            )}
            {/* F6: Copy from Project — only in project mode with a known form type */}
            {!isSandbox && projectId && formType && (
              <CopyFromProjectDialog
                projectId={projectId}
                stepNumber={stepNumber}
                formType={formType}
                onCopied={() => window.location.reload()}
              />
            )}
            <FormViewToggle
              mode={viewMode}
              onToggle={() => setViewMode((m) => (m === 'edit' ? 'view' : 'edit'))}
            />
            {!isViewMode && (
              <>
                {displayStatus === 'unsaved' ? (
                  <span
                    data-testid="save-status-indicator"
                    className="flex items-center gap-1.5 text-xs text-[var(--color-warning)]"
                  >
                    <span data-testid="save-indicator-unsaved">Unsaved changes</span>
                  </span>
                ) : (
                  <SaveStatusIndicator
                    state={
                      (displayStatus === 'saving' ||
                      displayStatus === 'saved' ||
                      displayStatus === 'error'
                        ? displayStatus
                        : 'idle') satisfies SaveState
                    }
                    lastSavedAt={lastSavedAt}
                    onRetry={displayStatus === 'error' ? handleManualSave : undefined}
                  />
                )}
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

        {/* Post-save nudge — suggests next form after a successful save (project mode only) */}
        {!isSandbox && projectId && formType && stepNumber >= 1 && stepNumber <= 6 && (
          <PostFormNudge
            projectId={projectId}
            stepNumber={stepNumber as PipsStepNumber}
            completedFormTypes={new Set([formType])}
            justCompletedType={formType}
            visible={showNudge}
          />
        )}
      </div>

      {/* Discard changes confirmation dialog */}
      <UnsavedChangesDialog
        open={showDialog}
        onDiscard={confirmDiscard}
        onKeepEditing={cancelDiscard}
      />
    </FormViewProvider>
  )
}

/* ---- Inline markdown renderer (bold + italic only, no dangerouslySetInnerHTML) ---- */

/**
 * Renders a string containing **bold** and *italic* markdown syntax as React
 * elements. Content comes exclusively from static step-content.ts (developer-
 * authored), but we avoid dangerouslySetInnerHTML entirely as a defence-in-depth
 * measure — it removes the XSS risk category completely.
 */
const InlineMarkdown = ({ text }: { text: string }): React.ReactElement => {
  // Split on **bold** or *italic* tokens, keeping the delimiters via capture groups
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/)

  const nodes = parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>
    }
    return <span key={index}>{part}</span>
  })

  return <>{nodes}</>
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
                <span>
                  <InlineMarkdown text={practice} />
                </span>
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
                <span>
                  <InlineMarkdown text={tip} />
                </span>
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

/* ---- Guarded Link — intercepts navigation when form is dirty ---- */

type GuardedLinkProps = {
  href: string
  isDirty: boolean
  guardNavigation: (action: () => void) => void
  router: ReturnType<typeof useRouter>
  className?: string
  children: React.ReactNode
  'data-testid'?: string
}

const GuardedLink = ({
  href,
  isDirty,
  guardNavigation: guard,
  router,
  className,
  children,
  ...rest
}: GuardedLinkProps) => {
  if (!isDirty) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => guard(() => router.push(href))}
      {...rest}
    >
      {children}
    </button>
  )
}
