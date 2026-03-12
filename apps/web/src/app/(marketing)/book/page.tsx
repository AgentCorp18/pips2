import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ArrowRight, Lock } from 'lucide-react'
import { BOOK_CHAPTER_MAP } from '@pips/shared'
import { getBaseUrl } from '@/lib/base-url'

const BASE_URL = getBaseUrl()

export const metadata: Metadata = {
  title: 'The Never-Ending Quest — Complete Methodology Book',
  description:
    'Read "The Never-Ending Quest" by Marc Albers — 15 chapters covering the philosophy, practice, and culture of continuous process improvement using the PIPS methodology.',
  alternates: {
    canonical: '/book',
  },
  openGraph: {
    title: 'The Never-Ending Quest — The Complete PIPS Methodology Book',
    description:
      '15 chapters on the philosophy, practice, and culture of continuous process improvement. Free preview chapters available.',
    url: `${BASE_URL}/book`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Never-Ending Quest — The Complete PIPS Methodology Book',
    description:
      '15 chapters on the philosophy, practice, and culture of continuous process improvement. Free preview chapters available.',
  },
}

/**
 * Book landing page — Table of Contents, public/unauthenticated.
 *
 * All chapter links navigate to /book/[chapterSlug] regardless of access level.
 * The individual chapter pages handle locked/gated states with preview content
 * and signup CTAs — there is no redirect from this TOC.
 */
export const BookLandingPage = () => {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-6 py-16">
      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
          <BookOpen size={32} className="text-[var(--color-primary)]" />
        </div>
        <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
          The Never-Ending Quest
        </h1>
        <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
          The complete guide to the PIPS methodology by Marc Albers
        </p>
        <p className="mx-auto mt-4 max-w-lg text-sm text-[var(--color-text-tertiary)]">
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
            const isFree = index < 3 // Foreword, Introduction, Ch.1 are fully free
            const isEmailGated = index >= 3 && index < 6 // Ch.2–4 are free with signup
            const isPaid = index >= 6 // Ch.5+ and appendices require a PIPS account

            return (
              // All chapters link directly to their chapter page — never to /pricing or /signup.
              // Gating and preview CTAs are handled by the chapter page itself.
              <Link
                key={ch.chapter}
                href={`/book/${ch.chapter}`}
                data-testid={`chapter-link-${ch.chapter}`}
                className={`group flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3 transition-all ${
                  isFree
                    ? 'cursor-pointer hover:border-[var(--color-primary)] hover:shadow-sm'
                    : 'cursor-pointer hover:border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono text-xs text-[var(--color-text-tertiary)]">
                    {index < 2 ? '' : `${index - 1}`}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {ch.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isFree && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                      Free
                    </span>
                  )}
                  {isEmailGated && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      Free with signup
                    </span>
                  )}
                  {isPaid && <Lock size={12} className="text-[var(--color-text-tertiary)]" />}
                  <ArrowRight
                    size={14}
                    className="text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                  />
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
    </main>
  )
}

export default BookLandingPage
