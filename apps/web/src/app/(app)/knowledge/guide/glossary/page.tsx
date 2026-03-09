'use client'

import { useState, useMemo, useCallback } from 'react'
import { BookOpen, Search, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ContentBreadcrumb } from '@/components/knowledge/content-breadcrumb'
import { GLOSSARY_TERMS, PIPS_STEPS } from '@pips/shared'

const stepColors: Record<number, string> = {}
for (const step of PIPS_STEPS) {
  stepColors[step.number] = step.color
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
          style={{ backgroundColor: 'rgba(217, 119, 6, 0.08)' }}
        >
          <BookOpen size={20} className="text-[#D97706]" />
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
                          <div className="flex flex-wrap gap-1">
                            {t.relatedSteps.map((s) => (
                              <Badge
                                key={s}
                                variant="outline"
                                className="text-[10px]"
                                style={{
                                  borderColor: stepColors[s],
                                  color: stepColors[s],
                                }}
                              >
                                {s}
                              </Badge>
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
                          {t.relatedSteps && t.relatedSteps.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {t.relatedSteps.map((s) => (
                                <Link
                                  key={s}
                                  href={`/knowledge/guide/step/${s}`}
                                  className="text-xs font-medium transition-opacity hover:opacity-80"
                                  style={{ color: stepColors[s] }}
                                >
                                  View Step {s} Guide →
                                </Link>
                              ))}
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
