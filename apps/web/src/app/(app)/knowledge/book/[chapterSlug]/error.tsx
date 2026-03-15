'use client'

import { useEffect } from 'react'
import { ErrorBoundaryCard } from '@/components/layout/error-boundary'

const ChapterError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    console.error('[ChapterError]', error)
  }, [error])

  return <ErrorBoundaryCard error={error} reset={reset} />
}

export default ChapterError
