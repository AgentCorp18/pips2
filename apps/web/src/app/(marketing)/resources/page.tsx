import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, BookText, Download, FileText, GraduationCap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Resources — PIPS Process Improvement Learning Center',
  description:
    'Free process improvement resources: the PIPS methodology book, glossary of terms, tool guides, and step-by-step methodology walkthroughs.',
  openGraph: {
    title: 'Resources — PIPS Process Improvement Learning Center',
    description:
      'Free process improvement resources: methodology book, glossary, tool guides, and walkthroughs.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resources — PIPS Process Improvement Learning Center',
    description:
      'Free process improvement resources: methodology book, glossary, tool guides, and walkthroughs.',
  },
}

const RESOURCES = [
  {
    title: 'The PIPS Methodology',
    description:
      'A complete walkthrough of the 6 PIPS steps — from problem identification to evaluation. Each step includes tools, tips, best practices, and facilitation guides.',
    href: '/methodology',
    icon: FileText,
    badge: '6 Steps',
    badgeColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
  },
  {
    title: 'The Never-Ending Quest',
    description:
      '15 chapters covering the philosophy, practice, and culture of continuous process improvement. Free preview chapters available — no signup required.',
    href: '/book',
    icon: BookOpen,
    badge: '15 Chapters',
    badgeColor: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  },
  {
    title: 'PIPS Glossary',
    description:
      'Definitions, context, and related tools for 35+ process improvement terms. Internal links connect related concepts so you can explore at your own pace.',
    href: '/resources/glossary',
    icon: BookText,
    badge: '35+ Terms',
    badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  },
  {
    title: 'PIPS Templates',
    description:
      'Free, downloadable templates for every PIPS tool — Problem Statements, Fishbone Diagrams, RACI Charts, Criteria Matrices, and more. Print or use digitally.',
    href: '/resources/templates',
    icon: Download,
    badge: '17 Templates',
    badgeColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
  },
  {
    title: 'Tool Guides',
    description:
      'Detailed instructions for every PIPS tool — Fishbone Diagrams, 5-Why Analysis, Criteria Matrices, RACI Charts, and more. Each guide includes when to use it, step-by-step instructions, and examples.',
    href: '/methodology',
    icon: GraduationCap,
    badge: '22 Tools',
    badgeColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  },
] as const

const ResourcesPage = () => {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Hero */}
      <section className="text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-5xl">
          Resources
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-text-secondary)]">
          Everything you need to learn and apply the PIPS methodology — methodology guides, book
          chapters, tool instructions, and a comprehensive glossary.
        </p>
      </section>

      {/* Resource Cards */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {RESOURCES.map((resource) => (
          <Link
            key={resource.title}
            href={resource.href}
            className="group flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all hover:border-[var(--color-primary)] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                <resource.icon size={20} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                  {resource.title}
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${resource.badgeColor}`}
                >
                  {resource.badge}
                </span>
              </div>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {resource.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">
              Explore{' '}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      {/* Quick Links — Popular Tools */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold text-[var(--color-text-primary)]">
          Popular Tool Guides
        </h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Problem Statement', slug: 'problem-statement', step: 1 },
            { name: 'Fishbone Diagram', slug: 'fishbone', step: 2 },
            { name: '5-Why Analysis', slug: 'five-why', step: 2 },
            { name: 'Brainstorming', slug: 'brainstorming', step: 3 },
            { name: 'Criteria Matrix', slug: 'criteria-matrix', step: 4 },
            { name: 'RACI Chart', slug: 'raci', step: 4 },
          ].map((tool) => (
            <Link
              key={tool.slug}
              href={`/methodology/tools/${tool.slug}`}
              className="group flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3 transition-all hover:border-[var(--color-primary)]"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{tool.name}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Step {tool.step}</p>
              </div>
              <ArrowRight
                size={14}
                className="shrink-0 text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Ready to put PIPS into practice?
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Sign up for free and start improving your team&apos;s processes today.
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

export default ResourcesPage
