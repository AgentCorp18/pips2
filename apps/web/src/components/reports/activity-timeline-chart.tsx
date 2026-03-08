'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type ActivityTimelineData = {
  date: string
  actions: number
}

type ActivityTimelineChartProps = {
  data: ActivityTimelineData[]
}

export const ActivityTimelineChart = ({ data }: ActivityTimelineChartProps) => {
  const hasData = data.some((d) => d.actions > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Activity Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex h-48 items-center justify-center text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No activity data yet. Team actions will appear here over time.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
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
              />
              <Area
                type="monotone"
                dataKey="actions"
                stroke="#6366F1"
                strokeWidth={2}
                fill="url(#activityGradient)"
                name="Actions"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
