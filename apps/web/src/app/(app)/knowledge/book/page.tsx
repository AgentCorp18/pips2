import Link from 'next/link'
import { BookOpen, Clock, ArrowRight, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContentBreadcrumb } from '@/components/knowledge/content-breadcrumb'
import { ReadingProgress } from '@/components/knowledge/reading-progress'
import { getContentByPillar, getRecentReadHistory } from '../actions'

const estimateReadingTime = (bodyMd: string | null): number => {
  if (!bodyMd) return 1
  const wordCount = bodyMd.split(/\s+/).length
  return Math.max(1, Math.round(wordCount / 200))
}

const BookPage = async () => {
  const [chapters, readHistory] = await Promise.all([
    getContentByPillar('book'),
    getRecentReadHistory(200),
  ])

  const readNodeIds = new Set(readHistory.map((r) => r.content_node_id))

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Breadcrumb */}
      <ContentBreadcrumb
        items={[
          { label: 'Knowledge Hub', href: '/knowledge' },
          { label: 'Book', href: '/knowledge/book' },
        ]}
      />

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

      {/* Reading Progress */}
      {chapters.length > 0 && (
        <ReadingProgress
          title="Book Progress"
          totalItems={chapters.length}
          completedItems={chapters.filter((ch) => readNodeIds.has(ch.id)).length}
        />
      )}

      {/* Chapter List */}
      <div className="space-y-2">
        {chapters.map((chapter, index) => {
          const isRead = readNodeIds.has(chapter.id)
          const readMinutes =
            chapter.estimated_read_minutes > 0
              ? chapter.estimated_read_minutes
              : estimateReadingTime(chapter.body_md)

          return (
            <Link key={chapter.id} href={`/knowledge/book/${chapter.slug}`}>
              <Card className="group cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-sm">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex flex-1 items-center gap-3">
                    {/* Chapter number circle */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isRead
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'border border-[var(--color-border)] text-[var(--color-text-tertiary)]'
                      }`}
                    >
                      {isRead ? <CheckCircle size={14} /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                          {chapter.title}
                        </h3>
                        <AccessBadge level={chapter.access_level} />
                        {isRead && (
                          <Badge
                            variant="outline"
                            className="border-[var(--color-primary)] text-[10px] text-[var(--color-primary)]"
                          >
                            Read
                          </Badge>
                        )}
                      </div>
                      {chapter.summary && (
                        <p className="mt-1 line-clamp-1 text-xs text-[var(--color-text-tertiary)]">
                          {chapter.summary}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                      <Clock size={12} />
                      {readMinutes} min
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

        {chapters.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
            <BookOpen size={32} className="mx-auto text-[var(--color-text-tertiary)]" />
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              Book content is being prepared. Check back soon!
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
