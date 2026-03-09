'use client'

import { useState, useTransition } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleBookmark } from '@/app/(app)/knowledge/actions'

type BookmarkButtonProps = {
  contentNodeId: string
  initialBookmarked?: boolean
}

export const BookmarkButton = ({
  contentNodeId,
  initialBookmarked = false,
}: BookmarkButtonProps) => {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleBookmark(contentNodeId)
      setBookmarked(result.bookmarked)
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="gap-1.5"
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      data-testid="bookmark-btn"
    >
      {bookmarked ? (
        <BookmarkCheck size={14} aria-hidden="true" className="text-[var(--color-primary)]" />
      ) : (
        <Bookmark size={14} aria-hidden="true" />
      )}
      {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </Button>
  )
}
