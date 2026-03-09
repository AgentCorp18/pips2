'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Wrench, ArrowRight, BookOpen, Compass } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PIPS_STEPS, BOOK_CHAPTER_MAP } from '@pips/shared'
import type { ContentTool } from '@pips/shared'
import { TOOL_DISPLAY_NAMES } from '../_tool-names'

/** Brief descriptions for each tool */
const TOOL_DESCRIPTIONS: Record<ContentTool, string> = {
  'problem-statement': 'Define a clear, measurable problem to solve.',
  fishbone: 'Map cause-and-effect relationships visually.',
  'five-why': 'Drill to root cause by asking "Why?" five times.',
  'force-field': 'Weigh driving vs. restraining forces for change.',
  brainstorming: 'Generate ideas freely without judgment.',
  brainwriting: 'Silent idea generation in structured rounds (6-3-5).',
  checksheet: 'Collect and tally data with a structured form.',
  'list-reduction': 'Narrow a long list to the most viable options.',
  'weighted-voting': 'Prioritize options using weighted scores.',
  'criteria-matrix': 'Score options against weighted decision criteria.',
  'paired-comparisons': 'Compare options head-to-head to rank them.',
  'balance-sheet': 'List pros and cons for each option.',
  'cost-benefit': 'Quantify costs vs. expected benefits.',
  raci: 'Clarify who is Responsible, Accountable, Consulted, Informed.',
  'implementation-plan': 'Detail tasks, owners, and timelines for execution.',
  'implementation-checklist': 'Track completion of implementation tasks.',
  'milestone-tracker': 'Monitor key milestones and deadlines.',
  'before-after': 'Compare metrics before and after the change.',
  evaluation: 'Summarize outcomes and measure success.',
  'lessons-learned': "Capture what worked, what didn't, and why.",
  interviewing: 'Gather qualitative insights through structured interviews.',
  surveying: 'Collect quantitative data from stakeholders.',
  'impact-assessment': 'Evaluate the potential impact of proposed changes.',
}

type ToolEntry = {
  slug: ContentTool
  name: string
  description: string
  steps: number[]
}

/** Build a flat list of tools with their step associations */
const buildToolList = (): ToolEntry[] => {
  const toolStepMap = new Map<ContentTool, number[]>()

  for (const step of PIPS_STEPS) {
    const chapter = BOOK_CHAPTER_MAP.find((ch) => ch.steps.includes(`step-${step.number}`))
    for (const tool of (chapter?.tools ?? []) as ContentTool[]) {
      const existing = toolStepMap.get(tool) ?? []
      existing.push(step.number)
      toolStepMap.set(tool, existing)
    }
  }

  return Array.from(toolStepMap.entries()).map(([slug, steps]) => ({
    slug,
    name: TOOL_DISPLAY_NAMES[slug] ?? slug,
    description: TOOL_DESCRIPTIONS[slug] ?? '',
    steps,
  }))
}

const allTools = buildToolList()

const ToolsPage = () => {
  const [activeFilter, setActiveFilter] = useState<number | null>(null)

  const filteredTools = activeFilter
    ? allTools.filter((t) => t.steps.includes(activeFilter))
    : allTools

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
            {allTools.length} tools across the 6 PIPS steps
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

      {/* Filter bar */}
      <div data-testid="tools-filter-bar" className="flex flex-wrap gap-2">
        <Button
          data-testid="tools-filter-all"
          variant={activeFilter === null ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
          onClick={() => setActiveFilter(null)}
        >
          All
        </Button>
        {PIPS_STEPS.map((step) => {
          const isActive = activeFilter === step.number
          return (
            <Button
              key={step.number}
              data-testid={`tools-filter-${step.number}`}
              variant="outline"
              size="sm"
              className="rounded-full border-2 transition-colors"
              style={{
                borderColor: step.color,
                backgroundColor: isActive ? step.color : 'transparent',
                color: isActive ? '#ffffff' : step.color,
              }}
              onClick={() => setActiveFilter(isActive ? null : step.number)}
            >
              Step {step.number}
            </Button>
          )
        })}
      </div>

      {/* Tool cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredTools.map((tool) => (
          <Link key={tool.slug} href={`/knowledge/guide/tools/${tool.slug}`}>
            <Card
              data-testid={`tool-card-${tool.slug}`}
              className="group h-full cursor-pointer transition-all hover:shadow-md"
            >
              <CardContent className="space-y-2 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {tool.name}
                  </span>
                  <ArrowRight
                    size={14}
                    className="shrink-0 text-[var(--color-text-tertiary)] transition-colors group-hover:text-[var(--color-primary)]"
                  />
                </div>
                {tool.description && (
                  <p className="text-xs text-[var(--color-text-secondary)]">{tool.description}</p>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex flex-wrap gap-1">
                    {tool.steps.map((stepNum) => {
                      const step = PIPS_STEPS[stepNum - 1]
                      return (
                        <Badge
                          key={stepNum}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                          style={{
                            borderColor: step?.color,
                            color: step?.color,
                          }}
                        >
                          Step {stepNum}
                        </Badge>
                      )
                    })}
                  </div>
                  <div className="ml-auto flex gap-1.5">
                    <span
                      title="View in Guide"
                      className="text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)]"
                    >
                      <Compass size={12} />
                    </span>
                    <span
                      title="View in Book"
                      className="text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)]"
                    >
                      <BookOpen size={12} />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <p className="text-center text-sm text-[var(--color-text-tertiary)] py-8">
          No tools found for this filter.
        </p>
      )}

      {/* Back to Guide */}
      <div className="pt-2">
        <Link
          href="/knowledge/guide"
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          &larr; Back to Guide
        </Link>
      </div>
    </div>
  )
}

export default ToolsPage
