'use client'

import { getFormDisplayName } from '@/lib/form-utils'
import { STEP_CONTENT } from '@pips/shared'
import type { PipsStepNumber } from '@pips/shared'

/** Total number of form types defined across all PIPS steps */
const TOTAL_FORM_TYPES = Array.from(
  { length: 6 },
  (_, i) => STEP_CONTENT[(i + 1) as PipsStepNumber].forms.length,
).reduce((a, b) => a + b, 0)

type FormStatsBarProps = {
  total: number
  byFormType: { formType: string; count: number }[]
  recentCount: number
}

export const FormStatsBar = ({ total, byFormType, recentCount }: FormStatsBarProps) => {
  const mostUsed = byFormType[0]
  const uniqueFormTypes = byFormType.length

  const stats = [
    {
      label: 'Total Forms',
      value: String(total),
      color: '#4F46E5',
    },
    {
      label: 'Most Used',
      value: mostUsed ? getFormDisplayName(mostUsed.formType) : '—',
      subValue: mostUsed ? `${mostUsed.count} times` : undefined,
      color: '#2563EB',
    },
    {
      label: 'Modified This Week',
      value: String(recentCount),
      color: '#059669',
    },
    {
      label: 'Form Types Used',
      value: `${uniqueFormTypes}/${TOTAL_FORM_TYPES}`,
      color: '#4338CA',
    },
  ]

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-xl border border-[var(--color-border)] p-4"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          {/* Color stripe at top */}
          <div
            className="absolute inset-x-0 top-0 h-1 rounded-t-xl"
            style={{ backgroundColor: stat.color }}
          />
          <p
            className="mb-1 text-xs font-medium uppercase tracking-wide"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {stat.label}
          </p>
          <p
            className="truncate text-2xl font-semibold leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
            title={stat.value}
          >
            {stat.value}
          </p>
          {stat.subValue && (
            <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {stat.subValue}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
