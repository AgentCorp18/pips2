import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, Wrench, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContentBreadcrumb } from '@/components/knowledge/content-breadcrumb'
import { Callout } from '@/components/knowledge/callout'
import { ExpandableSection } from '@/components/knowledge/expandable-section'
import { KeyTakeaway } from '@/components/knowledge/key-takeaway'
import { PIPS_STEPS, STEP_CONTENT, BOOK_CHAPTER_MAP } from '@pips/shared'
import type { PipsStepNumber, ContentTool } from '@pips/shared'
import { getGuideContentForStep } from '../../../actions'
import { TOOL_DISPLAY_NAMES } from '../../_tool-names'

type StepPageProps = {
  params: Promise<{ stepNumber: string }>
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
  const contentNodes = await getGuideContentForStep(stepNumber)

  // Get tools for this step from BOOK_CHAPTER_MAP
  const chapterMapping = BOOK_CHAPTER_MAP.find((ch) => ch.steps.includes(`step-${stepNumber}`))
  const tools: ContentTool[] = chapterMapping?.tools ?? []

  // Get principles for this step
  const principles = chapterMapping?.principles ?? []

  // Prev/next step navigation (spread into mutable array to avoid tuple index errors)
  const allSteps = [...PIPS_STEPS]
  const prevStep = stepNumber > 1 ? (allSteps[stepNumber - 2] ?? null) : null
  const nextStep = stepNumber < 6 ? (allSteps[stepNumber] ?? null) : null

  return (
    <div className="mx-auto max-w-4xl space-y-6">
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

      {/* Step Header */}
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
          style={{ backgroundColor: step.color }}
        >
          {step.number}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Step {step.number}: {step.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{stepContent.objective}</p>
        </div>
      </div>

      {/* Guided Prompts */}
      <Card style={{ borderColor: step.colorSubtle }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb size={16} style={{ color: step.color }} />
            Key Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {stepContent.prompts.map((prompt) => (
              <li
                key={prompt}
                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: step.color }}
                />
                {prompt}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Tools for this step */}
      {tools.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]">
            <Wrench size={18} style={{ color: step.color }} />
            Tools
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {tools.map((tool) => (
              <Link key={tool} href={`/knowledge/guide/tools/${tool}`}>
                <Card className="group h-full cursor-pointer transition-all hover:shadow-md">
                  <CardContent className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {TOOL_DISPLAY_NAMES[tool] ?? tool}
                      </p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-[var(--color-text-tertiary)] transition-colors group-hover:text-[var(--color-primary)]"
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Principles */}
      {principles.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
            Principles
          </h2>
          <div className="flex flex-wrap gap-2">
            {principles.map((p) => (
              <Badge key={p} variant="secondary" className="capitalize">
                {p.replace(/-/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Methodology Tips & Best Practices */}
      <div className="space-y-4">
        <Callout variant="tip" title="Tips">
          <ul className="space-y-2">
            {stepContent.methodology.tips.map((tip) => (
              <li key={tip} className="text-sm">
                {tip}
              </li>
            ))}
          </ul>
        </Callout>
        <Callout variant="success" title="Best Practices">
          <ul className="space-y-2">
            {stepContent.methodology.bestPractices.map((bp) => (
              <li key={bp} className="text-sm">
                {bp}
              </li>
            ))}
          </ul>
        </Callout>
      </div>

      {/* Facilitation Guide */}
      <ExpandableSection title="Facilitation Guide">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {stepContent.methodology.facilitationGuide}
        </p>
      </ExpandableSection>

      {/* Related Book Content */}
      {contentNodes.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]">
            <BookOpen size={18} style={{ color: step.color }} />
            Related Content
          </h2>
          <div className="space-y-2">
            {contentNodes.map((node) => (
              <Link key={node.id} href={`/knowledge/book/${node.slug}`}>
                <Card className="cursor-pointer transition-all hover:shadow-sm">
                  <CardContent className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {node.title}
                      </p>
                      {node.summary && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-[var(--color-text-tertiary)]">
                          {node.summary}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {node.pillar}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Key Takeaway */}
      <KeyTakeaway stepColor={step.color}>
        Master Step {step.number} ({step.name}) by applying the key questions above, using the
        recommended tools, and following the best practices. Each step builds on the previous one to
        create a comprehensive improvement journey.
      </KeyTakeaway>

      {/* Prev / Next Step Navigation */}
      <Card className="mt-10">
        <CardContent className="flex items-center justify-between py-4">
          {prevStep ? (
            <Link
              href={`/knowledge/guide/step/${prevStep.number}`}
              className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={16} />
              Step {prevStep.number}: {prevStep.name}
            </Link>
          ) : (
            <div />
          )}
          {nextStep ? (
            <Link
              href={`/knowledge/guide/step/${nextStep.number}`}
              className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
              Step {nextStep.number}: {nextStep.name}
              <ArrowRight size={16} />
            </Link>
          ) : (
            <div />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default StepPage
