import Link from 'next/link'
import { VALID_PERIODS, PERIOD_LABELS } from '@/app/(app)/reports/roi-dashboard/actions'
import type { Period } from '@/app/(app)/reports/roi-dashboard/actions'

/* ============================================================
   PeriodSelector
   A URL-param-driven period filter pill strip, matching the
   style established in savings-trend/page.tsx FilterLink.
   ============================================================ */

type PeriodSelectorProps = {
  /** The currently active period */
  activePeriod: Period
  /** A function to build the href for a given period value */
  buildUrl: (period: Period) => string
}

const PeriodSelector = ({ activePeriod, buildUrl }: PeriodSelectorProps) => (
  <div className="flex items-center gap-2">
    <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
      Period:
    </span>
    <div className="flex flex-wrap gap-1">
      {VALID_PERIODS.map((p) => {
        const active = activePeriod === p
        return (
          <Link
            key={p}
            href={buildUrl(p)}
            className="rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium transition-colors"
            style={
              active
                ? { backgroundColor: 'var(--color-primary)', color: '#fff' }
                : {
                    color: 'var(--color-text-secondary)',
                    backgroundColor: 'var(--color-surface-secondary)',
                  }
            }
            aria-current={active ? 'page' : undefined}
            data-testid={`period-selector-${p}`}
          >
            {PERIOD_LABELS[p]}
          </Link>
        )
      })}
    </div>
  </div>
)

export { PeriodSelector }
export type { PeriodSelectorProps }
