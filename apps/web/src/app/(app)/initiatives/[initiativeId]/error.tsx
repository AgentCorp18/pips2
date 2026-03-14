'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const InitiativeError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  useEffect(() => {
    console.error('Initiative error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Something went wrong
      </h2>
      <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {error.message || 'Failed to load initiative'}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Link href="/initiatives">
          <Button>Back to Initiatives</Button>
        </Link>
      </div>
    </div>
  )
}

export default InitiativeError
