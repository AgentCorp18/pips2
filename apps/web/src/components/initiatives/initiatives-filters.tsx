'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

/* ============================================================
   Component
   ============================================================ */

export const InitiativesFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.replace(`/initiatives?${params.toString()}`)
    },
    [router, searchParams],
  )

  const clearFilters = useCallback(() => {
    router.replace('/initiatives')
  }, [router])

  const hasFilters =
    searchParams.has('search') || searchParams.has('status') || searchParams.has('sort')

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <Input
        placeholder="Search initiatives..."
        className="w-full sm:max-w-[240px]"
        defaultValue={searchParams.get('search') ?? ''}
        data-testid="initiative-search"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setFilter('search', e.currentTarget.value)
          }
        }}
        onBlur={(e) => setFilter('search', e.currentTarget.value)}
      />

      {/* Status filter */}
      <Select
        value={searchParams.get('status') ?? ''}
        onValueChange={(v) => setFilter('status', v)}
      >
        <SelectTrigger className="w-full sm:w-[140px]" size="sm" data-testid="initiative-filter">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="on_hold">On Hold</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select value={searchParams.get('sort') ?? ''} onValueChange={(v) => setFilter('sort', v)}>
        <SelectTrigger className="w-full sm:w-[160px]" size="sm" data-testid="initiative-sort">
          <SelectValue placeholder="Newest First" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="most_projects">Most Projects</SelectItem>
          <SelectItem value="name_az">Name A-Z</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X size={14} />
          Clear
        </Button>
      )}
    </div>
  )
}
