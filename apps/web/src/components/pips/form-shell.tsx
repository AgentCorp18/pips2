'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Check, CloudUpload, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { saveFormData } from '@/app/(app)/projects/[projectId]/steps/[stepNumber]/forms/actions'
import type { ProductContext } from '@pips/shared'
import { buildProductContext } from '@pips/shared'
import { KnowledgeCadenceBar } from '@/components/knowledge-cadence/knowledge-cadence-bar'
import { FormViewProvider, type FormMode } from './form-view-context'
import { FormViewToggle } from './form-view-toggle'

/**
 * Serialize a value to JSON with keys sorted at every level.
 * This prevents false-positive "unsaved changes" when the same data arrives
 * with keys in a different insertion order.
 */
const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return '[' + value.map(stableStringify).join(',') + ']'
  }
  const sorted = Object.keys(value as Record<string, unknown>)
    .sort()
    .map((k) => JSON.stringify(k) + ':' + stableStringify((value as Record<string, unknown>)[k]))
    .join(',')
  return '{' + sorted + '}'
}

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
  const { title, description, required = false, cadenceContext, children } = props

  // Destructure specific primitive/stable props so useCallback deps are stable
  const projectId = props.projectId
  const stepNumber = props.stepNumber
  const formType = 'formType' in props ? props.formType : undefined
  const propsData = 'data' in props ? props.data : undefined
  const onSave = 'onSave' in props ? props.onSave : undefined
  const isDirty = 'isDirty' in props ? props.isDirty : undefined
  const onSaveSuccess = 'onSaveSuccess' in props ? props.onSaveSuccess : undefined

  const derivedCadenceContext = cadenceContext ?? buildProductContext(stepNumber, formType)

  const [viewMode, setViewMode] = useState<FormMode>('edit')
  const isViewMode = viewMode === 'view'

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [lastSaved, setLastSaved] = useState<string>(propsData ? stableStringify(propsData) : '')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* Derive pending-changes status from state (no refs in render) */
  const hasPendingChanges = onSave
    ? isDirty
    : propsData
      ? stableStringify(propsData) !== lastSaved
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

  const isSandbox = projectId === SANDBOX_PROJECT_ID

  /* Unified save function — depends on destructured stable values, not the props object */
  const doSave = useCallback(async () => {
    setSaveState('saving')

    if (onSave) {
      const result = await onSave()
      if (result.error) {
        setSaveState('idle')
        toast.error(result.error)
      } else {
        setSaveState('saved')
      }
    } else if (isSandbox && propsData && formType) {
      // Sandbox mode: save to localStorage
      try {
        const key = `pips-sandbox-${formType}`
        localStorage.setItem(key, JSON.stringify(propsData))
        setSaveState('saved')
        setLastSaved(stableStringify(propsData))
        onSaveSuccess?.()
      } catch {
        setSaveState('idle')
        toast.error('Failed to save to local storage')
      }
    } else if (propsData && projectId && formType) {
      const result = await saveFormData(projectId, stepNumber, formType, propsData)
      if (result.success) {
        setSaveState('saved')
        setLastSaved(stableStringify(propsData))
        onSaveSuccess?.()
      } else {
        setSaveState('idle')
        toast.error(result.error ?? 'Failed to save')
      }
    }
  }, [projectId, stepNumber, formType, propsData, onSave, onSaveSuccess, isSandbox])

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

  const handleManualSave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    void doSave().then(() => toast.success('Saved'))
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
            </div>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        {/* Knowledge Cadence Bar — contextual content links */}
        <KnowledgeCadenceBar context={derivedCadenceContext} defaultCollapsed />
      </div>
    </FormViewProvider>
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
