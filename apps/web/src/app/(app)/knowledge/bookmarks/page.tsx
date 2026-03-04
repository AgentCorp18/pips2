import Link from 'next/link'
import { Bookmark, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getUserBookmarks } from '../actions'

const BookmarksPage = async () => {
  const bookmarks = await getUserBookmarks()

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
          {bookmarks.length} saved item{bookmarks.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-2">
        {bookmarks.map((bm) => (
          <Card
            key={bm.id}
            className="group cursor-pointer transition-all hover:border-[var(--color-primary)]"
          >
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Bookmark size={14} className="text-[var(--color-primary)]" />
                <div>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {bm.content_node_id.replace(/\//g, ' / ')}
                  </span>
                  {bm.note && (
                    <p className="text-xs text-[var(--color-text-tertiary)]">{bm.note}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  {new Date(bm.created_at).toLocaleDateString()}
                </span>
                <ArrowRight size={14} className="text-[var(--color-text-tertiary)]" />
              </div>
            </CardContent>
          </Card>
        ))}

        {bookmarks.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-12 text-center">
            <Bookmark size={32} className="mx-auto text-[var(--color-text-tertiary)]" />
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">No bookmarks yet</p>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              Use the bookmark button while reading to save content for later
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookmarksPage
