import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, FileText, GraduationCap, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ContentBreadcrumb } from '@/components/knowledge/content-breadcrumb'
import { ExpandableSection } from '@/components/knowledge/expandable-section'
import { PIPS_STEPS, STEP_CONTENT, GUIDE_STEP_CONTENT, BOOK_CHAPTER_MAP } from '@pips/shared'
import type { PipsStepNumber, ContentTool } from '@pips/shared'
import { StepSectionHeader } from '@/components/knowledge/guide/step-section-header'
import { PipsCycleDiagram } from '@/components/knowledge/guide/pips-cycle-diagram'
import { StepDiagram } from '@/components/knowledge/guide/step-diagram'
import { ExampleComparison } from '@/components/knowledge/guide/example-comparison'
import { InteractiveChecklist } from '@/components/knowledge/guide/interactive-checklist'
import { WhyThisMatters } from '@/components/knowledge/guide/why-this-matters'
import { ToolTag } from '@/components/knowledge/guide/tool-tag'
import { GuideNavigation } from '@/components/knowledge/guide/guide-navigation'
import { SectionAnchorNav } from '@/components/knowledge/guide/section-anchor-nav'
import { TOOL_DISPLAY_NAMES } from '../../_tool-names'

type StepPageProps = {
  params: Promise<{ stepNumber: string }>
}

const sections = [
  { id: 'objective', label: 'Objective' },
  { id: 'why-matters', label: 'Why It Matters' },
  { id: 'diagram', label: 'Visual Guide' },
  { id: 'questions', label: 'Key Questions' },
  { id: 'subsections', label: 'Deep Dive' },
  { id: 'examples', label: 'Examples' },
  { id: 'tools', label: 'Tools' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'tips', label: 'Tips' },
  { id: 'facilitation', label: 'Facilitation' },
  { id: 'related', label: 'Related' },
]

// Maps each PIPS step number to its book chapter slug (generated from chapter title)
const BOOK_CHAPTER_SLUGS: Record<number, string> = {
  1: 'step-1-identify',
  2: 'step-2-analyze',
  3: 'step-3-generate',
  4: 'step-4-select-plan',
  5: 'step-5-implement',
  6: 'step-6-evaluate',
}

const DIAGRAM_TITLES: Record<number, string> = {
  1: 'Problem Framework',
  2: 'Fishbone Diagram',
  3: 'Diverge & Converge',
  4: 'Selection & Planning Flow',
  5: 'Milestone Timeline',
  6: 'Continuous Improvement Cycle',
}

