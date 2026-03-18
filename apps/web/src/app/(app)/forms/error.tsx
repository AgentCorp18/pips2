'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

const FormsError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    console.error('Forms page error:', error)
  }, [error])

  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <h2 className="mb-2 text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Something went wrong
      </h2>
      <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {error.message || 'Failed to load forms.'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}

export default FormsError
