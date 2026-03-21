'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format-utils'

export type RoiTrendDataPoint = {
  month: string
  cumulativeSavings: number
  projectsCompleted: number
}

type RoiTrendChartProps = {
  data: RoiTrendDataPoint[]
}

export const RoiTrendChart = ({ data }: RoiTrendChartProps) => {
  const hasData = data.some((d) => d.cumulativeSavings > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Cumulative Savings Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex h-48 items-center justify-center text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No financial savings data yet. Add Results Metrics to completed projects to see trend.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
                width={56}
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
                  if (name === 'cumulativeSavings' && typeof value === 'number') {
                    return [formatCurrency(value), 'Cumulative Savings']
                  }
                  if (name === 'projectsCompleted' && typeof value === 'number') {
                    return [String(value), 'Projects Completed']
                  }
                  return [value != null ? String(value) : '', name ?? '']
                }}
              />
              <Line
                type="monotone"
                dataKey="cumulativeSavings"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10B981' }}
                activeDot={{ r: 6 }}
                name="cumulativeSavings"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
