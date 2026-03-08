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

export type TicketVelocityData = {
  week: string
  created: number
  completed: number
}

type TicketVelocityChartProps = {
  data: TicketVelocityData[]
}

export const TicketVelocityChart = ({ data }: TicketVelocityChartProps) => {
  const hasData = data.some((d) => d.created > 0 || d.completed > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Ticket Velocity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex h-48 items-center justify-center text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No ticket data yet. Create tickets to see velocity trends.
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
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-secondary)' }} />
              <Line
                type="monotone"
                dataKey="created"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Created"
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
