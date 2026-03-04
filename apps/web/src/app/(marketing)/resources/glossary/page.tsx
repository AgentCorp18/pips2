import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getGlossaryLetters, getTermsByLetter } from './_glossary-data'

export const metadata: Metadata = {
  title: 'PIPS Glossary — Process Improvement Terms & Definitions',
  description:
    'A comprehensive glossary of process improvement and problem solving terms used in the PIPS methodology. Definitions, related tools, and step context for 35+ key concepts.',
  openGraph: {
    title: 'PIPS Glossary — Process Improvement Terms & Definitions',
    description:
      'Definitions, related tools, and step context for 35+ process improvement terms used in the PIPS methodology.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PIPS Glossary — Process Improvement Terms & Definitions',
    description: 'Definitions, related tools, and step context for 35+ process improvement terms.',
  },
}

const CATEGORY_LABELS: Record<string, string> = {
  methodology: 'Methodology',
  tool: 'Tool',
  principle: 'Principle',
  role: 'Role',
  concept: 'Concept',
}

const CATEGORY_COLORS: Record<string, string> = {
  methodology: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
  tool: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  principle: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  role: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  concept: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
}

const GlossaryPage = () => {
  const letters = getGlossaryLetters()
  const termsByLetter = getTermsByLetter()

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Header */}
      <section className="text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-5xl">
          PIPS Glossary
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-text-secondary)]">
          Definitions, context, and related tools for every term in the PIPS methodology.
        </p>
      </section>

      {/* Breadcrumbs */}
      <nav className="mt-8 flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/resources" className="hover:text-[var(--color-primary)]">
          Resources
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">Glossary</span>
      </nav>

      {/* Alphabetical Navigation */}
      <div className="mt-8 flex flex-wrap gap-2">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 hover:text-[var(--color-primary)]"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Terms by Letter */}
      <div className="mt-10 space-y-10">
        {letters.map((letter) => {
          const terms = termsByLetter[letter] ?? []
          return (
            <section key={letter} id={`letter-${letter}`}>
              <h2 className="mb-4 border-b border-[var(--color-border)] pb-2 text-2xl font-bold text-[var(--color-text-primary)]">
                {letter}
              </h2>
              <div className="space-y-3">
                {terms.map((term) => (
                  <Link
                    key={term.slug}
                    href={`/resources/glossary/${term.slug}`}
                    className="group flex items-start justify-between rounded-lg border border-[var(--color-border)] p-4 transition-all hover:border-[var(--color-primary)] hover:shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {term.term}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[term.category] ?? ''}`}
                        >
                          {CATEGORY_LABELS[term.category] ?? term.category}
                        </span>
                        {term.relatedStep && (
                          <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] text-[var(--color-text-tertiary)]">
                            Step {term.relatedStep}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {term.definition}
                      </p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="mt-1 shrink-0 text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* CTA */}
      <section className="mt-16 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-8 text-center">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Put these concepts into practice
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          PIPS gives you the tools, templates, and team collaboration to apply every term in this
          glossary to real improvement projects.
        </p>
        <Link
          href="/signup"
          className="mt-4 inline-block rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Get Started Free
        </Link>
      </section>
    </div>
  )
}

export default GlossaryPage
