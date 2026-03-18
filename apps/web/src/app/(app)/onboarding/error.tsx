'use client'

import { useEffect } from 'react'
import { ErrorBoundaryCard } from '@/components/layout/error-boundary'

const OnboardingError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    console.error('[OnboardingError]', error)
  }, [error])

  return <ErrorBoundaryCard error={error} reset={reset} />
}

export default OnboardingError
