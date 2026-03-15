'use client'

import { useEffect } from 'react'
import { ErrorBoundaryCard } from '@/components/layout/error-boundary'

const InitiativesError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    console.error('[InitiativesError]', error)
  }, [error])

  return <ErrorBoundaryCard error={error} reset={reset} />
}

export default InitiativesError
