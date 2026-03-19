'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, Trophy } from 'lucide-react'
import type { TeamPerformance } from '@/app/(app)/reports/roi-dashboard/actions'

/* ============================================================
   Types
   ============================================================ */

type SortKey = keyof Pick<
  TeamPerformance,
  | 'teamName'
  | 'memberCount'
  | 'projectsCompleted'
  | 'ticketsResolved'
  | 'avgMethodologyDepth'
  | 'avgCycleTimeDays'
  | 'totalSavings'
  | 'formsCompleted'
>

type SortDir = 'asc' | 'desc'

type TeamPerformanceTableProps = {
  data: TeamPerformance[]
}

/* ============================================================
   Helpers
   ============================================================ */

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  if (value === 0) return '—'
  return `$${value.toLocaleString()}`
}

const depthBadgeColor = (pct: number): string => {
  if (pct >= 70) return '#22C55E'
  if (pct >= 40) return '#F59E0B'
  return '#6366F1'
}

/* ============================================================
   Column header with sort
   ============================================================ */

type ColHeaderProps = {
  label: string
  colKey: SortKey
  currentKey: SortKey
  currentDir: SortDir
  onSort: (key: SortKey) => void
  align?: 'left' | 'right'
}

const ColHeader = ({
  label,
  colKey,
  currentKey,
  currentDir,
  onSort,
  align = 'right',
}: ColHeaderProps) => {
  const active = currentKey === colKey
  return (
    <th
      className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider"
      style={{
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
        textAlign: align,
      }}
      onClick={() => onSort(colKey)}
      aria-sort={active ? (currentDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="inline-flex items-center gap-1">
        {align === 'left' ? label : null}
        {active ? currentDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} /> : null}
        {align === 'right' ? label : null}
      </span>
    </th>
  )
}

/* ============================================================
   Main component
   ============================================================ */

export const TeamPerformanceTable = ({ data }: TeamPerformanceTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('totalSavings')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]

    if (aVal === null && bVal === null) return 0
    if (aVal === null) return 1
    if (bVal === null) return -1

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }

    const aNum = aVal as number
    const bNum = bVal as number
    return sortDir === 'asc' ? aNum - bNum : bNum - aNum
  })

  // Identify top performer by total savings, then by methodology depth
  const topTeamId = sorted.length > 0 ? sorted[0]!.teamId : null

  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <div
            className="flex h-32 items-center justify-center text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No teams found. Create teams in Settings to see per-team performance.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle
          className="text-base font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Team Performance
        </CardTitle>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Click any column header to sort. Metrics aggregate projects and tickets owned by team
          members.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <ColHeader
                  label="Team"
                  colKey="teamName"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                  align="left"
                />
                <ColHeader
                  label="Members"
                  colKey="memberCount"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <ColHeader
                  label="Projects"
                  colKey="projectsCompleted"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <ColHeader
                  label="Tickets Resolved"
                  colKey="ticketsResolved"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <ColHeader
                  label="Avg Depth"
                  colKey="avgMethodologyDepth"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <ColHeader
                  label="Avg Cycle"
                  colKey="avgCycleTimeDays"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <ColHeader
                  label="Total Savings"
                  colKey="totalSavings"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <ColHeader
                  label="Forms"
                  colKey="formsCompleted"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
              </tr>
            </thead>
            <tbody>
              {sorted.map((team) => {
                const isTop = team.teamId === topTeamId
                return (
                  <tr
                    key={team.teamId}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: isTop ? 'rgba(16,185,129,0.04)' : undefined,
                    }}
                  >
                    {/* Team name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isTop && (
                          <Trophy
                            size={14}
                            style={{ color: '#F59E0B', flexShrink: 0 }}
                            aria-label="Top performer"
                          />
                        )}
                        <span
                          className="font-medium"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {team.teamName}
                        </span>
                      </div>
                    </td>

                    {/* Member count */}
                    <td
                      className="px-4 py-3 text-right"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {team.memberCount}
                    </td>

                    {/* Projects completed */}
                    <td className="px-4 py-3 text-right">
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            team.projectsCompleted > 0
                              ? 'var(--color-text-primary)'
                              : 'var(--color-text-tertiary)',
                        }}
                      >
                        {team.projectsCompleted > 0 ? team.projectsCompleted : '—'}
                      </span>
                    </td>

                    {/* Tickets resolved */}
                    <td className="px-4 py-3 text-right">
                      <span
                        style={{
                          color:
                            team.ticketsResolved > 0
                              ? 'var(--color-text-primary)'
                              : 'var(--color-text-tertiary)',
                        }}
                      >
                        {team.ticketsResolved > 0 ? team.ticketsResolved : '—'}
                      </span>
                    </td>

                    {/* Avg methodology depth */}
                    <td className="px-4 py-3 text-right">
                      {team.avgMethodologyDepth > 0 ? (
                        <Badge
                          style={{
                            backgroundColor: `${depthBadgeColor(team.avgMethodologyDepth)}20`,
                            color: depthBadgeColor(team.avgMethodologyDepth),
                            border: `1px solid ${depthBadgeColor(team.avgMethodologyDepth)}40`,
                          }}
                        >
                          {team.avgMethodologyDepth}%
                        </Badge>
                      ) : (
                        <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>
                      )}
                    </td>

                    {/* Avg cycle time */}
                    <td
                      className="px-4 py-3 text-right"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {team.avgCycleTimeDays !== null ? `${team.avgCycleTimeDays}d` : '—'}
                    </td>

                    {/* Total savings */}
                    <td className="px-4 py-3 text-right">
                      <span
                        className="font-semibold"
                        style={{
                          color: team.totalSavings > 0 ? '#10B981' : 'var(--color-text-tertiary)',
                        }}
                      >
                        {formatCurrency(team.totalSavings)}
                      </span>
                    </td>

                    {/* Forms completed */}
                    <td
                      className="px-4 py-3 text-right"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {team.formsCompleted > 0 ? team.formsCompleted : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
