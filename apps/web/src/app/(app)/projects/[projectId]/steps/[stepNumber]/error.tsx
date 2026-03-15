'use client'

import { useEffect } from 'react'
import { ErrorBoundaryCard } from '@/components/layout/error-boundary'

const StepError = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  useEffect(() => {
    console.error('[StepError]', error)
  }, [error])

  return <ErrorBoundaryCard error={error} reset={reset} />
}

export default StepError
