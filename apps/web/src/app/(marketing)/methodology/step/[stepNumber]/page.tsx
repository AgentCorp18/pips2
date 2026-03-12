import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, BookOpen } from 'lucide-react'
import { PIPS_STEPS, STEP_CONTENT, type PipsStepNumber } from '@pips/shared'
import { getBaseUrl } from '@/lib/base-url'

const BASE_URL = getBaseUrl()

type StepPageProps = {
  params: Promise<{ stepNumber: string }>
}

const STEP_DESCRIPTIONS: Record<number, string> = {
  1: 'Every improvement starts with a clear problem. In Step 1, you define a measurable problem statement that the whole team agrees on — grounding your effort in data, not assumptions. A well-written problem statement describes the current state (As-Is), the desired state, and the measurable gap between them. This is where the discipline starts: no jumping to solutions, no blaming, no guessing. Just observation, measurement, and clarity.',
  2: 'With a clear problem statement in hand, Step 2 digs into why the problem exists. Root cause analysis uses structured tools — the Fishbone Diagram, 5-Why Analysis, Force Field Analysis, and Check Sheets — to move past surface symptoms and uncover the real drivers. Teams that skip this step waste time solving the wrong thing. Teams that do it well solve problems that stay solved.',
  3: 'Step 3 is about expanding the solution space. Before you can pick the best solution, you need many solutions to choose from. Brainstorming and Brainwriting (6-3-5) techniques ensure that every team member contributes ideas without the loudest voice dominating. The principle of "Expand Then Contract" is at its most visible here: quantity first, quality later. Judgment is deferred until Step 4.',
  4: 'This is where divergent thinking becomes convergent thinking. Step 4 applies objective criteria — weighted scoring matrices, paired comparisons, cost-benefit analysis — to evaluate the ideas generated in Step 3. The best solution is selected on evidence, not opinion. Then a detailed implementation plan is built with RACI accountability, milestones, timelines, and risk mitigation. Every task has an owner. Every deadline is realistic.',
  5: 'Plans are only as good as their execution. Step 5 tracks implementation with milestone trackers, task checklists, and regular check-ins. The team surfaces blockers early, escalates risks proactively, and celebrates progress along the way. Change management, communication plans, and pilot testing all happen here. Deviations from the plan are documented — they become input for Step 6.',
  6: 'The cycle closes in Step 6. Before-and-after comparisons measure whether the improvement hit its targets. A structured retrospective captures lessons learned — both what worked and what needs to change. The team explicitly decides: standardize the solution, iterate with another cycle, or start a new PIPS project. This is where "Close The Loop" becomes real. Improvement never stops.',
}

const STEP_SEO_TITLES: Record<number, string> = {
  1: 'Step 1: Identify — Define Measurable Problem Statements',
  2: 'Step 2: Analyze — Root Cause Analysis Tools & Techniques',
  3: 'Step 3: Generate — Brainstorming & Idea Generation Methods',
  4: 'Step 4: Select & Plan — Decision Matrices & Implementation Planning',
  5: 'Step 5: Implement — Execution, Milestones & Progress Tracking',
  6: 'Step 6: Evaluate — Measure Results & Lessons Learned',
}

const STEP_SEO_DESCRIPTIONS: Record<number, string> = {
  1: 'Learn how to write clear, measurable problem statements using the PIPS methodology. Define As-Is state, desired state, and the gap between them with data-driven analysis.',
  2: 'Master root cause analysis with Fishbone diagrams, 5-Why analysis, Force Field analysis, and Check Sheets. Stop treating symptoms and start solving the real problem.',
  3: 'Generate innovative solutions with proven brainstorming and brainwriting techniques. Learn the 6-3-5 method and how to build on team ideas without judgment.',
  4: 'Make objective decisions with weighted criteria matrices, paired comparisons, and cost-benefit analysis. Build RACI charts and detailed implementation plans.',
  5: 'Execute improvement plans with milestone tracking, task checklists, and structured check-ins. Learn change management, pilot testing, and stakeholder communication.',
  6: 'Measure improvement results with before-after comparisons. Capture lessons learned, run retrospectives, and decide whether to standardize, iterate, or start a new cycle.',
}

