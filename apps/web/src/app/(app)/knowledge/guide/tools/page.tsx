import Link from 'next/link'
import { Wrench, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PIPS_STEPS, BOOK_CHAPTER_MAP } from '@pips/shared'
import type { ContentTool } from '@pips/shared'
import { TOOL_DISPLAY_NAMES } from '../_tool-names'

/** Build step-to-tools mapping from BOOK_CHAPTER_MAP (steps 1-6 only) */
const getToolsByStep = () => {
  const stepToolMap: {
    stepNumber: number
    stepName: string
    color: string
    tools: ContentTool[]
  }[] = []

  for (const step of PIPS_STEPS) {
    const chapter = BOOK_CHAPTER_MAP.find((ch) => ch.steps.includes(`step-${step.number}`))
    stepToolMap.push({
      stepNumber: step.number,
      stepName: step.name,
      color: step.color,
      tools: (chapter?.tools ?? []) as ContentTool[],
    })
  }

  return stepToolMap
}

const ToolsPage = () => {
  const stepTools = getToolsByStep()
  const totalTools = stepTools.reduce((sum, s) => sum + s.tools.length, 0)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'rgba(79, 70, 229, 0.08)' }}
        >
          <Wrench size={20} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Tools Library</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {totalTools} tools across the 6 PIPS steps
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/knowledge" className="hover:text-[var(--color-primary)]">
          Knowledge Hub
        </Link>
        <span>/</span>
        <Link href="/knowledge/guide" className="hover:text-[var(--color-primary)]">
          Guide
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">Tools</span>
      </nav>

      {/* Tools grouped by step */}
      {stepTools.map(({ stepNumber, stepName, color, tools }) => (
        <div key={stepNumber}>
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {stepNumber}
            </div>
            <Link
              href={`/knowledge/guide/step/${stepNumber}`}
              className="text-base font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
            >
              Step {stepNumber}: {stepName}
            </Link>
          </div>

          {tools.length === 0 ? (
            <p className="ml-9 text-sm text-[var(--color-text-tertiary)]">
              No dedicated tools for this step.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {tools.map((tool) => (
                <Link key={tool} href={`/knowledge/guide/tools/${tool}`}>
                  <Card className="group h-full cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="flex items-center justify-between py-3">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        {TOOL_DISPLAY_NAMES[tool] ?? tool}
                      </span>
                      <ArrowRight
                        size={14}
                        className="text-[var(--color-text-tertiary)] transition-colors group-hover:text-[var(--color-primary)]"
                      />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ToolsPage
