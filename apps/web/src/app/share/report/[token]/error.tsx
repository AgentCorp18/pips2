'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

type ShareReportErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

const ShareReportError = ({ reset }: ShareReportErrorProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col items-center rounded-xl border p-10 text-center">
        <div
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: '#FEF2F2' }}
        >
          <AlertTriangle size={28} style={{ color: '#EF4444' }} />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Unable to load report</h2>
        <p className="mb-6 text-sm" style={{ color: '#6b7280' }}>
          The share link may have expired or the report data could not be retrieved.
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: '#4F46E5' }}
          >
            Try again
          </button>
          <Link
            href="/login"
            className="rounded-lg border px-4 py-2 text-sm font-medium"
            style={{ borderColor: '#e5e7eb', color: '#374151' }}
          >
            Sign in to PIPS
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ShareReportError
