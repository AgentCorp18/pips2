import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { PIPS_STEPS, STEP_CONTENT, type PipsStepNumber } from '@pips/shared'

type StepPageProps = {
  params: Promise<{ stepNumber: string }>
}

const StepPage = async ({ params }: StepPageProps) => {
  const { stepNumber: raw } = await params
  const stepNumber = parseInt(raw, 10) as PipsStepNumber

  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 6) {
    notFound()
  }

  const step = PIPS_STEPS[stepNumber - 1]!
  const content = STEP_CONTENT[stepNumber]
  const prevStep =
    stepNumber > 1
      ? ((PIPS_STEPS as readonly (typeof PIPS_STEPS)[number][])[stepNumber - 2] ?? null)
      : null
  const nextStep =
    stepNumber < 6
      ? ((PIPS_STEPS as readonly (typeof PIPS_STEPS)[number][])[stepNumber] ?? null)
      : null

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/methodology" className="hover:text-[var(--color-primary)]">
          Methodology
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">
          Step {stepNumber}: {step.name}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
          style={{ backgroundColor: step.color }}
        >
          {stepNumber}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Step {stepNumber}: {step.name}
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-secondary)]">{content.objective}</p>
        </div>
      </div>

      {/* Guiding Questions */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Guiding Questions
        </h2>
        <ul className="mt-4 space-y-3">
          {content.prompts.map((prompt) => (
            <li key={prompt} className="flex items-start gap-3 text-[var(--color-text-secondary)]">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: step.color }}
              />
              {prompt}
            </li>
          ))}
        </ul>
      </section>

      {/* Tools */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Tools Used</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {content.forms.map((form) => (
            <Link
              key={form.type}
              href={`/methodology/tools/${form.type.replace(/_/g, '-')}`}
              className="group rounded-lg border border-[var(--color-border)] p-4 transition-all hover:border-[var(--color-primary)] hover:shadow-sm"
            >
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                {form.name}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{form.description}</p>
              {form.required && (
                <span className="mt-2 inline-block rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-primary)]">
                  Required
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Methodology Tips */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Tips</h2>
        <ul className="mt-4 space-y-2">
          {content.methodology.tips.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
            >
              <span className="mt-1 text-[var(--color-primary)]">&#x2022;</span>
              {tip}
            </li>
          ))}
        </ul>
      </section>

      {/* Best Practices */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Best Practices</h2>
        <ul className="mt-4 space-y-2">
          {content.methodology.bestPractices.map((bp) => (
            <li
              key={bp}
              className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
            >
              <span className="mt-1 text-emerald-500">&#x2713;</span>
              {bp}
            </li>
          ))}
        </ul>
      </section>

      {/* Facilitation Guide */}
      <section className="mt-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Facilitation Guide
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {content.methodology.facilitationGuide}
        </p>
      </section>

      {/* Navigation */}
      <div className="mt-12 flex items-center justify-between border-t border-[var(--color-border)] pt-6">
        {prevStep ? (
          <Link
            href={`/methodology/step/${prevStep.number}`}
            className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
          >
            <ArrowLeft size={14} />
            Step {prevStep.number}: {prevStep.name}
          </Link>
        ) : (
          <div />
        )}
        {nextStep ? (
          <Link
            href={`/methodology/step/${nextStep.number}`}
            className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
          >
            Step {nextStep.number}: {nextStep.name}
            <ArrowRight size={14} />
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link
          href="/signup"
          className="inline-block rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Try PIPS Free — Start With Step {stepNumber}
        </Link>
      </div>
    </div>
  )
}

export default StepPage
