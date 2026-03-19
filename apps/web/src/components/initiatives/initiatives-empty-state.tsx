'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Target, Plus, FolderKanban, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

type InitiativesEmptyStateProps = {
  /** True when filters/search are active so the message adapts */
  isFiltered: boolean
}

export const InitiativesEmptyState = ({ isFiltered }: InitiativesEmptyStateProps) => {
  const [expanded, setExpanded] = useState(false)

  if (isFiltered) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed p-12"
        style={{ borderColor: 'var(--color-border)' }}
        role="status"
        aria-label="No initiatives match your filters"
        data-testid="initiatives-empty-state"
      >
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <Target size={24} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
        </div>
        <h3 className="mb-1 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          No initiatives match your filters
        </h3>
        <p
          className="max-w-sm text-center text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Try adjusting your search or filter to find what you are looking for.
        </p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed p-12"
      style={{ borderColor: 'var(--color-border)' }}
      role="status"
      aria-label="No initiatives yet"
      data-testid="initiatives-empty-state"
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--color-primary-subtle)' }}
      >
        <Target size={28} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
      </div>

      <h3 className="mb-2 text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Align your projects under a strategic goal
      </h3>

      <p
        className="mb-1 max-w-md text-center text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Initiatives group related PIPS projects together so you can track aggregated progress toward
        a larger outcome — like &ldquo;Reduce Waste by 20%&rdquo; or &ldquo;Improve Customer
        Satisfaction.&rdquo;
      </p>

      {/* Progressive disclosure — "Learn more" toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mb-5 flex items-center gap-1 text-xs font-medium"
        style={{ color: 'var(--color-primary)' }}
        aria-expanded={expanded}
      >
        {expanded ? (
          <>
            Show less <ChevronUp size={13} />
          </>
        ) : (
          <>
            Learn how initiatives work <ChevronDown size={13} />
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
            How it works
          </p>
          <ul className="space-y-1.5 list-disc pl-4">
            <li>Create an initiative with a strategic title and target date</li>
            <li>Link one or more PIPS projects to the initiative</li>
            <li>PIPS automatically calculates weighted progress across all linked projects</li>
            <li>
              Use Step 4 (Select &amp; Plan) projects to define the roadmap within an initiative
            </li>
          </ul>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild data-testid="initiatives-empty-create-button">
          <Link href="/initiatives/new">
            <Plus size={16} className="mr-1.5" />
            Create your first initiative
          </Link>
        </Button>
        <Button asChild variant="outline" data-testid="initiatives-empty-projects-button">
          <Link href="/projects">
            <FolderKanban size={16} className="mr-1.5" />
            View Projects
          </Link>
        </Button>
        <Button asChild variant="outline" data-testid="initiatives-empty-knowledge-button">
          <Link href="/knowledge">
            <BookOpen size={16} className="mr-1.5" />
            PIPS Knowledge Hub
          </Link>
        </Button>
      </div>
    </div>
  )
}
