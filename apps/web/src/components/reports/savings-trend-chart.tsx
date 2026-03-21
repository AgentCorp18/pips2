'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MonthlySavings } from '@/app/(app)/reports/savings-trend/actions'
import { formatCurrency } from '@/lib/format-utils'

export type { MonthlySavings }

type SavingsTrendChartProps = {
  data: MonthlySavings[]
}

export const SavingsTrendChart = ({ data }: SavingsTrendChartProps) => {
  const hasData = data.some((d) => d.projectedSavings > 0 || d.actualSavings > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Monthly Savings — Projected vs Actual
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex h-48 items-center justify-center text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No savings data yet. Add measurables to Problem Statement forms and Results Metrics to
            see the trend.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
                width={60}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: 13,
                }}
                labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
                formatter={(value: number | string | undefined, name: string | undefined) => {
                  const numVal = typeof value === 'number' ? value : 0
                  if (name === 'projectedSavings') return [formatCurrency(numVal), 'Projected']
                  if (name === 'actualSavings') return [formatCurrency(numVal), 'Actual']
                  return [value != null ? String(value) : '', name ?? '']
                }}
              />
              <Legend
                formatter={(value) => (value === 'projectedSavings' ? 'Projected' : 'Actual')}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar
                dataKey="projectedSavings"
                name="projectedSavings"
                fill="#3B82F6"
                radius={[3, 3, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="actualSavings"
                name="actualSavings"
                fill="#10B981"
                radius={[3, 3, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
