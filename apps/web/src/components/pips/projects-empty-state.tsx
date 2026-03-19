'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FolderKanban, Plus, LayoutTemplate, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const ProjectsEmptyState = () => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16">
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--color-primary-subtle)' }}
      >
        <FolderKanban size={36} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
      </div>

      <h3
        className="mb-2 text-xl font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
        data-testid="projects-empty-title"
      >
        Start your first improvement project
      </h3>

      <p
        className="mb-1 max-w-md text-center text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        PIPS walks you through a proven 6-step methodology to identify, analyze, and solve process
        problems — from root cause to measured results.
      </p>

      {/* Progressive disclosure */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mb-6 flex items-center gap-1 text-xs font-medium"
        style={{ color: 'var(--color-primary)' }}
        aria-expanded={expanded}
      >
        {expanded ? (
          <>
            Show less <ChevronUp size={13} />
          </>
        ) : (
          <>
            Learn how it works <ChevronDown size={13} />
          </>
        )}
      </button>

      {expanded && (
        <div
          className="mb-6 max-w-sm rounded-[var(--radius-md)] p-4 text-left text-xs"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <p className="mb-2 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            The 6 PIPS steps
          </p>
          <ol className="space-y-1 list-decimal pl-4">
            <li>
              <strong>Identify</strong> — Define the problem with a measurable statement
            </li>
            <li>
              <strong>Analyze</strong> — Find the root cause using fishbone &amp; 5-Why
            </li>
            <li>
              <strong>Generate</strong> — Brainstorm 3+ solution options
            </li>
            <li>
              <strong>Select &amp; Plan</strong> — Pick the best solution, build a plan
            </li>
            <li>
              <strong>Implement</strong> — Execute and track progress with tickets
            </li>
            <li>
              <strong>Evaluate</strong> — Measure results, document lessons learned
            </li>
          </ol>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="gap-2" data-testid="empty-create-project-button">
          <Link href="/projects/new">
            <Plus size={16} />
            Create Your First Project
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="gap-2"
          data-testid="empty-browse-templates-link"
        >
          <Link href="/projects/templates">
            <LayoutTemplate size={16} />
            Browse Templates
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2" data-testid="empty-sample-project-link">
          <Link href="/dashboard">
            <Sparkles size={16} />
            Create a sample project
          </Link>
        </Button>
      </div>
    </div>
  )
}
