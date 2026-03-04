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

export const FormShell = (props: FormShellProps) => {
  const { title, description, stepNumber, required = false, cadenceContext, children } = props
  const formType = 'formType' in props ? (props.formType as string | undefined) : undefined
  const derivedCadenceContext = cadenceContext ?? buildProductContext(stepNumber, formType)

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [lastSaved, setLastSaved] = useState<string>(props.data ? JSON.stringify(props.data) : '')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  /* Unified save function */
  const doSave = useCallback(async () => {
    setSaveState('saving')

    if (props.onSave) {
      const result = await props.onSave()
      if (result.error) {
        setSaveState('idle')
        toast.error(result.error)
      } else {
        setSaveState('saved')
      }
    } else if (props.data && props.projectId && props.formType) {
      const result = await saveFormData(
        props.projectId,
        props.stepNumber,
        props.formType,
        props.data,
      )
      if (result.success) {
        setSaveState('saved')
        setLastSaved(JSON.stringify(props.data))
        props.onSaveSuccess?.()
      } else {
        setSaveState('idle')
        toast.error(result.error ?? 'Failed to save')
      }
    }
  }, [props])

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

  const projectId = props.projectId

  return (
    <div className="space-y-4">
      {/* Back link + save status bar */}
      <div className="flex items-center justify-between">
        {projectId ? (
          <Link
            href={`/projects/${projectId}/steps/${stepNumber}`}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <ArrowLeft size={14} />
            Back to step
          </Link>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-3">
          <SaveIndicator status={displayStatus} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={saveState === 'saving'}
          >
            <CloudUpload size={14} />
            Save
          </Button>
        </div>
      </div>

      {/* Form card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            {required && (
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
  )
}

/* ---- Save status indicator ---- */

const SaveIndicator = ({ status }: { status: DisplayStatus }) => {
  switch (status) {
    case 'saving':
      return (
        <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
          <Loader2 size={12} className="animate-spin" />
          Saving...
        </span>
      )
    case 'saved':
      return (
        <span className="flex items-center gap-1.5 text-xs text-[var(--color-success)]">
          <Check size={12} />
          Saved
        </span>
      )
    case 'unsaved':
      return (
        <span className="flex items-center gap-1.5 text-xs text-[var(--color-warning)]">
          Unsaved changes
        </span>
      )
    default:
      return null
  }
}
