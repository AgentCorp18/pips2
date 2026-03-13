'use client'

import { useEffect } from 'react'
import { ErrorBoundaryCard } from '@/components/layout/error-boundary'

// Next.js requires a default export for error boundaries — this is intentional.
const AppError = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  useEffect(() => {
    // Log to console — Sentry will capture this when configured
    console.error('[AppError]', error)
  }, [error])

  return <ErrorBoundaryCard error={error} reset={reset} />
}

export default AppError
