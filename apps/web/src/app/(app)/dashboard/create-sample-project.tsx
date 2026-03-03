'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Beaker, Loader2 } from 'lucide-react'
import { createSampleProject } from './sample-project-action'

export const CreateSampleProject = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)

    const result = await createSampleProject()

    if (result.error) {
      setError(result.error)
      setLoading(false)
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
            Explore a pre-filled &ldquo;Parking Lot Safety Improvement&rdquo; project with completed
            Steps 1-2 so you can see how the methodology works.
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-2"
            onClick={handleClick}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Creating...
              </>
            ) : (
              'Try a Sample Project'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
