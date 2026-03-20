'use client'

import { useState } from 'react'
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
  const [retryCount, setRetryCount] = useState(0)

  const handleRetry = () => {
    setRetryCount((c) => c + 1)
    reset()
  }

  const handleCopyDigest = () => {
    if (error.digest) {
      void navigator.clipboard.writeText(error.digest)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6" data-testid="error-boundary">
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

          {retryCount >= 2 && (
            <p
              className="mb-4 max-w-sm text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
              data-testid="error-boundary-still-having-trouble"
            >
              Still having trouble?{' '}
              <Link
                href="/dashboard"
                className="underline"
                style={{ color: 'var(--color-primary)' }}
              >
                Go to the Dashboard
              </Link>{' '}
              or{' '}
              <a
                href="mailto:support@pips-app.com"
                className="underline"
                style={{ color: 'var(--color-primary)' }}
              >
                contact support
              </a>
              .
            </p>
          )}

          <div className="flex gap-3">
            <Button onClick={handleRetry} variant="default" data-testid="error-boundary-retry">
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>

          {error.digest && (
            <p
              className="mt-4 text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
              data-testid="error-boundary-digest"
            >
              Error ref: {error.digest}
              <button
                onClick={handleCopyDigest}
                className="ml-2 underline"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Copy
              </button>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
