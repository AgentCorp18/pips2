'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LazyTimeSavingsChart } from '@/components/reports/lazy-charts'
import { Clock, DollarSign, Settings } from 'lucide-react'
import type { TimeSavingsData, ProjectTimeSavings } from './actions'

/* ============================================================
   Helpers
   ============================================================ */

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  if (value === 0) return '$0'
  return `$${value.toLocaleString()}`
}

/* ============================================================
   Component
   ============================================================ */

type TimeSavingsClientProps = {
  initialData: TimeSavingsData
}

export const TimeSavingsClient = ({ initialData }: TimeSavingsClientProps) => {
  const [hourlyRate, setHourlyRate] = useState<number>(initialData.hourlyRate)
  const [rateInput, setRateInput] = useState<string>(String(initialData.hourlyRate))

  const handleRateChange = (value: string) => {
    setRateInput(value)
    const parsed = parseFloat(value)
    if (!isNaN(parsed) && parsed > 0) {
      setHourlyRate(parsed)
    }
  }

  // Recalculate labor values with the current hourly rate
  const recalcProject = (p: ProjectTimeSavings) => ({
    ...p,
    laborValue: Math.round(p.hoursPerYear * hourlyRate),
  })

  const byProject = initialData.byProject.map(recalcProject)

  const totalLaborValue = Math.round(initialData.totalAnnualHoursSaved * hourlyRate)
  const totalHours = initialData.totalAnnualHoursSaved

  const chartData = byProject.slice(0, 15).map((p) => ({
    name: p.projectTitle,
    hoursPerYear: p.hoursPerYear,
    laborValue: p.laborValue,
  }))

  const hasData = byProject.length > 0

  return (
    <div className="space-y-8">
      {/* Hourly rate configurator */}
      <Card>
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2 text-base font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Settings size={16} style={{ color: 'var(--color-text-secondary)' }} />
            Configure Hourly Rate
          </CardTitle>
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Adjust the average fully-loaded labor rate to recalculate all values in real-time.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Label
              htmlFor="hourly-rate"
              className="shrink-0 text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Hourly rate ($)
            </Label>
            <div className="relative w-36">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                $
              </span>
              <Input
                id="hourly-rate"
                type="number"
                min={1}
                max={10000}
                step={5}
                value={rateInput}
                onChange={(e) => handleRateChange(e.target.value)}
                className="pl-7"
              />
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Default from your project forms: ${initialData.hourlyRate}/hr
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Hero numbers */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}
          />
          <CardContent className="relative pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#3B82F620' }}
              >
                <Clock size={22} style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Total Annual Hours Saved
                </p>
                <p
                  className="mt-1 text-4xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {totalHours > 0 ? totalHours.toLocaleString() : '0'}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {totalHours > 0
                    ? `Your improvement projects save ${totalHours.toLocaleString()} hours per year`
                    : 'Add time-based measurables to see savings'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
          />
          <CardContent className="relative pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#10B98120' }}
              >
                <DollarSign size={22} style={{ color: '#10B981' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Annual Labor Value
                </p>
                <p
                  className="mt-1 text-4xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {totalLaborValue > 0 ? formatCurrency(totalLaborValue) : '$0'}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {totalLaborValue > 0
                    ? `That's ${formatCurrency(totalLaborValue)} in annual labor value at $${Math.round(hourlyRate)}/hr`
                    : `At $${Math.round(hourlyRate)}/hr fully-loaded`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart — top projects by hours saved */}
      {hasData && (
        <div>
          <LazyTimeSavingsChart data={chartData} hourlyRate={Math.round(hourlyRate)} />
        </div>
      )}

      {/* By project breakdown */}
      {hasData ? (
        <div>
          <h2
            className="mb-4 text-base font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            By Project
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {byProject.map((p) => (
              <Card key={p.projectId} className="flex flex-col">
                <CardHeader className="pb-3">
                  <Link
                    href={`/projects/${p.projectId}`}
                    className="text-sm font-semibold leading-tight hover:underline"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {p.projectTitle}
                  </Link>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className="flex flex-col items-center rounded-[var(--radius-md)] px-2 py-2"
                      style={{ backgroundColor: '#3B82F620' }}
                    >
                      <span className="text-xl font-bold" style={{ color: '#3B82F6' }}>
                        {p.hoursPerYear.toLocaleString()}
                      </span>
                      <span
                        className="mt-0.5 text-center text-xs"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        hrs/yr
                      </span>
                    </div>
                    <div
                      className="flex flex-col items-center rounded-[var(--radius-md)] px-2 py-2"
                      style={{ backgroundColor: '#10B98120' }}
                    >
                      <span className="text-xl font-bold" style={{ color: '#10B981' }}>
                        {formatCurrency(p.laborValue)}
                      </span>
                      <span
                        className="mt-0.5 text-center text-xs"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        labor value
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-1">
                    {p.measurables.map((m, idx) => (
                      <li key={idx} className="flex items-center justify-between text-xs">
                        <span
                          className="truncate"
                          style={{ color: 'var(--color-text-secondary)' }}
                          title={m.metric}
                        >
                          {m.metric || 'Measurable'}
                        </span>
                        <span className="ml-2 shrink-0 font-medium" style={{ color: '#3B82F6' }}>
                          {m.hoursSaved.toLocaleString()}h
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Clock
              size={36}
              className="mx-auto mb-4"
              style={{ color: 'var(--color-text-tertiary)' }}
            />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              No time-based measurables found
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Add measurables with units like &ldquo;hours/week&rdquo; or &ldquo;minutes/day&rdquo;
              to Problem Statement forms.
            </p>
          </CardContent>
        </Card>
      )}

      {/* By team breakdown */}
      {initialData.byTeam.length > 0 && (
        <div>
          <h2
            className="mb-4 text-base font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            By Team
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {initialData.byTeam.map((team) => (
              <Card key={team.teamName}>
                <CardContent className="pt-6">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {team.teamName}
                  </p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold" style={{ color: '#3B82F6' }}>
                      {team.totalHours.toLocaleString()}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      hrs/yr
                    </span>
                  </div>
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    {formatCurrency(Math.round(team.totalHours * hourlyRate))} labor value at $
                    {Math.round(hourlyRate)}/hr
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
