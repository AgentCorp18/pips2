'use client'

import { useState, useMemo, useCallback } from 'react'
import { BookOpen, Search, ChevronRight, FileText, BookMarked } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ContentBreadcrumb } from '@/components/knowledge/content-breadcrumb'
import { GLOSSARY_TERMS, PIPS_STEPS } from '@pips/shared'

const stepColors: Record<number, string> = {}
for (const step of PIPS_STEPS) {
  stepColors[step.number] = step.color
}

/** Map step number to book chapter slug */
const stepBookSlugs: Record<number, string> = {
  1: 'step-1-identify',
  2: 'step-2-analyze',
  3: 'step-3-generate',
  4: 'step-4-select-plan',
  5: 'step-5-implement',
  6: 'step-6-evaluate',
}

/** Map step number to short label for the book link */
const stepBookLabels: Record<number, string> = {
  1: 'Step 1: Identify',
  2: 'Step 2: Analyze',
  3: 'Step 3: Generate',
  4: 'Step 4: Select & Plan',
  5: 'Step 5: Implement',
  6: 'Step 6: Evaluate',
}

/**
 * Map glossary term names to their associated form paths.
 * Form routes require a projectId, so we use a placeholder that users
 * will replace from their current project context. We link to the
 * knowledge/guide/tools page instead for a project-agnostic experience.
 */
const termFormLinks: Record<string, { label: string; href: string }> = {
  'Problem Statement': {
    label: 'Problem Statement Tool',
    href: '/knowledge/guide/tools/problem-statement',
  },
  'Fishbone Diagram': { label: 'Fishbone Diagram Tool', href: '/knowledge/guide/tools/fishbone' },
  '5-Why Analysis': { label: '5-Why Analysis Tool', href: '/knowledge/guide/tools/five-why' },
  'Force Field Analysis': {
    label: 'Force Field Analysis Tool',
    href: '/knowledge/guide/tools/force-field',
  },
  'Check Sheet': { label: 'Check Sheet Tool', href: '/knowledge/guide/tools/checksheet' },
  Brainstorming: { label: 'Brainstorming Tool', href: '/knowledge/guide/tools/brainstorming' },
  'Brainwriting (6-3-5)': {
    label: 'Brainwriting Tool',
    href: '/knowledge/guide/tools/brainwriting',
  },
  'Criteria Matrix': {
    label: 'Criteria Matrix Tool',
    href: '/knowledge/guide/tools/criteria-matrix',
  },
  'Paired Comparisons': {
    label: 'Paired Comparisons Tool',
    href: '/knowledge/guide/tools/paired-comparisons',
  },
  'RACI Chart': { label: 'RACI Chart Tool', href: '/knowledge/guide/tools/raci' },
  'Implementation Plan': {
    label: 'Implementation Plan Tool',
    href: '/knowledge/guide/tools/implementation-plan',
  },
  'Milestone Tracker': {
    label: 'Milestone Tracker Tool',
    href: '/knowledge/guide/tools/milestone-tracker',
  },
  'Before & After Comparison': {
    label: 'Before & After Tool',
    href: '/knowledge/guide/tools/before-after',
  },
  'Lessons Learned': {
    label: 'Lessons Learned Tool',
    href: '/knowledge/guide/tools/lessons-learned',
  },
  'Balance Sheet': { label: 'Balance Sheet Tool', href: '/knowledge/guide/tools/balance-sheet' },
  'Weighted Voting': {
    label: 'Weighted Voting Tool',
    href: '/knowledge/guide/tools/weighted-voting',
  },
}

