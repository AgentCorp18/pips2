import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { PIPS_STEPS, STEP_CONTENT } from '@pips/shared'
import { TOOL_DETAILS } from './_tool-details'
import { getBaseUrl } from '@/lib/base-url'

const BASE_URL = getBaseUrl()

type ToolPageProps = {
  params: Promise<{ toolSlug: string }>
}

/** Find a form definition by its slugified type */
const findFormBySlug = (slug: string) => {
  for (const [stepNum, content] of Object.entries(STEP_CONTENT)) {
    for (const form of content.forms) {
      const formSlug = form.type.replace(/_/g, '-')
      if (formSlug === slug) {
        return { form, stepNumber: parseInt(stepNum), stepContent: content }
      }
    }
  }
  return null
}

export const generateMetadata = async ({ params }: ToolPageProps): Promise<Metadata> => {
  const { toolSlug } = await params
  const result = findFormBySlug(toolSlug)

  if (!result) {
    return { title: 'Tool Not Found' }
  }

  const detail = TOOL_DETAILS[toolSlug]
  const title = `${result.form.name} — PIPS Process Improvement Tool`
  const description = detail?.seoDescription ?? result.form.description

  return {
    title,
    description,
    alternates: {
      canonical: `/methodology/tools/${toolSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/methodology/tools/${toolSlug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

const ToolPage = async ({ params }: ToolPageProps) => {
  const { toolSlug } = await params
  const result = findFormBySlug(toolSlug)

  if (!result) {
    notFound()
  }

  const { form, stepNumber, stepContent } = result
  const step = PIPS_STEPS[stepNumber - 1]!
  const detail = TOOL_DETAILS[toolSlug]

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/methodology" className="hover:text-[var(--color-primary)]">
          Methodology
        </Link>
        <span>/</span>
        <Link
          href={`/methodology/step/${stepNumber}`}
          className="hover:text-[var(--color-primary)]"
        >
          Step {stepNumber}: {stepContent.title}
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">{form.name}</span>
      </nav>

      {/* Header */}
      <h1 className="font-serif text-3xl font-bold text-[var(--color-text-primary)] md:text-4xl">
        {form.name}
      </h1>
      <p className="mt-3 text-lg text-[var(--color-text-secondary)]">{form.description}</p>

      <div className="mt-3 flex items-center gap-2">
        <Link
          href={`/methodology/step/${stepNumber}`}
          className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-text-tertiary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Step {stepNumber}: {stepContent.title}
        </Link>
        {form.required && (
          <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary)]">
            Required
          </span>
        )}
      </div>

      {/* What It Is */}
      {detail && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            What is {form.name}?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {detail.whatItIs}
          </p>
        </section>
      )}

      {/* When to Use It */}
      {detail?.whenToUse && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">When to Use It</h2>
          <ul className="mt-4 space-y-2">
            {detail.whenToUse.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <span className="mt-1 text-[var(--color-primary)]">&#x2022;</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Step-by-Step Instructions */}
      {detail?.steps && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            How to Use It: Step by Step
          </h2>
          <ol className="mt-4 space-y-4">
            {detail.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: step.color }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{s.title}</p>
                  <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                    {s.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Example */}
      {detail?.example && (
        <section className="mt-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Example</h2>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {detail.example.scenario}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {detail.example.walkthrough}
          </p>
        </section>
      )}

      {/* Pro Tips */}
      {detail?.proTips && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-[var(--color-text-primary)]">
            <CheckCircle2 size={20} className="text-emerald-500" />
            Pro Tips
          </h2>
          <ul className="mt-4 space-y-2">
            {detail.proTips.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <span className="mt-1 text-emerald-500">&#x2713;</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Facilitation guidance from step */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Facilitation Guide
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {stepContent.methodology.facilitationGuide}
        </p>
      </section>

      {/* Related Tools in This Step */}
      {stepContent.forms.length > 1 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Other Tools in Step {stepNumber}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {stepContent.forms
              .filter((f) => f.type !== form.type)
              .map((f) => (
                <Link
                  key={f.type}
                  href={`/methodology/tools/${f.type.replace(/_/g, '-')}`}
                  className="group flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3 transition-all hover:border-[var(--color-primary)]"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{f.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
                      {f.description}
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

      {/* CTA */}
      <div className="mt-12 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Try {form.name} in your own project
        </p>
        <Link
          href="/signup"
          className="mt-3 inline-block rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Start Free
        </Link>
      </div>

      <div className="mt-8">
        <Link
          href={`/methodology/step/${stepNumber}`}
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        >
          <ArrowLeft size={14} />
          Back to Step {stepNumber}: {stepContent.title}
        </Link>
      </div>
    </div>
  )
}

export default ToolPage
