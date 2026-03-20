'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, ChevronDown, X, Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { ProjectListItem, ProjectComparisonItem } from '@/app/(app)/reports/actions'

/* ============================================================
   Helpers
   ============================================================ */

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  if (value === 0) return '$0'
  return `$${value.toLocaleString()}`
}

const depthColor = (pct: number): string => {
  if (pct >= 70) return '#22C55E'
  if (pct >= 40) return '#F59E0B'
  return '#DC2626'
}

/* ============================================================
   Best/Worst cell coloring
   ============================================================ */

type MetricMode = 'higher-better' | 'lower-better' | 'neutral'

const cellStyle = (
  value: number | null,
  values: Array<number | null>,
  mode: MetricMode,
): React.CSSProperties => {
  const valid = values.filter((v): v is number => v !== null)
  if (valid.length < 2 || value === null || mode === 'neutral') return {}

  const best = mode === 'lower-better' ? Math.min(...valid) : Math.max(...valid)
  const worst = mode === 'lower-better' ? Math.max(...valid) : Math.min(...valid)

  if (value === best) return { backgroundColor: 'rgba(34, 197, 94, 0.15)', fontWeight: 700 }
  if (value === worst && valid.length > 1) return { backgroundColor: 'rgba(239, 68, 68, 0.12)' }
  return {}
}

/* ============================================================
   Comparison Table
   ============================================================ */

type MetricRow = {
  label: string
  getValue: (p: ProjectComparisonItem) => number | null
  renderCell?: (p: ProjectComparisonItem) => React.ReactNode
  format: (v: number | null) => string
  mode: MetricMode
}

const METRIC_ROWS: MetricRow[] = [
  {
    label: 'Status',
    getValue: () => null,
    renderCell: (p) => (
      <Badge
        variant={
          p.status === 'completed' ? 'default' : p.status === 'active' ? 'secondary' : 'outline'
        }
        className="text-xs capitalize"
      >
        {p.status}
      </Badge>
    ),
    format: () => '',
    mode: 'neutral',
  },
  {
    label: 'Cycle Time (days)',
    getValue: (p) => p.cycleTimeDays,
    format: (v) => (v !== null ? `${v}d` : '—'),
    mode: 'lower-better',
  },
  {
    label: 'Methodology Depth',
    getValue: (p) => p.methodologyDepth,
    renderCell: (p) => (
      <span
        style={{ color: depthColor(p.methodologyDepth), fontWeight: 700 }}
        title="Methodology depth shows what percentage of the 25 PIPS tools have been used for this project. Higher depth = more rigorous analysis."
      >
        {p.methodologyDepth}%
      </span>
    ),
    format: (v) => (v !== null ? `${v}%` : '—'),
    mode: 'higher-better',
  },
  {
    label: 'Tickets Created',
    getValue: (p) => p.ticketsCreated,
    format: (v) => (v !== null ? String(v) : '—'),
    mode: 'neutral',
  },
  {
    label: 'Tickets Resolved',
    getValue: (p) => p.ticketsResolved,
    format: (v) => (v !== null ? String(v) : '—'),
    mode: 'higher-better',
  },
  {
    label: 'Forms Completed',
    getValue: (p) => p.formsCompleted,
    format: (v) => (v !== null ? `${v} / 25` : '—'),
    mode: 'higher-better',
  },
  {
    label: 'Measurables',
    getValue: (p) => p.measurablesCount,
    format: (v) => (v !== null ? String(v) : '—'),
    mode: 'higher-better',
  },
  {
    label: 'Projected Savings',
    getValue: (p) => p.projectedSavings,
    format: (v) => (v !== null ? formatCurrency(v) : '—'),
    mode: 'higher-better',
  },
]

type ComparisonTableProps = {
  projects: ProjectComparisonItem[]
}

