import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { STEP_CONTENT } from '@pips/shared'

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

const ToolPage = async ({ params }: ToolPageProps) => {
  const { toolSlug } = await params
  const result = findFormBySlug(toolSlug)

  if (!result) {
    notFound()
  }

  const { form, stepNumber, stepContent } = result

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
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

      <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{form.name}</h1>
      <p className="mt-3 text-lg text-[var(--color-text-secondary)]">{form.description}</p>

      <div className="mt-2 flex items-center gap-2">
        <span className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-text-tertiary)]">
          Step {stepNumber}: {stepContent.title}
        </span>
        {form.required && (
          <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary)]">
            Required
          </span>
        )}
      </div>

      {/* Methodology guidance for this tool's step */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
          How to Use This Tool
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {stepContent.methodology.facilitationGuide}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Tips</h2>
        <ul className="mt-4 space-y-2">
          {stepContent.methodology.tips.map((tip) => (
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
          Back to Step {stepNumber}
        </Link>
      </div>
    </div>
  )
}

export default ToolPage
