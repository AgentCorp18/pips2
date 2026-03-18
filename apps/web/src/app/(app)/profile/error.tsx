'use client'

import { useEffect } from 'react'
import { ErrorBoundaryCard } from '@/components/layout/error-boundary'

const ProfileError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    console.error('[ProfileError]', error)
  }, [error])

  return <ErrorBoundaryCard error={error} reset={reset} />
}

export default ProfileError