const ComparisonTable = ({ projects }: ComparisonTableProps) => {
  if (projects.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th
              className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-text-tertiary)', minWidth: '140px' }}
            >
              Metric
            </th>
            {projects.map((p) => (
              <th
                key={p.id}
                className="px-3 py-3 text-center text-xs font-medium"
                style={{ color: 'var(--color-text-primary)', minWidth: '160px' }}
              >
                <div className="truncate font-semibold" title={p.title}>
                  {p.title}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRIC_ROWS.map((row, rowIdx) => {
            const values = projects.map((p) => row.getValue(p))

            return (
              <tr key={rowIdx} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                <td
                  className="py-3 pr-4 font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {row.label}
                </td>
                {projects.map((p, colIdx) => {
                  const rawValue = values[colIdx] ?? null

                  if (row.renderCell) {
                    return (
                      <td key={p.id} className="px-3 py-3 text-center">
                        {row.renderCell(p)}
                      </td>
                    )
                  }

                  return (
                    <td
                      key={p.id}
                      className="rounded px-3 py-3 text-center"
                      style={{
                        ...cellStyle(rawValue, values, row.mode),
                        color:
                          rawValue !== null && rawValue > 0
                            ? 'var(--color-text-primary)'
                            : 'var(--color-text-tertiary)',
                      }}
                    >
                      {row.format(rawValue)}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ============================================================
   Project Multi-Select using Popover
   ============================================================ */

type MultiSelectProps = {
  projectList: ProjectListItem[]
  selectedIds: string[]
  onToggle: (id: string) => void
  maxProjects: number
}

const MultiSelectDropdown = ({
  projectList,
  selectedIds,
  onToggle,
  maxProjects,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = projectList.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          aria-label="Add project to compare"
          disabled={selectedIds.length >= maxProjects}
        >
          Add project
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="relative mb-2">
          <Search
            size={14}
            className="absolute left-2 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-tertiary)' }}
          />
          <Input
            placeholder="Search projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 pl-7 text-sm"
            autoFocus
          />
        </div>
        <div className="max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <p
              className="px-2 py-4 text-center text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              No projects found.
            </p>
          ) : (
            filtered.map((p) => {
              const isSelected = selectedIds.includes(p.id)
              const isDisabled = !isSelected && selectedIds.length >= maxProjects

              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onToggle(p.id)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check
                    size={14}
                    className={isSelected ? 'opacity-100' : 'opacity-0'}
                    style={{ color: '#4F46E5', flexShrink: 0 }}
                  />
                  <span className="flex-1 truncate text-left">{p.title}</span>
                  <span
                    className="rounded px-1 py-0.5 text-[10px] capitalize"
                    style={{
                      backgroundColor: 'var(--color-border)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {p.status}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ============================================================
   Main Client Component
   ============================================================ */

type ProjectComparisonClientProps = {
  projectList: ProjectListItem[]
  initialComparison: ProjectComparisonItem[]
  initialSelectedIds: string[]
}

export const ProjectComparisonClient = ({
  projectList,
  initialComparison,
  initialSelectedIds,
}: ProjectComparisonClientProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds)

  const MAX_PROJECTS = 5
  const MIN_PROJECTS = 2

  const updateUrl = useCallback(
    (ids: string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      if (ids.length > 0) {
        params.set('ids', ids.join(','))
      } else {
        params.delete('ids')
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams],
  )

  const toggleProject = (id: string) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      const clamped = next.slice(0, MAX_PROJECTS)
      updateUrl(clamped)
      return clamped
    })
  }

  const removeProject = (id: string) => {
    setSelectedIds((prev) => {
      const next = prev.filter((x) => x !== id)
      updateUrl(next)
      return next
    })
  }

  const selectedLabels = selectedIds.map((id) => {
    const p = projectList.find((proj) => proj.id === id)
    return p ? p.title : id
  })

  return (
    <div className="space-y-6">
      {/* Selector */}
      <Card>
        <CardHeader>
          <CardTitle
            className="text-base font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Select Projects to Compare
          </CardTitle>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Choose 2–5 projects for side-by-side comparison. URL updates for easy sharing.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {/* Selected chips */}
            {selectedIds.map((id, i) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid rgba(79, 70, 229, 0.3)',
                }}
              >
                {selectedLabels[i] ?? id}
                <button
                  type="button"
                  onClick={() => removeProject(id)}
                  className="ml-1 rounded-full p-0.5 hover:bg-black/10"
                  aria-label={`Remove ${selectedLabels[i] ?? id}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {/* Add button */}
            {selectedIds.length < MAX_PROJECTS && (
              <MultiSelectDropdown
                projectList={projectList}
                selectedIds={selectedIds}
                onToggle={toggleProject}
                maxProjects={MAX_PROJECTS}
              />
            )}
          </div>

          {selectedIds.length < MIN_PROJECTS && (
            <p className="mt-3 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Select at least {MIN_PROJECTS} projects to see the comparison.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {initialComparison.length >= MIN_PROJECTS && (
        <Card>
          <CardHeader>
            <CardTitle
              className="text-base font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Side-by-Side Comparison
            </CardTitle>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Green = best in row · Red = worst in row (where applicable)
            </p>
          </CardHeader>
          <CardContent className={isPending ? 'opacity-60 transition-opacity' : ''}>
            <ComparisonTable projects={initialComparison} />
          </CardContent>
        </Card>
      )}

      {/* Placeholder when too few selected */}
      {initialComparison.length > 0 && initialComparison.length < MIN_PROJECTS && (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Add one more project to see the comparison table.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {initialComparison.length === 0 && selectedIds.length === 0 && (
        <Card>
          <CardContent className="flex h-40 flex-col items-center justify-center gap-2">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              No projects selected yet
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Use the selector above to choose projects for comparison.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
