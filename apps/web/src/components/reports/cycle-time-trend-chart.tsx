'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type CycleTimeTrendData = {
  week: string
  avgCycleTime: number
  avgLeadTime: number
}

type CycleTimeTrendChartProps = {
  data: CycleTimeTrendData[]
}

export const CycleTimeTrendChart = ({ data }: CycleTimeTrendChartProps) => {
  const hasData = data.some((d) => d.avgCycleTime > 0 || d.avgLeadTime > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Cycle Time Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex h-48 items-center justify-center text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No completed tickets yet. Complete tickets to see cycle time trends.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
                width={40}
                label={{
                  value: 'Days',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: 'var(--color-text-tertiary)' },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: 13,
                }}
                labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
                formatter={(value: number | string | undefined) => {
                  if (typeof value === 'number') return [`${value.toFixed(1)} days`]
                  return [value != null ? String(value) : '']
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-secondary)' }} />
              <Line
                type="monotone"
                dataKey="avgCycleTime"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Cycle Time"
              />
              <Line
                type="monotone"
                dataKey="avgLeadTime"
                stroke="#06B6D4"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Lead Time"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
