import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ClipboardList, ArrowRight, Clock, BarChart3, BookOpen, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PIPS_STEPS, STEP_CONTENT, BOOK_CHAPTER_MAP } from '@pips/shared'
import type { PipsStepNumber, ContentTool } from '@pips/shared'
import { TOOL_META } from '../tool-meta'

type WorkbookStepPageProps = {
  params: Promise<{ stepNumber: string }>
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  Advanced: 'bg-red-50 text-red-700 border-red-200',
}

/** Get tools for a given step from BOOK_CHAPTER_MAP */
const getToolsForStep = (stepNumber: PipsStepNumber): ContentTool[] => {
  const stepKey = `step-${stepNumber}` as const
  const tools = new Set<ContentTool>()
  for (const chapter of BOOK_CHAPTER_MAP) {
    if (chapter.steps.includes(stepKey)) {
      for (const tool of chapter.tools) {
        tools.add(tool)
      }
    }
  }
  return Array.from(tools)
}

const WorkbookStepPage = async ({ params }: WorkbookStepPageProps) => {
  const { stepNumber: rawStep } = await params
  const stepNum = parseInt(rawStep, 10) as PipsStepNumber

  if (isNaN(stepNum) || stepNum < 1 || stepNum > 6) {
    notFound()
  }

  const step = PIPS_STEPS.find((s) => s.number === stepNum)
  if (!step) notFound()

  const content = STEP_CONTENT[stepNum]
  const tools = getToolsForStep(stepNum)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: step.color }}
        >
          {step.number}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Step {step.number}: {step.name}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{content.objective}</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/knowledge" className="hover:text-[var(--color-primary)]">
          Knowledge Hub
        </Link>
        <span>/</span>
        <Link href="/knowledge/workbook" className="hover:text-[var(--color-primary)]">
          Workbook
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">
          Step {step.number}: {step.name}
        </span>
      </nav>

      {/* Methodology tips */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lightbulb size={14} className="text-[var(--color-primary)]" />
            Tips for This Step
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {content.methodology.tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-text-tertiary)]" />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Tool / Exercise cards */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[var(--color-text-primary)]">
          <ClipboardList size={16} />
          Exercises &amp; Forms ({tools.length})
        </h2>
        <div className="space-y-3">
          {tools.map((toolSlug) => {
            const meta = TOOL_META[toolSlug]
            if (!meta) return null

            return (
              <Card
                key={toolSlug}
                className="transition-all hover:border-[var(--color-primary)] hover:shadow-sm"
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                        {meta.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
                        {meta.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                          <Clock size={11} />~{meta.estimatedMin} min
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${DIFFICULTY_COLORS[meta.difficulty] ?? ''}`}
                        >
                          {meta.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1.5">
                      <Link
                        href={`/knowledge/workbook/${stepNum}/${meta.formType}`}
                        className="flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      >
                        <BookOpen size={12} />
                        Exercise
                        <ArrowRight size={10} />
                      </Link>
                      <Link
                        href={`/training/practice/${toolSlug}`}
                        className="flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      >
                        <BarChart3 size={12} />
                        Practice
                        <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Completion criteria */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Completion Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {content.completionCriteria.map((criterion, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <span className="mt-0.5 text-[var(--color-text-tertiary)]">&#9744;</span>
                {criterion}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default WorkbookStepPage
