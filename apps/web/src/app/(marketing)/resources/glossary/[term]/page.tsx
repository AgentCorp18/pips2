import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { PIPS_STEPS } from '@pips/shared'
import { findTermBySlug, GLOSSARY_TERMS } from '../_glossary-data'

type TermPageProps = {
  params: Promise<{ term: string }>
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

export const generateMetadata = async ({ params }: TermPageProps): Promise<Metadata> => {
  const { term: slug } = await params
  const glossaryTerm = findTermBySlug(slug)

  if (!glossaryTerm) {
    return { title: 'Term Not Found' }
  }

  const title = `${glossaryTerm.term} — PIPS Glossary`
  const description = glossaryTerm.definition

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export const generateStaticParams = () => {
  return GLOSSARY_TERMS.map((t) => ({ term: t.slug }))
}

const TermPage = async ({ params }: TermPageProps) => {
  const { term: slug } = await params
  const glossaryTerm = findTermBySlug(slug)

  if (!glossaryTerm) {
    notFound()
  }

  const step = glossaryTerm.relatedStep ? PIPS_STEPS[glossaryTerm.relatedStep - 1] : null

  const relatedTermObjects = glossaryTerm.relatedTerms
    .map((slug) => findTermBySlug(slug))
    .filter((t): t is NonNullable<typeof t> => t !== null)

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-16">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/resources" className="hover:text-[var(--color-primary)]">
          Resources
        </Link>
        <span>/</span>
        <Link href="/resources/glossary" className="hover:text-[var(--color-primary)]">
          Glossary
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">{glossaryTerm.term}</span>
      </nav>

      {/* Header */}
      <h1 className="font-serif text-3xl font-bold text-[var(--color-text-primary)] md:text-4xl">
        {glossaryTerm.term}
      </h1>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[glossaryTerm.category] ?? ''}`}
        >
          {CATEGORY_LABELS[glossaryTerm.category] ?? glossaryTerm.category}
        </span>
        {step && (
          <Link
            href={`/methodology/step/${glossaryTerm.relatedStep}`}
            className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-text-tertiary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Step {glossaryTerm.relatedStep}: {step.name}
          </Link>
        )}
      </div>

      {/* Definition */}
      <section className="mt-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
          Definition
        </h2>
        <p className="mt-2 text-base font-medium text-[var(--color-text-primary)]">
          {glossaryTerm.definition}
        </p>
      </section>

      {/* Full Description */}
      <section className="mt-8">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {glossaryTerm.longDescription}
        </p>
      </section>

      {/* Related Tools */}
      {glossaryTerm.relatedTools.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Related Tools</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {glossaryTerm.relatedTools.map((tool) => (
              <Link
                key={tool}
                href={`/methodology/tools/${tool}`}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                {tool.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Terms */}
      {relatedTermObjects.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Related Terms</h2>
          <div className="mt-4 space-y-2">
            {relatedTermObjects.map((related) => (
              <Link
                key={related.slug}
                href={`/resources/glossary/${related.slug}`}
                className="group flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3 transition-all hover:border-[var(--color-primary)]"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {related.term}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
                    {related.definition}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Methodology Context */}
      {step && (
        <section className="mt-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Where This Fits in the PIPS Methodology
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            This concept is used in{' '}
            <Link
              href={`/methodology/step/${glossaryTerm.relatedStep}`}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              Step {glossaryTerm.relatedStep}: {step.name}
            </Link>{' '}
            — {step.description}.
          </p>
          <Link
            href={`/methodology/step/${glossaryTerm.relatedStep}`}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Learn about Step {glossaryTerm.relatedStep}
            <ArrowRight size={14} />
          </Link>
        </section>
      )}

      {/* CTA */}
      <div className="mt-12 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Put {glossaryTerm.term} into practice with PIPS
        </p>
        <Link
          href="/signup"
          className="mt-3 inline-block rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Get Started Free
        </Link>
      </div>

      {/* Back to Glossary */}
      <div className="mt-8">
        <Link
          href="/resources/glossary"
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        >
          <ArrowLeft size={14} />
          Back to Glossary
        </Link>
      </div>
    </main>
  )
}

export default TermPage