const GlossaryPage = () => {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleTerm = useCallback((term: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(term)) {
        next.delete(term)
      } else {
        next.add(term)
      }
      return next
    })
  }, [])

  const filteredTerms = useMemo(() => {
    if (!search.trim()) return GLOSSARY_TERMS
    const q = search.trim().toLowerCase()
    return GLOSSARY_TERMS.filter(
      (t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q),
    )
  }, [search])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filteredTerms>()
    for (const term of filteredTerms) {
      const letter = (term.term[0] ?? '#').toUpperCase()
      const list = map.get(letter) ?? []
      list.push(term)
      map.set(letter, list)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredTerms])

  // Build a global index for data-testid
  const termIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    let idx = 0
    for (const [, terms] of grouped) {
      for (const t of terms) {
        map.set(t.term, idx++)
      }
    }
    return map
  }, [grouped])

  return (
    <div data-testid="glossary-page" className="mx-auto max-w-4xl space-y-6">
      {/* Breadcrumb */}
      <ContentBreadcrumb
        items={[
          { label: 'Knowledge Hub', href: '/knowledge' },
          { label: 'Guide', href: '/knowledge/guide' },
          { label: 'Glossary', href: '/knowledge/guide/glossary' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'var(--color-step-2-subtle)' }}
        >
          <BookOpen size={20} className="text-[var(--color-step-2)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">PIPS Glossary</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {GLOSSARY_TERMS.length} terms across the PIPS methodology
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
        />
        <Input
          data-testid="glossary-search"
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Terms */}
      {grouped.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">
          No terms match your search.
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map(([letter, terms]) => (
            <div key={letter}>
              <h2 className="mb-3 border-b pb-1 text-lg font-bold text-[var(--color-text-primary)]">
                {letter}
              </h2>
              <div className="space-y-2">
                {terms.map((t) => {
                  const isExpanded = expanded.has(t.term)
                  return (
                    <div
                      key={t.term}
                      data-testid={`glossary-term-${termIndexMap.get(t.term)}`}
                      className="rounded-lg border transition-colors"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-3 text-left"
                        onClick={() => toggleTerm(t.term)}
                      >
                        <ChevronRight
                          size={14}
                          className={`shrink-0 text-[var(--color-text-tertiary)] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                        <h3 className="flex-1 text-sm font-semibold text-[var(--color-text-primary)]">
                          {t.term}
                        </h3>
                        {t.relatedSteps && t.relatedSteps.length > 0 && (
                          <div
                            className="flex flex-wrap gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t.relatedSteps.map((s) => (
                              <Link key={s} href={`/knowledge/guide/step/${s}`} tabIndex={0}>
                                <Badge
                                  variant="outline"
                                  className="cursor-pointer text-[10px] transition-opacity hover:opacity-80"
                                  style={{
                                    borderColor: stepColors[s],
                                    color: stepColors[s],
                                  }}
                                >
                                  {s}
                                </Badge>
                              </Link>
                            ))}
                          </div>
                        )}
                      </button>
                      {isExpanded && (
                        <div
                          className="space-y-3 border-t px-4 py-3"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                            {t.definition}
                          </p>

                          {/* Guide step links */}
                          {t.relatedSteps && t.relatedSteps.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {t.relatedSteps.map((s) => (
                                <Link
                                  key={`guide-${s}`}
                                  href={`/knowledge/guide/step/${s}`}
                                  className="text-xs font-medium transition-opacity hover:opacity-80"
                                  style={{ color: stepColors[s] }}
                                >
                                  View Step {s} Guide →
                                </Link>
                              ))}
                            </div>
                          )}

                          {/* Book chapter + form tool pill links */}
                          {((t.relatedSteps && t.relatedSteps.length > 0) ||
                            termFormLinks[t.term]) && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {/* Book chapter pills */}
                              {t.relatedSteps &&
                                t.relatedSteps.length > 0 &&
                                t.relatedSteps.length <= 2 &&
                                t.relatedSteps.map((s) => (
                                  <Link
                                    key={`book-${s}`}
                                    href={`/knowledge/book/${stepBookSlugs[s]}`}
                                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-[var(--color-bg-tertiary)]"
                                    style={{
                                      borderColor: stepColors[s],
                                      color: stepColors[s],
                                    }}
                                  >
                                    <BookMarked size={12} />
                                    Read in Book: {stepBookLabels[s]}
                                  </Link>
                                ))}
                              {/* Single "Read in Book" link when many steps */}
                              {t.relatedSteps &&
                                t.relatedSteps.length > 2 &&
                                t.relatedSteps[0] !== undefined && (
                                  <Link
                                    href={`/knowledge/book/${stepBookSlugs[t.relatedSteps[0]]}`}
                                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-[var(--color-bg-tertiary)]"
                                    style={{
                                      borderColor: 'var(--color-border)',
                                      color: 'var(--color-text-secondary)',
                                    }}
                                  >
                                    <BookMarked size={12} />
                                    Read in Book →
                                  </Link>
                                )}

                              {/* Form / tool link pill */}
                              {(() => {
                                const formLink = termFormLinks[t.term]
                                if (!formLink) return null
                                return (
                                  <Link
                                    href={formLink.href}
                                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-bg-tertiary)]"
                                    style={{ borderColor: 'var(--color-primary)' }}
                                  >
                                    <FileText size={12} />
                                    {formLink.label} →
                                  </Link>
                                )
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { GlossaryPage }
export default GlossaryPage
