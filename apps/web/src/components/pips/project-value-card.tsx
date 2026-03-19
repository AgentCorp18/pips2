'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ChevronDown, ChevronUp, Wrench } from 'lucide-react'
import type { ProjectValueNarrative } from '@/app/(app)/projects/[projectId]/overview-actions'

type ProjectValueCardProps = {
  data: ProjectValueNarrative
}

export const ProjectValueCard = ({ data }: ProjectValueCardProps) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card
      data-testid="project-value-card"
      style={{ borderColor: 'var(--color-primary)', borderWidth: 1 }}
    >
      <CardHeader className="pb-3">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-left"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls="project-value-card-detail"
        >
          <CardTitle
            className="flex items-center gap-2 text-base"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Sparkles size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            Value Summary
          </CardTitle>
          {expanded ? (
            <ChevronUp
              size={16}
              style={{ color: 'var(--color-text-tertiary)' }}
              aria-hidden="true"
            />
          ) : (
            <ChevronDown
              size={16}
              style={{ color: 'var(--color-text-tertiary)' }}
              aria-hidden="true"
            />
          )}
        </button>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Narrative paragraph */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
          data-testid="project-value-narrative"
        >
          <NarrativeWithBoldNumbers text={data.narrative} />
        </p>

        {/* Expandable detail */}
        {expanded && (
          <div
            id="project-value-card-detail"
            className="mt-4 space-y-4 border-t pt-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {/* Methodology depth */}
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--color-text-tertiary)' }}>Methodology Depth</span>
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {data.methodologyDepthPercent}%
                </span>
                <DepthBar percent={data.methodologyDepthPercent} />
              </div>
            </div>

            {/* Forms completed */}
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--color-text-tertiary)' }}>Forms Completed</span>
              <span style={{ color: 'var(--color-text-primary)' }}>
                <span className="font-semibold">{data.formsCompleted}</span>
                <span style={{ color: 'var(--color-text-tertiary)' }}>
                  {' '}
                  / {data.totalFormTypes}
                </span>
              </span>
            </div>

            {/* Tools used */}
            {data.toolsUsed.length > 0 && (
              <div>
                <div
                  className="mb-2 flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <Wrench size={12} aria-hidden="true" />
                  Tools Used
                </div>
                <div className="flex flex-wrap gap-1.5" data-testid="project-value-tools">
                  {data.toolsUsed.map((tool) => (
                    <Badge key={tool} variant="secondary" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ---- Helpers ---- */

/** Renders numbers in the narrative as bold spans */
const NarrativeWithBoldNumbers = ({ text }: { text: string }) => {
  // Split on numbers (with optional decimals) so we can bold them
  const parts = text.split(/(\b\d+(?:\.\d+)?\b)/)
  return (
    <>
      {parts.map((part, i) =>
        /^\d+(?:\.\d+)?$/.test(part) ? (
          <strong key={i} style={{ color: 'var(--color-text-primary)' }}>
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

/** Small progress bar for methodology depth */
const DepthBar = ({ percent }: { percent: number }) => {
  const color = percent >= 70 ? '#22C55E' : percent >= 40 ? '#F59E0B' : '#EF4444'

  return (
    <div
      className="h-1.5 w-20 overflow-hidden rounded-full"
      style={{ backgroundColor: 'var(--color-border)' }}
      aria-hidden="true"
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  )
}
