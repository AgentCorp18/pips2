'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

/* ============================================================
   Types
   ============================================================ */

type MemberOption = {
  user_id: string
  display_name: string
}

type TicketListFiltersProps = {
  members: MemberOption[]
}

/* ============================================================
   Component
   ============================================================ */

export const TicketListFilters = ({ members }: TicketListFiltersProps) => {
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
      router.push(`/tickets?${params.toString()}`)
    },
    [router, searchParams],
  )

  const clearFilters = useCallback(() => {
    router.push('/tickets')
  }, [router])

  const hasFilters =
    searchParams.has('status') ||
    searchParams.has('priority') ||
    searchParams.has('type') ||
    searchParams.has('assignee_id') ||
    searchParams.has('search')

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <Input
        placeholder="Search tickets..."
        className="max-w-[220px]"
        defaultValue={searchParams.get('search') ?? ''}
        onChange={() => {
          // Debounce-like: update on blur or enter
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setFilter('search', e.currentTarget.value)
          }
        }}
        onBlur={(e) => setFilter('search', e.currentTarget.value)}
      />

      {/* Status */}
      <Select
        value={searchParams.get('status') ?? ''}
        onValueChange={(v) => setFilter('status', v)}
      >
        <SelectTrigger className="w-[130px]" size="sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="backlog">Backlog</SelectItem>
          <SelectItem value="todo">Todo</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="in_review">In Review</SelectItem>
          <SelectItem value="blocked">Blocked</SelectItem>
          <SelectItem value="done">Done</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Priority */}
      <Select
        value={searchParams.get('priority') ?? ''}
        onValueChange={(v) => setFilter('priority', v)}
      >
        <SelectTrigger className="w-[130px]" size="sm">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="none">None</SelectItem>
        </SelectContent>
      </Select>

      {/* Type */}
      <Select value={searchParams.get('type') ?? ''} onValueChange={(v) => setFilter('type', v)}>
        <SelectTrigger className="w-[130px]" size="sm">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="general">General</SelectItem>
          <SelectItem value="task">Task</SelectItem>
          <SelectItem value="bug">Bug</SelectItem>
          <SelectItem value="feature">Feature</SelectItem>
          <SelectItem value="pips_project">PIPS Project</SelectItem>
        </SelectContent>
      </Select>

      {/* Assignee */}
      <Select
        value={searchParams.get('assignee_id') ?? ''}
        onValueChange={(v) => setFilter('assignee_id', v)}
      >
        <SelectTrigger className="w-[150px]" size="sm">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          {members.map((m) => (
            <SelectItem key={m.user_id} value={m.user_id}>
              {m.display_name}
            </SelectItem>
          ))}
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
