import Link from 'next/link'
import { Search, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { searchContent } from '../actions'

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const results = query ? await searchContent(query) : []

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
          {query ? `Results for "${query}"` : 'Search Knowledge Hub'}
        </h1>
        {query && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Search input */}
      <form action="/knowledge/search" method="get">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
          />
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="Search chapters, tools, concepts..."
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
            autoFocus
          />
        </div>
      </form>

      {/* Results */}
      <div className="space-y-2">
        {results.map((node) => {
          const href = node.parent_id
            ? `/knowledge/book/${node.slug}`
            : `/knowledge/book/${node.slug}`

          return (
            <Link key={node.id} href={href}>
              <Card className="group cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-sm">
                <CardContent className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {node.pillar}
                      </Badge>
                      <h3 className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                        {node.title}
                      </h3>
                    </div>
                    {node.summary && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-[var(--color-text-tertiary)]">
                        {node.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                      <Clock size={11} />
                      {node.estimated_read_minutes}m
                    </span>
                    <ArrowRight size={14} className="text-[var(--color-text-tertiary)]" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}

        {query && results.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
            <Search size={32} className="mx-auto text-[var(--color-text-tertiary)]" />
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              No results found for &ldquo;{query}&rdquo;
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              Try different keywords or check the Book table of contents
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage
