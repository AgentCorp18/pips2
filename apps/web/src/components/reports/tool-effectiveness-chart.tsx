'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type ToolEffectivenessItem = {
  formType: string
  displayName: string
  avgProjectDepth: number
  projectCount: number
}

type ToolEffectivenessChartProps = {
  data: ToolEffectivenessItem[]
}

export const ToolEffectivenessChart = ({ data }: ToolEffectivenessChartProps) => {
  const hasData = data.length > 0

  // Show top 8 for readability
  const chartData = data.slice(0, 8).map((d) => ({
    name: d.displayName.length > 18 ? `${d.displayName.slice(0, 16)}…` : d.displayName,
    fullName: d.displayName,
    avgDepth: d.avgProjectDepth,
    count: d.projectCount,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Top Tools by Project Depth
        </CardTitle>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Average methodology depth score for projects using each tool
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex h-48 items-center justify-center text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No tool usage data yet. Complete PIPS forms to see effectiveness rankings.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: 13,
                }}
                labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
                formatter={(
                  value: number | string | undefined,
                  name: string | undefined,
                  props: { payload?: { fullName?: string; count?: number } },
                ) => {
                  if (name === 'avgDepth')
                    return [
                      `${typeof value === 'number' ? value : 0}% avg depth (${props.payload?.count ?? 0} projects)`,
                      props.payload?.fullName ?? '',
                    ]
                  return [value ?? '', name ?? '']
                }}
              />
              <Bar dataKey="avgDepth" fill="#4F46E5" radius={[0, 4, 4, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
