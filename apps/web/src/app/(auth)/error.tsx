'use client'

import { useEffect } from 'react'
import { ErrorBoundaryCard } from '@/components/layout/error-boundary'

const AuthError = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  useEffect(() => {
    console.error('[AuthError]', error)
  }, [error])

  return <ErrorBoundaryCard error={error} reset={reset} />
}

export default AuthError
