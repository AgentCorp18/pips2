'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PIPS_STEPS } from '@pips/shared'

export type FormUsageHeatmapItem = {
  formType: string
  displayName: string
  usageCount: number
  stepNumber: number
}

type FormUsageHeatmapProps = {
  data: FormUsageHeatmapItem[]
}

const STEP_COLORS = PIPS_STEPS.map((s) => s.color)

const cellBg = (count: number, maxCount: number): string => {
  if (count === 0 || maxCount === 0) return 'var(--color-border)'
  const intensity = count / maxCount
  const alpha = Math.max(0.12, Math.round(intensity * 100) / 100)
  return `rgba(79, 70, 229, ${alpha})`
}

export const FormUsageHeatmap = ({ data }: FormUsageHeatmapProps) => {
  const maxCount = Math.max(...data.map((d) => d.usageCount), 1)
  const hasData = data.some((d) => d.usageCount > 0)

  // Group items by step number
  const byStep = new Map<number, FormUsageHeatmapItem[]>()
  for (const item of data) {
    const arr = byStep.get(item.stepNumber) ?? []
    arr.push(item)
    byStep.set(item.stepNumber, arr)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Form Usage Heatmap
        </CardTitle>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Which tools are used most across your projects
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div
            className="flex h-48 items-center justify-center text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            No form usage data yet. Start completing PIPS forms to see adoption.
          </div>
        ) : (
          <div className="space-y-5">
            {Array.from({ length: 6 }, (_, i) => i + 1).map((stepNum) => {
              const stepItems = byStep.get(stepNum) ?? []
              const stepInfo = PIPS_STEPS[stepNum - 1]!
              const stepColor = STEP_COLORS[stepNum - 1] ?? '#4F46E5'

              return (
                <div key={stepNum}>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: stepColor }}
                    >
                      {stepNum}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {stepInfo.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stepItems.map((item) => (
                      <div
                        key={item.formType}
                        className="group relative cursor-default rounded-md px-3 py-2 text-xs font-medium transition-transform hover:scale-105"
                        style={{
                          backgroundColor: cellBg(item.usageCount, maxCount),
                          color:
                            item.usageCount > 0
                              ? 'var(--color-text-primary)'
                              : 'var(--color-text-tertiary)',
                          border: '1px solid var(--color-border)',
                          minWidth: '80px',
                          textAlign: 'center',
                        }}
                        title={`${item.displayName}: ${item.usageCount} use${item.usageCount !== 1 ? 's' : ''}`}
                      >
                        <div>{item.displayName}</div>
                        <div
                          className="mt-0.5 font-bold"
                          style={{
                            color:
                              item.usageCount > 0
                                ? 'var(--color-text-primary)'
                                : 'var(--color-text-tertiary)',
                          }}
                        >
                          {item.usageCount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
