'use client'

import { ErrorBoundaryCard } from '@/components/layout/error-boundary'

const ProjectComparisonError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  return <ErrorBoundaryCard error={error} reset={reset} />
}

export default ProjectComparisonError
