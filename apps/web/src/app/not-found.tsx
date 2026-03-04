import Link from 'next/link'
import { FileQuestion, Home, LogIn } from 'lucide-react'
import { PIPS_STEPS } from '@pips/shared'

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4">
      {/* Pip dots */}
      <div className="mb-8 flex items-center gap-2">
        {PIPS_STEPS.map((step) => (
          <span
            key={step.number}
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: step.color }}
          />
        ))}
      </div>

      {/* Icon */}
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--color-primary-subtle)' }}
      >
        <FileQuestion size={40} style={{ color: 'var(--color-primary)' }} />
      </div>

      {/* Heading */}
      <h1
        className="mb-2 font-serif text-3xl font-normal"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Page not found
      </h1>

      {/* Description */}
      <p
        className="mb-8 max-w-md text-center text-base leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        The page you are looking for does not exist, has been moved, or is temporarily unavailable.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          <Home size={16} />
          Go Home
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--color-neutral-50)]"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          <LogIn size={16} />
          Sign In
        </Link>
      </div>

      {/* Footer note */}
      <p className="mt-12 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        PIPS — Process Improvement &amp; Problem Solving
      </p>
    </div>
  )
}

export default NotFound