const StepPage = async ({ params }: StepPageProps) => {
  const { stepNumber: stepNumberStr } = await params
  const stepNumber = parseInt(stepNumberStr, 10) as PipsStepNumber

  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 6) {
    notFound()
  }

  const step = PIPS_STEPS[stepNumber - 1]
  if (!step) notFound()

  const stepContent = STEP_CONTENT[stepNumber]
  const guideContent = GUIDE_STEP_CONTENT[stepNumber]

  // Get tools for this step from BOOK_CHAPTER_MAP
  const chapterMapping = BOOK_CHAPTER_MAP.find((ch) =>
    ch.steps.includes(`step-${stepNumber}` as never),
  )
  const tools: ContentTool[] = chapterMapping?.tools ?? []

  // Facilitation guide timeline segments
  const facilitationText = stepContent.methodology.facilitationGuide

  return (
    <div className="mx-auto max-w-6xl space-y-6" data-testid="step-detail-page">
      {/* Breadcrumb */}
      <ContentBreadcrumb
        items={[
          { label: 'Knowledge Hub', href: '/knowledge' },
          { label: 'Guide', href: '/knowledge/guide' },
          {
            label: `Step ${step.number}: ${step.name}`,
            href: `/knowledge/guide/step/${step.number}`,
          },
        ]}
      />

      {/* Step Section Header */}
      <StepSectionHeader
        stepNumber={step.number}
        stepName={step.name}
        stepColor={step.color}
        guidingQuestion={guideContent.guidingQuestion}
      />

      {/* Mobile anchor nav */}
      <div className="lg:hidden">
        <SectionAnchorNav sections={sections} />
      </div>

      {/* Main content + sidebar */}
      <div className="flex gap-8">
        {/* Content column */}
        <div className="min-w-0 flex-1 space-y-10">
          {/* Key Insight — prominent blockquote */}
          <blockquote
            className="rounded-lg border-l-4 px-6 py-4"
            style={{
              borderLeftColor: step.color,
              backgroundColor: `${step.color}0A`,
            }}
          >
            <p className="text-base italic leading-relaxed text-[var(--color-text-primary)]">
              &ldquo;{guideContent.keyInsight}&rdquo;
            </p>
          </blockquote>

          {/* Objective */}
          <section id="objective" data-testid="section-objective">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              Objective
            </h2>
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <Card className="flex-1">
                <CardContent className="p-5">
                  <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
                    {stepContent.objective}
                  </p>
                </CardContent>
              </Card>
              <div className="hidden shrink-0 md:block">
                <PipsCycleDiagram size="sm" activeStep={step.number} interactive />
              </div>
            </div>
          </section>

          {/* Why This Matters — moved to 2nd position */}
          <section id="why-matters" data-testid="section-why-matters">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              Why It Matters
            </h2>
            <WhyThisMatters
              heading={guideContent.whyThisStepMatters.heading}
              paragraphs={guideContent.whyThisStepMatters.paragraphs}
              stepColor={step.color}
            />
          </section>

          {/* Diagram */}
          <section id="diagram" data-testid="section-diagram">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              {DIAGRAM_TITLES[step.number] ?? 'Visual Guide'}
            </h2>
            <Card>
              <CardContent className="p-5">
                <StepDiagram diagramType={guideContent.diagramType} stepColor={step.color} />
              </CardContent>
            </Card>
          </section>

          {/* Key Questions */}
          <section id="questions" data-testid="section-questions">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              Key Questions
            </h2>
            <ol className="space-y-3">
              {stepContent.prompts.map((prompt, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {prompt}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* Subsections / Deep Dive */}
          <section id="subsections" data-testid="section-subsections">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              Deep Dive
            </h2>
            <div className="space-y-4">
              {guideContent.subsections.map((sub, i) =>
                sub.collapsible ? (
                  <ExpandableSection key={i} title={sub.title}>
                    <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {sub.content}
                    </p>
                  </ExpandableSection>
                ) : (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {sub.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                        {sub.content}
                      </p>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </section>

          {/* Examples */}
          <section id="examples" data-testid="section-examples">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              Examples
            </h2>
            <ExampleComparison good={guideContent.examples.good} bad={guideContent.examples.bad} />
          </section>

          {/* Tools */}
          {tools.length > 0 && (
            <section id="tools" data-testid="section-tools">
              <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">Tools</h2>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool) => (
                  <ToolTag
                    key={tool}
                    toolSlug={tool}
                    toolName={TOOL_DISPLAY_NAMES[tool] ?? tool}
                    stepNumber={step.number}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Checklist */}
          <section id="checklist" data-testid="section-checklist">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              Checklist
            </h2>
            <InteractiveChecklist stepNumber={step.number} items={guideContent.checklist} />
          </section>

          {/* Tips & Best Practices */}
          <section id="tips" data-testid="section-tips">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              Tips & Best Practices
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
                    Tips
                  </h3>
                  <ol className="space-y-2">
                    {stepContent.methodology.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
                      >
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                          style={{ backgroundColor: step.color }}
                        >
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
                    Best Practices
                  </h3>
                  <ol className="space-y-2">
                    {stepContent.methodology.bestPractices.map((bp, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
                      >
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold"
                          style={{ color: step.color, backgroundColor: `${step.color}1A` }}
                        >
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{bp}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Facilitation Guide */}
          <section id="facilitation" data-testid="section-facilitation">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              Facilitation Guide
            </h2>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${step.color}1A` }}
                  >
                    <Clock size={16} style={{ color: step.color }} />
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {facilitationText}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Related Content */}
          <section id="related" data-testid="section-related">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              Related Content
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Link href={`/knowledge/book/${BOOK_CHAPTER_SLUGS[step.number]}`}>
                <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                  <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
                    <BookOpen size={24} className="text-[var(--color-text-tertiary)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        Book Chapter
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        Read the detailed methodology chapter for Step {step.number}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/knowledge/workbook">
                <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                  <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
                    <FileText size={24} className="text-[var(--color-text-tertiary)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        Workbook
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        Practice exercises and templates for Step {step.number}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/knowledge/workshop">
                <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                  <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
                    <GraduationCap size={24} className="text-[var(--color-text-tertiary)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        Workshop
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        Facilitated sessions and group activities
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          {/* Guide Navigation */}
          <GuideNavigation currentStep={step.number} />
        </div>

        {/* Desktop sidebar with anchor nav */}
        <div className="hidden w-48 shrink-0 lg:block">
          <div className="sticky top-20">
            <SectionAnchorNav sections={sections} />
          </div>
        </div>
      </div>
    </div>
  )
}

export { StepPage as default }
