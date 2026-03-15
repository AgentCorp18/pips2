'use client'

import { useEffect } from 'react'
import { ErrorBoundaryCard } from '@/components/layout/error-boundary'

const WorkbookStepError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    console.error('[WorkbookStepError]', error)
  }, [error])

  return <ErrorBoundaryCard error={error} reset={reset} />
}

export default WorkbookStepError
