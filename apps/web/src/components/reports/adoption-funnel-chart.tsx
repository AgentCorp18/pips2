'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PIPS_STEPS } from '@pips/shared'

export type AdoptionFunnelItem = {
  step: number
  stepName: string
  projectsReached: number
  completionRate: number
}

type AdoptionFunnelChartProps = {
  data: AdoptionFunnelItem[]
  totalProjects: number
}

export const AdoptionFunnelChart = ({ data, totalProjects }: AdoptionFunnelChartProps) => {
  const hasData = data.some((d) => d.projectsReached > 0)

  const chartData = data.map((d, idx) => ({
    ...d,
    color: PIPS_STEPS[idx]?.color ?? '#4F46E5',
    label: `S${d.step}: ${d.stepName}`,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Step Completion Funnel
        </CardTitle>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          How many of {totalProjects} project{totalProjects !== 1 ? 's' : ''} reached each step
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex h-48 items-center justify-center text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No projects yet. Start PIPS projects to see the funnel.
          </div>
        ) : (
          <div className="space-y-3">
            {chartData.map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <span
                  className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: item.color }}
                >
                  {item.step}
                </span>
                <span
                  className="w-24 flex-shrink-0 text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {item.stepName}
                </span>
                <div className="relative flex-1">
                  <div
                    className="h-6 rounded-sm transition-all"
                    style={{
                      width: `${item.completionRate}%`,
                      backgroundColor: item.color,
                      opacity: 0.85,
                      minWidth: item.completionRate > 0 ? '4px' : 0,
                    }}
                  />
                </div>
                <span
                  className="w-20 flex-shrink-0 text-right text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {item.projectsReached} ({item.completionRate}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
