import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Bookmarks | PIPS',
  description: 'Your saved knowledge hub content for quick access.',
}
import Link from 'next/link'
import { getUserBookmarksWithContent } from '../actions'
import { BookmarkList } from './bookmark-list'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

const BookmarksSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="mt-1 h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

const BookmarksContent = async () => {
  const bookmarks = await getUserBookmarksWithContent()
  return <BookmarkList bookmarks={bookmarks} />
}

const BookmarksPage = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/knowledge" className="hover:text-[var(--color-primary)]">
          Knowledge Hub
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">Bookmarks</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Bookmarks</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Content you&apos;ve saved for quick access
        </p>
      </div>

      <Suspense fallback={<BookmarksSkeleton />}>
        <BookmarksContent />
      </Suspense>
    </div>
  )
}

export default BookmarksPage
