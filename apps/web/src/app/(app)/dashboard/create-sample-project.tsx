'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Beaker, Loader2, ChevronDown } from 'lucide-react'
import { PROJECT_TEMPLATES } from '@pips/shared'
import { createSampleProject } from './sample-project-action'

export const CreateSampleProject = () => {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  const handleClick = async (templateId: string) => {
    setLoadingId(templateId)
    setError(null)

    const result = await createSampleProject(templateId)

    if (result.error) {
      setError(result.error)
      setLoadingId(null)
      return
    }

    if (result.projectId) {
      router.push(`/projects/${result.projectId}`)
    }
  }

  const completedCount = (steps: { status: string }[]) =>
    steps.filter((s) => s.status === 'completed').length

  // Show first 3 by default, rest when expanded
  const visibleTemplates = expanded ? PROJECT_TEMPLATES : PROJECT_TEMPLATES.slice(0, 3)

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-dashed p-6"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--color-primary-subtle)' }}
        >
          <Beaker size={20} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            New to PIPS? Try a sample project
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Explore pre-filled projects at various stages to see how the methodology works.
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTemplates.map((t) => {
              const done = completedCount(t.steps)
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleClick(t.id)}
                  disabled={loadingId !== null}
                  className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-secondary)] disabled:opacity-50"
                  data-testid={`sample-project-${t.id}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--color-text-primary)] line-clamp-1">
                      {loadingId === t.id ? (
                        <span className="flex items-center gap-1">
                          <Loader2 size={12} className="animate-spin" />
                          Creating...
                        </span>
                      ) : (
                        t.name
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                      {t.industry}
                    </Badge>
                    <span className="text-[10px] text-[var(--color-text-tertiary)]">
                      {done}/6 steps
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {PROJECT_TEMPLATES.length > 3 && (
            <Button
              variant="ghost"
              size="xs"
              className="mt-2 gap-1 text-[var(--color-text-tertiary)]"
              onClick={() => setExpanded(!expanded)}
            >
              <ChevronDown
                size={12}
                className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'}
              />
              {expanded ? 'Show fewer' : `Show ${PROJECT_TEMPLATES.length - 3} more templates`}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
