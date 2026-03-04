'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Clock, ArrowRight, BookOpen, Compass, ClipboardList, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { searchContent } from '../actions'
import type { ContentNodeRow } from '../actions'

const PILLAR_CONFIG: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
  book: { label: 'Book', icon: BookOpen, color: 'var(--color-primary)' },
  guide: { label: 'Guide', icon: Compass, color: 'var(--color-step-3, #059669)' },
  workbook: { label: 'Workbook', icon: ClipboardList, color: 'var(--color-step-2, #D97706)' },
  workshop: { label: 'Workshop', icon: Users, color: 'var(--color-step-6, #0891B2)' },
}

const ACCESS_LABEL: Record<string, { text: string; variant: 'default' | 'secondary' | 'outline' }> =
  {
    public: { text: 'Free', variant: 'secondary' },
    'free-registered': { text: 'Free', variant: 'secondary' },
    paid: { text: 'Pro', variant: 'default' },
  }

const pillarHref = (node: ContentNodeRow): string => {
  return `/knowledge/${node.pillar}/${node.slug}`
}

const groupByPillar = (nodes: ContentNodeRow[]) => {
  const groups: Record<string, ContentNodeRow[]> = {}
  for (const node of nodes) {
    const pillar = node.pillar
    if (!groups[pillar]) groups[pillar] = []
    groups[pillar]!.push(node)
  }
  return groups
}

const SearchPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q')?.trim() ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<ContentNodeRow[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Run search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const data = await searchContent(query.trim())
        setResults(data)
        setHasSearched(true)
      })

      // Update URL without navigation reload
      const url = new URL(window.location.href)
      url.searchParams.set('q', query.trim())
      router.replace(url.pathname + url.search, { scroll: false })
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, router])

  // Run initial search if ?q= is present
  useEffect(() => {
    if (initialQuery) {
      startTransition(async () => {
        const data = await searchContent(initialQuery)
        setResults(data)
        setHasSearched(true)
      })
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const grouped = groupByPillar(results)
  const pillarOrder = ['book', 'guide', 'workbook', 'workshop']

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/knowledge" className="hover:text-[var(--color-primary)]">
          Knowledge Hub
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">Search</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {hasSearched && query ? `Results for "${query}"` : 'Search Knowledge Hub'}
        </h1>
        {hasSearched && query && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chapters, tools, concepts..."
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          autoFocus
        />
      </div>

      {/* Loading skeleton */}
      {isPending && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="mt-2 h-3 w-72" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results grouped by pillar */}
      {!isPending && hasSearched && results.length > 0 && (
        <div className="space-y-6">
          {pillarOrder
            .filter((p) => grouped[p]?.length)
            .map((pillar) => {
              const config = PILLAR_CONFIG[pillar]
              const PillarIcon = config?.icon ?? BookOpen
              const nodes = grouped[pillar] ?? []

              return (
                <div key={pillar}>
                  <div className="mb-2 flex items-center gap-2">
                    <PillarIcon size={16} style={{ color: config?.color }} />
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {config?.label ?? pillar}
                    </h2>
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      ({nodes.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {nodes.map((node) => {
                      const access = ACCESS_LABEL[node.access_level] ?? {
                        text: 'Pro',
                        variant: 'default' as const,
                      }

                      return (
                        <Link key={node.id} href={pillarHref(node)}>
                          <Card className="group cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-sm">
                            <CardContent className="flex items-center justify-between py-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px] capitalize">
                                    {node.pillar}
                                  </Badge>
                                  <Badge variant={access.variant} className="text-[10px]">
                                    {access.text}
                                  </Badge>
                                  <h3 className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                                    {node.title}
                                  </h3>
                                </div>
                                {node.summary && (
                                  <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-text-tertiary)]">
                                    {node.summary}
                                  </p>
                                )}
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                                  <Clock size={11} />
                                  {node.estimated_read_minutes}m
                                </span>
                                <ArrowRight
                                  size={14}
                                  className="text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* Empty state */}
      {!isPending && hasSearched && results.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
          <Search size={32} className="mx-auto text-[var(--color-text-tertiary)]" />
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            No results found for &ldquo;{query}&rdquo;
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            Try different keywords or browse the Knowledge Hub pillars
          </p>
        </div>
      )}

      {/* Initial state (no query) */}
      {!isPending && !hasSearched && (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
          <Search size={32} className="mx-auto text-[var(--color-text-tertiary)]" />
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            Start typing to search across all Knowledge Hub content
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            Search chapters, tools, concepts, exercises, and more
          </p>
        </div>
      )}
    </div>
  )
}

export default SearchPage
