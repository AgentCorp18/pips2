'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type ErrorBoundaryCardProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export const ErrorBoundaryCard = ({ error, reset }: ErrorBoundaryCardProps) => {
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          >
            <AlertTriangle size={32} style={{ color: '#EF4444' }} />
          </div>

          <h2 className="mb-2 text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Something went wrong
          </h2>

          <p
            className="mb-6 max-w-sm text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            An unexpected error occurred. Please try again or return to the dashboard.
          </p>

          {isDev && error.message && (
            <pre
              className="mb-6 w-full overflow-auto rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-left font-mono text-xs"
              style={{
                backgroundColor: 'var(--color-surface-secondary)',
                color: '#EF4444',
              }}
            >
              {error.message}
            </pre>
          )}

          <div className="flex gap-3">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
