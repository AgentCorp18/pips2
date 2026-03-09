'use client'

import { ErrorBoundaryCard } from '@/components/layout/error-boundary'

const ReportsError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  return <ErrorBoundaryCard error={error} reset={reset} />
}

export default ReportsError
