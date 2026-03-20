'use client'

import { useEffect } from 'react'
import { ErrorBoundaryCard } from '@/components/layout/error-boundary'

const ErrorPage = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  useEffect(() => {
    console.error('[RouteError]', error)
  }, [error])

  return <ErrorBoundaryCard error={error} reset={reset} />
}

export default ErrorPage