const STEP_KEY_QUESTIONS: Record<number, string[]> = {
  1: [
    'What specific, measurable gap exists between where we are and where we need to be?',
    'Who is affected by this problem and how can we quantify the impact?',
    "Is this problem within our team's sphere of influence to solve?",
    'Do we have enough data to prove this is a real problem, not just a perception?',
  ],
  2: [
    'Are we looking at root causes or just surface symptoms?',
    'Have we involved the people closest to the work — the ones who see the problem daily?',
    'Can we validate our suspected causes with data before jumping to solutions?',
    'Are there systemic patterns, or is this a one-time event?',
  ],
  3: [
    'Have we generated enough ideas to move past the obvious solutions?',
    'Are quieter team members contributing, or are the loudest voices dominating?',
    'Have we looked at how other industries or organizations solved similar problems?',
    'Are we truly deferring judgment, or are we unconsciously filtering ideas?',
  ],
  4: [
    'Are our evaluation criteria defined before we start scoring solutions?',
    'Does every task have exactly one accountable person?',
    'Is the timeline realistic, or are we committing to deadlines we cannot meet?',
    'Have we identified the top risks and built mitigation into the plan?',
  ],
  5: [
    'Are blockers being surfaced early, or are they surprises at milestone reviews?',
    'Is the team celebrating progress, or does it feel like an endless grind?',
    'Are stakeholders informed proactively, or do they hear about changes after the fact?',
    'Are we documenting deviations from the plan for the evaluation phase?',
  ],
  6: [
    'Are we comparing the same metrics we defined in Step 1, or have we moved the goalposts?',
    'Will this improvement hold without active management, or does it need sustaining mechanisms?',
    'What would we do differently if we ran this project again?',
    'Should we standardize, iterate with another cycle, or close and move on?',
  ],
}

const renderInlineMarkdown = (text: string): ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

export const generateMetadata = async ({ params }: StepPageProps): Promise<Metadata> => {
  const { stepNumber: raw } = await params
  const stepNumber = parseInt(raw, 10)

  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 6) {
    return { title: 'Step Not Found' }
  }

  const title = STEP_SEO_TITLES[stepNumber] ?? ''
  const description = STEP_SEO_DESCRIPTIONS[stepNumber] ?? ''

  return {
    title,
    description,
    alternates: {
      canonical: `/methodology/step/${stepNumber}`,
    },
    openGraph: {
      title: `PIPS ${title}`,
      description,
      url: `${BASE_URL}/methodology/step/${stepNumber}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `PIPS ${title}`,
      description,
    },
  }
}

export const generateStaticParams = () => {
  return [1, 2, 3, 4, 5, 6].map((n) => ({ stepNumber: String(n) }))
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

  const keyQuestions = STEP_KEY_QUESTIONS[stepNumber] ?? []
  const richDescription = STEP_DESCRIPTIONS[stepNumber] ?? ''

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
          <h1 className="font-serif text-3xl font-bold text-[var(--color-text-primary)] md:text-4xl">
            Step {stepNumber}: {step.name}
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
            {renderInlineMarkdown(content.objective)}
          </p>
        </div>
      </div>

      {/* Rich Description */}
      <section className="mt-10">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {richDescription}
        </p>
      </section>

      {/* Key Questions */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-[var(--color-text-primary)]">
          <Lightbulb size={20} style={{ color: step.color }} />
          Key Questions This Step Answers
        </h2>
        <ul className="mt-4 space-y-3">
          {keyQuestions.map((question) => (
            <li
              key={question}
              className="flex items-start gap-3 text-[var(--color-text-secondary)]"
            >
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: step.color }}
              />
              {question}
            </li>
          ))}
        </ul>
      </section>

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
              {renderInlineMarkdown(prompt)}
            </li>
          ))}
        </ul>
      </section>

      {/* Tools */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Tools Used in This Step
        </h2>
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
              {renderInlineMarkdown(tip)}
            </li>
          ))}
        </ul>
      </section>

      {/* Best Practices */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-[var(--color-text-primary)]">
          <CheckCircle2 size={20} className="text-emerald-500" />
          Best Practices
        </h2>
        <ul className="mt-4 space-y-2">
          {content.methodology.bestPractices.map((bp) => (
            <li
              key={bp}
              className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
            >
              <span className="mt-1 text-emerald-500">&#x2713;</span>
              {renderInlineMarkdown(bp)}
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
          {renderInlineMarkdown(content.methodology.facilitationGuide)}
        </p>
      </section>

      {/* Completion Criteria */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Completion Criteria
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">
          Before moving to the next step, ensure these criteria are met:
        </p>
        <ul className="mt-4 space-y-2">
          {content.completionCriteria.map((criterion) => (
            <li
              key={criterion}
              className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
            >
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: step.color }} />
              {renderInlineMarkdown(criterion)}
            </li>
          ))}
        </ul>
      </section>

      {/* Read More in the Book */}
      <section className="mt-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="flex items-start gap-3">
          <BookOpen size={20} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
          <div>
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
              Read more in The Never-Ending Quest
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Chapter {stepNumber + 3} of the PIPS book covers Step {stepNumber} in depth — with
              real-world case studies, facilitator notes, and common pitfalls.
            </p>
            <Link
              href="/book"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Browse Chapters
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
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
