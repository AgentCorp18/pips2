'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type TimeSavingsBarEntry = {
  name: string
  hoursPerYear: number
  laborValue: number
}

type TimeSavingsChartProps = {
  data: TimeSavingsBarEntry[]
  hourlyRate: number
}

const formatHours = (value: number): string => {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k hrs`
  return `${value} hrs`
}

export const TimeSavingsChart = ({ data, hourlyRate }: TimeSavingsChartProps) => {
  const hasData = data.some((d) => d.hoursPerYear > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Annual Hours Saved by Project
        </CardTitle>
        <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          At ${hourlyRate}/hr
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex h-48 items-center justify-center text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No time-based measurables found. Add hours or minutes measurables to Problem Statement
            forms.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, data.length * 48)}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 4, right: 64, left: 8, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
                tickFormatter={formatHours}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
                width={140}
                tickFormatter={(v: string) => (v.length > 20 ? v.slice(0, 18) + '…' : v)}
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
                  if (name === 'hoursPerYear' && typeof value === 'number') {
                    return [`${value.toLocaleString()} hrs/yr`, 'Annual Hours Saved']
                  }
                  return [value != null ? String(value) : '', name ?? '']
                }}
              />
              <Bar
                dataKey="hoursPerYear"
                name="hoursPerYear"
                fill="#3B82F6"
                radius={[0, 3, 3, 0]}
                maxBarSize={28}
                label={{
                  position: 'right',
                  fontSize: 11,
                  fill: 'var(--color-text-secondary)',
                  formatter: (v: unknown) =>
                    typeof v === 'number' ? formatHours(v) : String(v ?? ''),
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
