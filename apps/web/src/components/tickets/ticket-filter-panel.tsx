'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import {
  ALL_STATUSES,
  ALL_PRIORITIES,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  TYPE_CONFIG,
} from '@/components/tickets/ticket-config'
import type { TicketStatus, TicketPriority, TicketType } from '@/types/tickets'

/* ============================================================
   Types
   ============================================================ */

type MemberOption = { user_id: string; display_name: string }
type ProjectOption = { id: string; name: string }

type TicketFilterPanelProps = {
  members: MemberOption[]
  projects: ProjectOption[]
  basePath?: string
}

const ALL_TYPES: TicketType[] = ['general', 'task', 'bug', 'feature', 'pips_project']

/* ============================================================
   Component
   ============================================================ */

export const TicketFilterPanel = ({
  members,
  projects,
  basePath = '/tickets',
}: TicketFilterPanelProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const activeStatuses = searchParams.getAll('status') as TicketStatus[]
  const activePriorities = searchParams.getAll('priority') as TicketPriority[]
  const activeTypes = searchParams.getAll('type') as TicketType[]
  const activeAssignee = searchParams.get('assignee_id') ?? ''
  const activeProject = searchParams.get('project_id') ?? ''

  const activeCount =
    activeStatuses.length +
    activePriorities.length +
    activeTypes.length +
    (activeAssignee ? 1 : 0) +
    (activeProject ? 1 : 0)

  const toggleArrayParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const current = params.getAll(key)
      params.delete(key)

      if (current.includes(value)) {
        current.filter((v) => v !== value).forEach((v) => params.append(key, v))
      } else {
        ;[...current, value].forEach((v) => params.append(key, v))
      }
      params.delete('page')
      router.push(`${basePath}?${params.toString()}`)
    },
    [router, searchParams, basePath],
  )

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${basePath}?${params.toString()}`)
    },
    [router, searchParams, basePath],
  )

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('status')
    params.delete('priority')
    params.delete('type')
    params.delete('assignee_id')
    params.delete('project_id')
    params.delete('quick')
    params.delete('search')
    params.delete('page')
    router.push(`${basePath}?${params.toString()}`)
  }, [router, searchParams, basePath])

  return (
    <div>
      {/* Toggle button */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="gap-1.5">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Advanced Filters
          {activeCount > 0 && (
            <Badge variant="default" className="ml-1 h-5 min-w-5 px-1.5">
              {activeCount}
            </Badge>
          )}
        </Button>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-1">
            <X size={14} />
            Clear all
          </Button>
        )}
      </div>

      {/* Expandable panel */}
      {isOpen && (
        <div
          className="mt-3 rounded-lg border p-4 space-y-4"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          {/* Status row */}
          <FilterSection label="Status">
            {ALL_STATUSES.map((s) => (
              <FilterChip
                key={s}
                label={STATUS_CONFIG[s].label}
                active={activeStatuses.includes(s)}
                onClick={() => toggleArrayParam('status', s)}
              />
            ))}
          </FilterSection>

          {/* Priority row */}
          <FilterSection label="Priority">
            {ALL_PRIORITIES.map((p) => (
              <FilterChip
                key={p}
                label={PRIORITY_CONFIG[p].label}
                active={activePriorities.includes(p)}
                onClick={() => toggleArrayParam('priority', p)}
              />
            ))}
          </FilterSection>

          {/* Type row */}
          <FilterSection label="Type">
            {ALL_TYPES.map((t) => (
              <FilterChip
                key={t}
                label={TYPE_CONFIG[t].label}
                active={activeTypes.includes(t)}
                onClick={() => toggleArrayParam('type', t)}
              />
            ))}
          </FilterSection>

          {/* Assignee + Project row */}
          <div className="flex flex-wrap gap-6">
            <FilterSection label="Assignee">
              <select
                className="h-8 rounded-md border px-2 text-sm"
                style={{ borderColor: 'var(--color-border)' }}
                value={activeAssignee}
                onChange={(e) => setParam('assignee_id', e.target.value)}
              >
                <option value="">All members</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.display_name}
                  </option>
                ))}
              </select>
            </FilterSection>

            {projects.length > 0 && (
              <FilterSection label="Project">
                <select
                  className="h-8 rounded-md border px-2 text-sm"
                  style={{ borderColor: 'var(--color-border)' }}
                  value={activeProject}
                  onChange={(e) => setParam('project_id', e.target.value)}
                >
                  <option value="">All projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FilterSection>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================================================
   Sub-components
   ============================================================ */

const FilterSection = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="mb-1.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
      {label}
    </p>
    <div className="flex flex-wrap gap-1.5">{children}</div>
  </div>
)

const FilterChip = ({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) => (
  <Button variant={active ? 'default' : 'outline'} size="xs" onClick={onClick}>
    {label}
  </Button>
)
