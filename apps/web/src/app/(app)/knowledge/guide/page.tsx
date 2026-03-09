import Link from 'next/link'
import {
  ChevronDown,
  BarChart3,
  Maximize2,
  RefreshCw,
  ArrowRight,
  Wrench,
  Users,
  Rocket,
  BookOpen,
  FileText,
  GraduationCap,
  Presentation,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  PIPS_STEPS,
  STEP_CONTENT,
  GUIDE_STEP_CONTENT,
  PIPS_PHILOSOPHY,
  PIPS_ITERATION_INFO,
  BOOK_CHAPTER_MAP,
} from '@pips/shared'
import type { PipsStepNumber } from '@pips/shared'
import { PipsCycleDiagram } from '@/components/knowledge/guide/pips-cycle-diagram'
import { ToolTag } from '@/components/knowledge/guide/tool-tag'
import { TOOL_DISPLAY_NAMES } from './_tool-names'

const PRINCIPLE_ICONS: Record<string, typeof BarChart3> = {
  'bar-chart': BarChart3,
  'arrows-expand': Maximize2,
  'refresh-cw': RefreshCw,
}

const GuidePage = () => {
  return (
    <div data-testid="guide-landing-page">
      {/* 1. Hero Section */}
      <section
        data-testid="guide-hero"
        className="-mx-4 -mt-4 mb-12 px-6 py-16 text-center text-white md:-mx-8 md:px-10 md:py-20"
        style={{ backgroundColor: '#1B1340' }}
      >
        <h1
          className="text-3xl font-bold tracking-tight md:text-5xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          The PIPS Methodology
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
          A structured 6-step framework for continuous process improvement. Define problems, analyze
          causes, generate solutions, plan, implement, and evaluate — with proven tools at every
          step.
        </p>
        <div className="mt-10">
          <PipsCycleDiagram size="lg" interactive />
        </div>
        <div className="mt-8 flex animate-bounce justify-center text-white/50">
          <ChevronDown size={28} />
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-16">
        {/* 2. Philosophy Section */}
        <section data-testid="guide-philosophy">
          <h2
            className="mb-4 text-2xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {PIPS_PHILOSOPHY.title}
          </h2>
          <div className="space-y-3">
            {PIPS_PHILOSOPHY.paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PIPS_PHILOSOPHY.principles.map((principle) => {
              const Icon = PRINCIPLE_ICONS[principle.icon] ?? BarChart3
              return (
                <Card key={principle.name} className="h-full">
                  <CardContent className="space-y-3 p-5">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                    >
                      <Icon size={20} className="text-[var(--color-primary)]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {principle.name}
                    </h3>
                    <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                      {principle.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* 3. Step Iteration Section */}
        <section data-testid="guide-iteration">
          <h2
            className="mb-4 text-2xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Non-Linear by Design
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {PIPS_ITERATION_INFO.description}
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PIPS_ITERATION_INFO.brackets.map((bracket) => (
              <Card key={bracket.label} className="relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-1 w-full"
                  style={{
                    backgroundColor:
                      bracket.steps[0] === 1
                        ? PIPS_STEPS[0]!.color
                        : bracket.steps[0] === 3
                          ? PIPS_STEPS[2]!.color
                          : PIPS_STEPS[4]!.color,
                  }}
                />
                <CardContent className="space-y-2 p-5 pt-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {bracket.label}
                    </h3>
                    <span className="rounded-full bg-[var(--color-surface-secondary,#f3f4f6)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">
                      Steps {bracket.steps.join(' & ')}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {bracket.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 4. Six Step Preview Cards */}
        <section data-testid="guide-step-cards">
          <h2
            className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The Six Steps
          </h2>
          <div className="space-y-4">
            {PIPS_STEPS.map((step) => {
              const stepNum = step.number as PipsStepNumber
              const guideData = GUIDE_STEP_CONTENT[stepNum]
              const stepData = STEP_CONTENT[stepNum]
              const chapterMapping = BOOK_CHAPTER_MAP.find((ch) =>
                ch.steps.includes(`step-${step.number}` as never),
              )
              const tools = chapterMapping?.tools ?? []

              return (
                <Card
                  key={step.number}
                  data-testid={`step-preview-${step.number}`}
                  className="border-l-4 transition-all hover:shadow-md"
                  style={{ borderLeftColor: step.color }}
                >
                  <CardContent className="p-5 md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: step.color }}
                      >
                        {step.number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                          {step.name}
                        </h3>
                        <p className="mt-1 text-sm italic text-[var(--color-text-tertiary)]">
                          {guideData.guidingQuestion}
                        </p>
                        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                          {stepData.objective}
                        </p>
                        {tools.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {tools.slice(0, 4).map((tool) => (
                              <ToolTag
                                key={tool}
                                toolSlug={tool}
                                toolName={TOOL_DISPLAY_NAMES[tool] ?? tool}
                                stepNumber={step.number}
                              />
                            ))}
                            {tools.length > 4 && (
                              <span className="self-center text-xs text-[var(--color-text-tertiary)]">
                                +{tools.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                        <Link
                          href={`/knowledge/guide/step/${step.number}`}
                          className="mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                          style={{ color: step.color }}
                        >
                          Explore Step <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* 5. Quick Access Section */}
        <section data-testid="guide-quick-access">
          <h2
            className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Quick Access
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link href="/knowledge/guide/tools">
              <Card className="h-full cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-md">
                <CardContent className="space-y-2 p-5">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                  >
                    <Wrench size={20} className="text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Tools Library
                  </h3>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    All 18+ PIPS tools in one place — templates, usage guides, and examples
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/knowledge/guide/roles">
              <Card className="h-full cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-md">
                <CardContent className="space-y-2 p-5">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                  >
                    <Users size={20} className="text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Roles & Responsibilities
                  </h3>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Leader, Process Guide, Scribe, Timekeeper, and more
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/knowledge/guide/getting-started">
              <Card className="h-full cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-md">
                <CardContent className="space-y-2 p-5">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                  >
                    <Rocket size={20} className="text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Getting Started
                  </h3>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Your first PIPS cycle — step-by-step onboarding guide
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* 6. Resources Footer */}
        <section data-testid="guide-resources" className="pb-8">
          <h2
            className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Resources
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Link href="/knowledge/guide/glossary">
              <Card className="cursor-pointer transition-all hover:border-[var(--color-primary)]">
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <BookOpen size={20} className="text-[var(--color-text-tertiary)]" />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    Glossary
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/knowledge/book">
              <Card className="cursor-pointer transition-all hover:border-[var(--color-primary)]">
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <FileText size={20} className="text-[var(--color-text-tertiary)]" />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">Book</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/knowledge/workbook">
              <Card className="cursor-pointer transition-all hover:border-[var(--color-primary)]">
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <GraduationCap size={20} className="text-[var(--color-text-tertiary)]" />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    Workbook
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/knowledge/workshop">
              <Card className="cursor-pointer transition-all hover:border-[var(--color-primary)]">
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <Presentation size={20} className="text-[var(--color-text-tertiary)]" />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    Workshop
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export { GuidePage as default }
