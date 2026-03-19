'use client'

import { useEffect } from 'react'
import { ErrorBoundaryCard } from '@/components/layout/error-boundary'

const WorkloadError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    console.error('[WorkloadError]', error)
  }, [error])

  return <ErrorBoundaryCard error={error} reset={reset} />
}

export default WorkloadError
