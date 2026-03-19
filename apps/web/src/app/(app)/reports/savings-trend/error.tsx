'use client'

import { ErrorBoundaryCard } from '@/components/layout/error-boundary'

const SavingsTrendError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  return <ErrorBoundaryCard error={error} reset={reset} />
}

export default SavingsTrendError
