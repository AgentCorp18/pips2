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
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

/* ============================================================
   Types
   ============================================================ */

type MemberOption = {
  user_id: string
  display_name: string
}

type ProjectOption = {
  id: string
  name: string
}

type BoardFiltersProps = {
  members: MemberOption[]
  projects: ProjectOption[]
}

/* ============================================================
   Component
   ============================================================ */

export const BoardFilters = ({ members, projects }: BoardFiltersProps) => {
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
      router.push(`/tickets/board?${params.toString()}`)
    },
    [router, searchParams],
  )

  const clearFilters = useCallback(() => {
    router.push('/tickets/board')
  }, [router])

  const hasFilters =
    searchParams.has('priority') ||
    searchParams.has('assignee_id') ||
    searchParams.has('project_id')

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Project */}
      <Select
        value={searchParams.get('project_id') ?? ''}
        onValueChange={(v) => setFilter('project_id', v)}
      >
        <SelectTrigger className="w-[150px]" size="sm">
          <SelectValue placeholder="Project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
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

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X size={14} />
          Clear
        </Button>
      )}
    </div>
  )
}
