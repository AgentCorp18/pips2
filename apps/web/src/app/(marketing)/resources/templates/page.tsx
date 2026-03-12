import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  getTemplatesByCategory,
  type TemplateCategory,
} from './_template-data'
import { TemplateCard } from './_template-card'
import { getBaseUrl } from '@/lib/base-url'

const BASE_URL = getBaseUrl()

export const metadata: Metadata = {
  title: 'Free PIPS Templates — Process Improvement Worksheets & Tools',
  description:
    'Download free process improvement templates for every step of the PIPS methodology: Problem Statements, Fishbone Diagrams, RACI Charts, Criteria Matrices, and more.',
  alternates: {
    canonical: '/resources/templates',
  },
  openGraph: {
    title: 'Free PIPS Templates — Process Improvement Worksheets & Tools',
    description:
      'Download free templates for the 6-step PIPS methodology. Problem Statements, Fishbone Diagrams, RACI Charts, and more.',
    url: `${BASE_URL}/resources/templates`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PIPS Templates — Process Improvement Worksheets & Tools',
    description:
      'Download free templates for the 6-step PIPS methodology. Problem Statements, Fishbone Diagrams, RACI Charts, and more.',
  },
}

const CATEGORY_ORDER: TemplateCategory[] = [
  'identify',
  'analyze',
  'generate',
  'select-plan',
  'implement',
  'evaluate',
]

const TemplatesPage = () => {
  const grouped = getTemplatesByCategory()

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-16">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/resources" className="hover:text-[var(--color-primary)]">
          Resources
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">Templates</span>
      </nav>

      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
          <Download size={32} className="text-[var(--color-primary)]" />
        </div>
        <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-5xl">
          PIPS Templates
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-text-secondary)]">
          Free, ready-to-use templates for every step of the PIPS methodology. Enter your email to
          download — we will send the template straight to your inbox.
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">
          {TEMPLATES.length} templates across all 6 steps
        </p>
      </section>

      {/* Template Categories */}
      <div className="mt-12 space-y-12">
        {CATEGORY_ORDER.map((category) => {
          const templates = grouped[category]
          if (!templates || templates.length === 0) return null
          const categoryMeta = TEMPLATE_CATEGORIES[category]

          return (
            <section key={category}>
              <div className="flex items-center gap-3">
                <div
                  className="h-1 w-8 rounded-full"
                  style={{ backgroundColor: categoryMeta.color }}
                />
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  {categoryMeta.label}
                </h2>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* How It Works */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-[var(--color-text-primary)]">
          How It Works
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Choose a template',
              description:
                'Browse templates organized by the 6 PIPS steps. Each template is designed for a specific tool or activity.',
            },
            {
              step: '2',
              title: 'Enter your email',
              description:
                'We send the template directly to your inbox so you always have a copy — no account required.',
            },
            {
              step: '3',
              title: 'Start improving',
              description:
                'Print it, share it with your team, or use it alongside the PIPS app for a fully digital workflow.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold text-white">
                {item.step}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[var(--color-text-primary)]">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-8 text-center">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Go beyond templates</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          PIPS gives your team all 18 tools built into a collaborative, digital workflow — with
          real-time updates, team assignments, and automatic progress tracking.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Try PIPS Free
          </Link>
          <Link
            href="/methodology"
            className="rounded-lg border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-secondary)]"
          >
            Explore the Methodology
          </Link>
        </div>
      </section>

      {/* Back */}
      <div className="mt-8">
        <Link
          href="/resources"
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        >
          <ArrowLeft size={14} />
          Back to Resources
        </Link>
      </div>
    </main>
  )
}

export default TemplatesPage
