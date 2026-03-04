import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarkdownContent } from '@/components/knowledge/markdown-content'
import { PIPS_STEPS, BOOK_CHAPTER_MAP, STEP_CONTENT } from '@pips/shared'
import type { ContentTool, PipsStepNumber } from '@pips/shared'
import { getContentByTool } from '../../../actions'
import { TOOL_DISPLAY_NAMES } from '../../_tool-names'

/** All valid tool slugs (union type values) */
const ALL_TOOL_SLUGS = Object.keys(TOOL_DISPLAY_NAMES) as ContentTool[]

/** Find which step(s) a tool belongs to */
const getStepsForTool = (toolSlug: ContentTool) => {
  const steps: { number: number; name: string; color: string }[] = []
  for (const chapter of BOOK_CHAPTER_MAP) {
    if (chapter.tools.includes(toolSlug)) {
      for (const stepTag of chapter.steps) {
        const match = stepTag.match(/^step-(\d)$/)
        if (match && match[1]) {
          const num = parseInt(match[1], 10)
          const step = PIPS_STEPS[num - 1]
          if (step) {
            steps.push({ number: step.number, name: step.name, color: step.color })
          }
        }
      }
    }
  }
  return steps
}

/** Find the form definition for this tool from STEP_CONTENT */
const getFormDefForTool = (toolSlug: ContentTool) => {
  // Convert slug to form type (reverse of formTypeToContentTool)
  const formType = toolSlug.replace(/-/g, '_')
  for (let i = 1; i <= 6; i++) {
    const step = STEP_CONTENT[i as PipsStepNumber]
    const form = step.forms.find((f) => f.type === formType)
    if (form) return { form, stepNumber: i }
  }
  return null
}

type ToolPageProps = {
  params: Promise<{ toolSlug: string }>
}

const ToolPage = async ({ params }: ToolPageProps) => {
  const { toolSlug } = await params

  // Validate the tool slug
  if (!ALL_TOOL_SLUGS.includes(toolSlug as ContentTool)) {
    notFound()
  }

  const tool = toolSlug as ContentTool
  const displayName = TOOL_DISPLAY_NAMES[tool]
  const parentSteps = getStepsForTool(tool)
  const formDef = getFormDefForTool(tool)

  // Fetch content nodes tagged with this tool
  const contentNodes = await getContentByTool(toolSlug)

  // Split into book content and other pillar content
  const bookNodes = contentNodes.filter((n) => n.pillar === 'book')
  const otherNodes = contentNodes.filter((n) => n.pillar !== 'book')

  return (
    <div className="mx-auto max-w-4xl space-y-6">
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
        <Link href="/knowledge/guide/tools" className="hover:text-[var(--color-primary)]">
          Tools
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">{displayName}</span>
      </nav>

      {/* Tool Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{displayName}</h1>
        {formDef && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {formDef.form.description}
          </p>
        )}
      </div>

      {/* Parent Step(s) */}
      {parentSteps.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[var(--color-text-tertiary)]">Used in:</span>
          {parentSteps.map((s) => (
            <Link key={s.number} href={`/knowledge/guide/step/${s.number}`}>
              <Badge
                variant="outline"
                className="cursor-pointer transition-colors hover:bg-[var(--color-surface-secondary)]"
              >
                <span
                  className="mr-1 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                Step {s.number}: {s.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Form info card */}
      {formDef && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {formDef.form.name}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  {formDef.form.required ? 'Required' : 'Optional'} form in Step{' '}
                  {formDef.stepNumber}
                </p>
              </div>
              <Badge variant={formDef.form.required ? 'default' : 'secondary'}>
                {formDef.form.required ? 'Required' : 'Optional'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Book content for this tool */}
      {bookNodes.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]">
            <BookOpen size={18} className="text-[var(--color-primary)]" />
            Book Content
          </h2>
          <div className="space-y-4">
            {bookNodes.map((node) => (
              <Card key={node.id}>
                <CardContent className="py-4">
                  <Link
                    href={`/knowledge/book/${node.slug}`}
                    className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    {node.title}
                  </Link>
                  {node.summary && (
                    <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{node.summary}</p>
                  )}
                  {node.body_md && (
                    <div className="mt-3">
                      <MarkdownContent content={node.body_md} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cross-pillar content */}
      {otherNodes.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
            Related Content
          </h2>
          <div className="space-y-2">
            {otherNodes.map((node) => (
              <Card key={node.id} className="cursor-pointer transition-all hover:shadow-sm">
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
                  <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                    {node.pillar}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {contentNodes.length === 0 && !formDef && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              No content available for this tool yet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Back link */}
      <div className="flex gap-4 pt-4">
        <Link
          href="/knowledge/guide/tools"
          className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        >
          <ArrowRight size={14} className="rotate-180" />
          All Tools
        </Link>
        {parentSteps[0] && (
          <Link
            href={`/knowledge/guide/step/${parentSteps[0].number}`}
            className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
          >
            <ArrowRight size={14} className="rotate-180" />
            Step {parentSteps[0].number}: {parentSteps[0].name}
          </Link>
        )}
      </div>
    </div>
  )
}

export default ToolPage
