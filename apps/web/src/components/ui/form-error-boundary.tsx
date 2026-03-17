'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type FormErrorBoundaryProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export const FormErrorBoundary = ({ error, reset }: FormErrorBoundaryProps) => {
  useEffect(() => {
    console.error('Form error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <AlertCircle className="h-12 w-12 text-red-500" aria-hidden="true" />
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || 'An error occurred while loading this form.'}
      </p>
      <Button onClick={reset} variant="outline">
        Try Again
      </Button>
    </div>
  )
}
