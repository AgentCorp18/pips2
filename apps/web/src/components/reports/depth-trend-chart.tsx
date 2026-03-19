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

export type DepthTrendDataPoint = {
  month: string
  avgDepth: number
  projectCount: number
}

type DepthTrendChartProps = {
  data: DepthTrendDataPoint[]
}

export const DepthTrendChart = ({ data }: DepthTrendChartProps) => {
  const hasData = data.some((d) => d.avgDepth > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Average Methodology Depth Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex h-48 items-center justify-center text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No depth data yet. Complete PIPS forms to see the trend.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
                width={40}
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
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
                  if (name === 'avgDepth')
                    return [`${typeof value === 'number' ? value : 0}%`, 'Avg Depth']
                  if (name === 'projectCount') return [value ?? 0, 'Projects']
                  return [value ?? '', name ?? '']
                }}
              />
              <Legend
                formatter={(value) =>
                  value === 'avgDepth' ? 'Avg Depth Score' : 'Projects Created'
                }
                wrapperStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="avgDepth"
                stroke="#4F46E5"
                strokeWidth={2}
                dot={{ r: 4, fill: '#4F46E5' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="projectCount"
                stroke="#0891B2"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
