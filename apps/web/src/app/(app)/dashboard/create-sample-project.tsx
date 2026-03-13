'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Beaker, Loader2 } from 'lucide-react'
import { PROJECT_TEMPLATES } from '@pips/shared'
import { createSampleProject } from './sample-project-action'

export const CreateSampleProject = () => {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
            Explore a pre-filled project with completed steps to see how the methodology works.
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {PROJECT_TEMPLATES.map((t) => (
              <Button
                key={t.id}
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleClick(t.id)}
                disabled={loadingId !== null}
                data-testid={`sample-project-${t.id}`}
              >
                {loadingId === t.id ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  t.name
                )}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {PROJECT_TEMPLATES.map((t) => t.industry).join(' · ')}
          </p>
        </div>
      </div>
    </div>
  )
}
