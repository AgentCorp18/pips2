'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type FormCompletionData = {
  step: string
  started: number
  completed: number
}

type FormCompletionChartProps = {
  data: FormCompletionData[]
  title?: string
}

export const FormCompletionChart = ({
  data,
  title = 'Form Completion by Step',
}: FormCompletionChartProps) => {
  const hasData = data.some((d) => d.started > 0 || d.completed > 0)

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
            No form data yet. Use PIPS tools within projects to see form completion.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="step"
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
              <Bar
                dataKey="started"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                name="Started"
              />
              <Bar
                dataKey="completed"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                name="Completed"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
