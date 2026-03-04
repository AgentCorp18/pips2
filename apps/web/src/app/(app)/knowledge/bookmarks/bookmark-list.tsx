'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Bookmark, ArrowRight, X, BookOpen, Compass, ClipboardList, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toggleBookmark } from '../actions'
import type { BookmarkWithContent } from '../actions'

const PILLAR_CONFIG: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
  book: { label: 'Book', icon: BookOpen, color: 'var(--color-primary)' },
  guide: { label: 'Guide', icon: Compass, color: 'var(--color-step-3, #059669)' },
  workbook: { label: 'Workbook', icon: ClipboardList, color: 'var(--color-step-2, #D97706)' },
  workshop: { label: 'Workshop', icon: Users, color: 'var(--color-step-6, #0891B2)' },
}

type BookmarkListProps = {
  bookmarks: BookmarkWithContent[]
}

export const BookmarkList = ({ bookmarks: initialBookmarks }: BookmarkListProps) => {
  const [bookmarks, setBookmarks] = useState(initialBookmarks)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleRemove = (bookmark: BookmarkWithContent) => {
    setRemovingId(bookmark.id)

    // Optimistic removal
    setBookmarks((prev) => prev.filter((bm) => bm.id !== bookmark.id))

    startTransition(async () => {
      const result = await toggleBookmark(bookmark.content_node_id)
      // If toggle failed (still bookmarked), restore the item
      if (result.bookmarked) {
        setBookmarks((prev) => {
          const restored = [...prev, bookmark].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )
          return restored
        })
      }
      setRemovingId(null)
    })
  }

  if (bookmarks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
        <Bookmark size={32} className="mx-auto text-[var(--color-text-tertiary)]" />
        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">No bookmarks yet.</p>
        <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
          Start reading and bookmark content you want to revisit.
        </p>
        <Link href="/knowledge">
          <Button variant="outline" size="sm" className="mt-4">
            Browse Knowledge Hub
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-[var(--color-text-secondary)]">
        {bookmarks.length} saved item{bookmarks.length !== 1 ? 's' : ''}
      </p>
      {bookmarks.map((bm) => {
        const config = PILLAR_CONFIG[bm.pillar]
        const href = `/knowledge/${bm.pillar}/${bm.slug}`
        const isRemoving = removingId === bm.id

        return (
          <Card
            key={bm.id}
            className={`group transition-all hover:border-[var(--color-primary)] ${isRemoving ? 'opacity-50' : ''}`}
          >
            <CardContent className="flex items-center justify-between py-3">
              <Link href={href} className="flex min-w-0 flex-1 items-center gap-3">
                <Bookmark size={14} className="shrink-0 text-[var(--color-primary)]" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[10px] capitalize"
                      style={{ borderColor: config?.color, color: config?.color }}
                    >
                      {config?.label ?? bm.pillar}
                    </Badge>
                    <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {bm.title}
                    </span>
                  </div>
                  {bm.note && (
                    <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{bm.note}</p>
                  )}
                </div>
              </Link>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  {new Date(bm.created_at).toLocaleDateString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(bm)}
                  disabled={isPending}
                  className="h-7 gap-1 px-2 text-xs text-[var(--color-text-tertiary)] hover:text-red-600"
                  aria-label={`Remove bookmark for ${bm.title}`}
                >
                  <X size={12} />
                  Remove
                </Button>
                <Link href={href}>
                  <ArrowRight
                    size={14}
                    className="text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
