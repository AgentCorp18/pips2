import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PIPS_STEPS, STEP_CONTENT } from '@pips/shared'
import { JsonLd } from '@/components/seo/json-ld'
import { getBaseUrl } from '@/lib/base-url'

const BASE_URL = getBaseUrl()

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PIPS',
  url: BASE_URL,
  description:
    'PIPS — Process Improvement & Problem Solving. A 6-step methodology for teams to identify problems, analyze root causes, and deliver measurable results.',
  foundingDate: '2026',
  sameAs: [],
  knowsAbout: [
    'Process Improvement',
    'Problem Solving',
    'Root Cause Analysis',
    'Continuous Improvement',
    'Lean',
    'Six Sigma',
    'PDCA',
    'Fishbone Diagram',
    'RACI Chart',
  ],
}

export const metadata: Metadata = {
  title: 'The Methodology — 6 Steps to Continuous Process Improvement',
  description:
    'A principle-driven, 6-step framework for solving problems and driving continuous improvement. Identify problems, analyze root causes, generate solutions, and deliver measurable results.',
  alternates: {
    canonical: '/methodology',
  },
  openGraph: {
    title: 'The PIPS Methodology — 6 Steps to Continuous Process Improvement',
    description:
      'A principle-driven, 6-step framework for solving problems and driving continuous improvement in any team, any industry.',
    url: `${BASE_URL}/methodology`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'The PIPS Methodology — 6 Steps to Continuous Process Improvement',
    description:
      'A principle-driven, 6-step framework for solving problems and driving continuous improvement in any team, any industry.',
  },
}

/** SEO pillar page: /methodology — public, no auth required */
const MethodologyPage = () => {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-16">
      <JsonLd data={organizationJsonLd} />
      {/* Hero */}
      <section className="text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-5xl">
          The PIPS Methodology
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-text-secondary)]">
          A 6-step, principle-driven framework for solving problems and driving continuous
          improvement — in any team, any industry.
        </p>
      </section>

      {/* Three Principles */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-[var(--color-text-primary)]">
          Three Core Principles
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Data Over Opinions',
              description:
                'Ground every decision in evidence. Measure before you act, and measure again after.',
            },
            {
              title: 'Expand Then Contract',
              description:
                'First diverge — generate many options. Then converge — select the best with objective criteria.',
            },
            {
              title: 'Close The Loop',
              description:
                'Every cycle ends with evaluation and feeds into the next. Improvement never stops.',
            },
          ].map((principle) => (
            <div
              key={principle.title}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            >
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                {principle.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 Steps */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-[var(--color-text-primary)]">
          The 6 Steps
        </h2>
        <div className="mt-8 space-y-6">
          {PIPS_STEPS.map((step) => {
            const content = STEP_CONTENT[step.number as 1 | 2 | 3 | 4 | 5 | 6]
            return (
              <Link
                key={step.number}
                href={`/methodology/step/${step.number}`}
                className="group block"
              >
                <div className="flex items-start gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all hover:border-[var(--color-primary)] hover:shadow-md">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      Step {step.number}: {step.name}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {content.objective}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {content.forms.map((form) => (
                        <span
                          key={form.type}
                          className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-text-tertiary)]"
                        >
                          {form.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="mt-1 shrink-0 text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Resources */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-[var(--color-text-primary)]">
          Learn More
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Link
            href="/book"
            className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all hover:border-[var(--color-primary)] hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              The Never-Ending Quest
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Read the complete PIPS book — 15 chapters covering philosophy, practice, and culture
              of continuous improvement.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">
              Browse Chapters <ArrowRight size={14} />
            </span>
          </Link>
          <Link
            href="/resources/glossary"
            className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all hover:border-[var(--color-primary)] hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              PIPS Glossary
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Definitions, context, and related tools for every term in the PIPS methodology.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">
              Browse Terms <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Ready to transform your team?
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Start using PIPS today — free for teams getting started.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Get Started Free
          </Link>
          <Link
            href="/book"
            className="rounded-lg border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-secondary)]"
          >
            Read the Book
          </Link>
        </div>
      </section>
    </main>
  )
}

export default MethodologyPage
