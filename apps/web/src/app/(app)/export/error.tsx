'use client'

import { useEffect } from 'react'
import { ErrorBoundaryCard } from '@/components/layout/error-boundary'

const ExportError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    console.error('[ExportError]', error)
  }, [error])

  return <ErrorBoundaryCard error={error} reset={reset} />
}

export default ExportError
