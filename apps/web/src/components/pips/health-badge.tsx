'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { HealthScore } from '@pips/shared'

type HealthBadgeProps = {
  /** Fully calculated HealthScore from calculateProjectHealth() */
  health: HealthScore
  /** Compact mode — smaller ring, no label text. Use on project cards. */
  compact?: boolean
}

/**
 * Displays a circular health score ring with label and factor breakdown tooltip.
 * Mirrors the pattern of MethodologyDepthBadge.
 */
export const HealthBadge = ({ health, compact = false }: HealthBadgeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center gap-1.5"
            data-testid="health-badge"
            aria-label={`Project health: ${health.score}/100 — ${health.label}`}
          >
            <HealthRing score={health.score} color={health.color} size={compact ? 20 : 28} />
            {!compact && (
              <span className="text-xs font-medium" style={{ color: health.color }}>
                {health.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <HealthTooltip health={health} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/* ---- Ring indicator ---- */

const HealthRing = ({
  score,
  color,
  size,
}: {
  score: number
  color: string
  size: number
}) => {
  const strokeWidth = size < 24 ? 2.5 : 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" aria-hidden="true">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={strokeWidth}
      />
      {/* Progress ring */}
      {score > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      )}
      {/* Score text */}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90"
        style={{
          transformOrigin: `${size / 2}px ${size / 2}px`,
          fontSize: size < 24 ? '7px' : '9px',
          fontWeight: 600,
          fill: 'var(--color-text-primary)',
        }}
      >
        {score}
      </text>
    </svg>
  )
}

/* ---- Tooltip content ---- */

const FACTOR_LABELS: {
  key: keyof HealthScore['factors']
  label: string
  format: (v: number) => string
}[] = [
  {
    key: 'methodologyDepthPercent',
    label: 'Methodology depth',
    format: (v) => `${v}%`,
  },
  {
    key: 'daysSinceLastActivity',
    label: 'Last activity',
    format: (v) => (v === 0 ? 'today' : v === 1 ? '1 day ago' : `${v} days ago`),
  },
  {
    key: 'ticketCompletionPercent',
    label: 'Ticket completion',
    format: (v) => `${v}%`,
  },
  {
    key: 'formsCompletedPercent',
    label: 'Form coverage',
    format: (v) => `${v}%`,
  },
]

const HealthTooltip = ({ health }: { health: HealthScore }) => (
  <div className="space-y-2 text-xs" data-testid="health-tooltip">
    <div className="font-medium">
      Project Health: {health.score}/100 — {health.label}
    </div>
    <div className="space-y-1">
      {FACTOR_LABELS.map(({ key, label, format }) => (
        <div key={key} className="flex items-center justify-between gap-6">
          <span className="text-[var(--color-text-tertiary)]">{label}</span>
          <span className="font-medium">{format(health.factors[key])}</span>
        </div>
      ))}
    </div>
    <div className="border-t border-[var(--color-border)] pt-1.5 text-[var(--color-text-tertiary)]">
      Weights: depth 30% · freshness 25% · tickets 25% · forms 20%
    </div>
  </div>
)
