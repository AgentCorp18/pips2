'use client'

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

export type StepProgressData = {
  step: string
  name: string
  count: number
  color: string
}

type StepProgressChartProps = {
  data: StepProgressData[]
  title?: string
}

export const StepProgressChart = ({
  data,
  title = 'Projects by PIPS Step',
}: StepProgressChartProps) => {
  const hasData = data.some((d) => d.count > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex h-48 items-center justify-center text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No project data yet. Create projects to see step distribution.
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
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
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
