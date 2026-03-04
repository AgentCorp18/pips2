import Link from 'next/link'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getContentByPillar } from '../actions'

const BookPage = async () => {
  const chapters = await getContentByPillar('book')

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
          <BookOpen size={20} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            The Never-Ending Quest
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            The complete PIPS methodology book by Marc Albers
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/knowledge" className="hover:text-[var(--color-primary)]">
          Knowledge Hub
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">Book</span>
      </nav>

      {/* Chapter List */}
      <div className="space-y-2">
        {chapters.map((chapter) => (
          <Link key={chapter.id} href={`/knowledge/book/${chapter.slug}`}>
            <Card className="group cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-sm">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                      {chapter.title}
                    </h3>
                    <AccessBadge level={chapter.access_level} />
                  </div>
                  {chapter.summary && (
                    <p className="mt-1 line-clamp-1 text-xs text-[var(--color-text-tertiary)]">
                      {chapter.summary}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                    <Clock size={12} />
                    {chapter.estimated_read_minutes} min
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {chapters.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
            <BookOpen size={32} className="mx-auto text-[var(--color-text-tertiary)]" />
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              No book content available yet. Run the content compiler to populate.
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              pnpm content:compile && pnpm content:seed
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const AccessBadge = ({ level }: { level: string }) => {
  if (level === 'public') return null
  if (level === 'free-registered') {
    return (
      <Badge variant="outline" className="text-[10px]">
        Free
      </Badge>
    )
  }
  return null
}

export default BookPage
