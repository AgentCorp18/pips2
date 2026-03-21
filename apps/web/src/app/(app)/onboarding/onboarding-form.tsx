'use client'

import { useActionState, useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createOrganization, checkSlugAvailability, type OnboardingActionState } from './actions'

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)

const initialState: OnboardingActionState = {}

export const OnboardingForm = () => {
  const [state, formAction, isPending] = useActionState(createOrganization, initialState)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Check slug availability with debounce
  const checkSlug = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 3) {
      setSlugStatus('idle')
      return
    }
    setSlugStatus('checking')
    debounceRef.current = setTimeout(async () => {
      const { available } = await checkSlugAvailability(value)
      setSlugStatus(available ? 'available' : 'taken')
    }, 400)
  }, [])

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugEdited) {
      const newSlug = generateSlug(value)
      setSlug(newSlug)
      checkSlug(newSlug)
    }
  }

  const handleSlugChange = (value: string) => {
    setSlugEdited(true)
    const lower = value.toLowerCase()
    setSlug(lower)
    checkSlug(lower)
  }

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-1.5" aria-hidden="true">
          <span className="step-1 pip-dot pip-dot--sm" />
          <span className="step-2 pip-dot pip-dot--sm" />
          <span className="step-3 pip-dot pip-dot--sm" />
          <span className="step-4 pip-dot pip-dot--sm" />
          <span className="step-5 pip-dot pip-dot--sm" />
          <span className="step-6 pip-dot pip-dot--sm" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">Create your organization</CardTitle>
            <CardDescription className="text-center">
              Set up your workspace to start improving processes with PIPS
            </CardDescription>
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

              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Organization name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Acme Corporation"
                  aria-required="true"
                  aria-describedby={state.fieldErrors?.name ? 'org-name-error' : undefined}
                  required
                  disabled={isPending}
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
                {state.fieldErrors?.name && (
                  <p
                    id="org-name-error"
                    className="text-sm"
                    style={{ color: 'var(--color-error)' }}
                  >
                    {state.fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="slug">URL slug *</Label>
                <div className="flex items-center gap-0">
                  <span
                    aria-hidden="true"
                    className="flex h-9 items-center rounded-l-md border border-r-0 px-3 text-sm"
                    style={{
                      backgroundColor: 'var(--color-surface-secondary)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-tertiary)',
                    }}
                  >
                    pips-app.vercel.app/
                  </span>
                  <Input
                    id="slug"
                    name="slug"
                    type="text"
                    placeholder="acme-corp"
                    aria-required="true"
                    aria-describedby={
                      state.fieldErrors?.slug
                        ? 'slug-error'
                        : slugStatus !== 'idle'
                          ? 'slug-status'
                          : undefined
                    }
                    required
                    disabled={isPending}
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
                {slugStatus === 'checking' && (
                  <p
                    id="slug-status"
                    aria-live="polite"
                    className="text-sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Checking availability...
                  </p>
                )}
                {slugStatus === 'available' && (
                  <p
                    id="slug-status"
                    aria-live="polite"
                    className="text-sm"
                    style={{ color: 'var(--color-success)' }}
                  >
                    This slug is available
                  </p>
                )}
                {slugStatus === 'taken' && (
                  <p
                    id="slug-status"
                    aria-live="polite"
                    className="text-sm"
                    style={{ color: 'var(--color-error)' }}
                  >
                    This slug is already taken
                  </p>
                )}
                {state.fieldErrors?.slug && (
                  <p id="slug-error" className="text-sm" style={{ color: 'var(--color-error)' }}>
                    {state.fieldErrors.slug}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="mt-2 w-full"
                disabled={isPending || slugStatus === 'taken'}
              >
                {isPending ? 'Creating organization...' : 'Create organization'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
