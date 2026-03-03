'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type NotificationPaginationProps = {
  total: number
  offset: number
  limit: number
}

export const NotificationPagination = ({ total, offset, limit }: NotificationPaginationProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(total / limit)

  const navigateToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      const newOffset = (page - 1) * limit
      if (newOffset > 0) {
        params.set('offset', String(newOffset))
      } else {
        params.delete('offset')
      }
      router.push(`/notifications?${params.toString()}`)
    },
    [router, searchParams, limit],
  )

  if (totalPages <= 1) return null

  return (
    <div className="mt-6 flex items-center justify-between">
      <p className="text-sm text-[var(--color-text-tertiary)]">
        Showing {offset + 1}--{Math.min(offset + limit, total)} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="gap-1"
        >
          <ChevronLeft size={14} />
          Previous
        </Button>
        <span className="text-sm text-[var(--color-text-secondary)]">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="gap-1"
        >
          Next
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  )
}
