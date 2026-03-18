'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StepDistribution } from '@/app/(app)/dashboard/actions'

const STEP_SLUG_MAP: Record<string, string> = {
  identify: 'identify',
  analyze: 'analyze',
  generate: 'generate',
  select_and_plan: 'select_and_plan',
  implement: 'implement',
  evaluate: 'evaluate',
}

type ProjectsByStepChartProps = {
  data: StepDistribution[]
}

export const ProjectsByStepChart = ({ data }: ProjectsByStepChartProps) => {
  const router = useRouter()
  const hasData = data.some((d) => d.count > 0)

  const handleBarClick = useCallback(
    (entry: StepDistribution) => {
      const stepSlug = STEP_SLUG_MAP[entry.step]
      if (stepSlug) {
        router.push(`/projects?current_step=${stepSlug}`)
      }
    },
    [router],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Projects by Step
        </CardTitle>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          Click a bar to view projects in that step
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex h-48 items-center justify-center text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No active projects yet. Create a project to see step distribution.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data}
              layout="horizontal"
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: 13,
                }}
                labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
                itemStyle={{ color: 'var(--color-text-secondary)' }}
                cursor={{ fill: 'var(--color-surface-secondary)', opacity: 0.5 }}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
                onClick={(entry) => handleBarClick(entry as unknown as StepDistribution)}
                style={{ cursor: 'pointer' }}
              >
                {data.map((entry) => (
                  <Cell key={entry.step} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
