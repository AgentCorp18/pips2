import Link from 'next/link'
import { BookOpen, ArrowRight, Lock } from 'lucide-react'
import { BOOK_CHAPTER_MAP } from '@pips/shared'

/** Book landing page — lead gen, public */
const BookLandingPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
          <BookOpen size={32} className="text-[var(--color-primary)]" />
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
          The Never-Ending Quest
        </h1>
        <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
          The complete guide to the PIPS methodology by Marc Albers
        </p>
        <p className="mt-4 mx-auto max-w-lg text-sm text-[var(--color-text-tertiary)]">
          15 chapters covering the philosophy, practice, and culture of continuous process
          improvement. From first problem statement to organizational transformation.
        </p>
      </section>

      {/* Chapter List */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Table of Contents
        </h2>
        <div className="mt-6 space-y-2">
          {BOOK_CHAPTER_MAP.map((ch, index) => {
            const isFree = index < 3 // Foreword, Introduction, Ch.1 are free
            const isEmailGated = index >= 3 && index < 6 // Ch.2-3 email-gated
            const isPaid = index >= 6

            return (
              <Link
                key={ch.chapter}
                href={isFree ? `/book/${ch.chapter}` : '#'}
                className={`group flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3 transition-all ${
                  isFree
                    ? 'cursor-pointer hover:border-[var(--color-primary)] hover:shadow-sm'
                    : 'cursor-default opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs font-mono text-[var(--color-text-tertiary)]">
                    {index < 2 ? '' : `${index - 1}`}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {ch.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isFree && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                      Free
                    </span>
                  )}
                  {isEmailGated && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                      Free with signup
                    </span>
                  )}
                  {isPaid && <Lock size={12} className="text-[var(--color-text-tertiary)]" />}
                  {isFree && (
                    <ArrowRight
                      size={14}
                      className="text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                    />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-8 text-center">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Get full access to all chapters
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Sign up for PIPS to read the complete book and put the methodology into practice.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-block rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Sign Up Free
        </Link>
      </section>
    </div>
  )
}

export default BookLandingPage
