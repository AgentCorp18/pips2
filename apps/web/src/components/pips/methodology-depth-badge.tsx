import { calculateMethodologyDepth, type MethodologyDepthResult } from '@pips/shared'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type MethodologyDepthBadgeProps = {
  /** Set of form_type strings that have been filled out for this project */
  completedFormTypes: Set<string>
  /** Compact mode — smaller text, no label. Use on project cards. */
  compact?: boolean
}

export const MethodologyDepthBadge = ({
  completedFormTypes,
  compact = false,
}: MethodologyDepthBadgeProps) => {
  const result = calculateMethodologyDepth(completedFormTypes)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center gap-1.5"
            data-testid="methodology-depth-badge"
            aria-label={`Methodology depth: ${result.score}% — ${result.label}`}
          >
            <DepthRing score={result.score} color={result.color} size={compact ? 20 : 28} />
            {!compact && (
              <span className="text-xs font-medium" style={{ color: result.color }}>
                {result.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <DepthTooltip result={result} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/* ---- Ring indicator ---- */

const DepthRing = ({ score, color, size }: { score: number; color: string; size: number }) => {
  const strokeWidth = size < 24 ? 2.5 : 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
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

const DepthTooltip = ({ result }: { result: MethodologyDepthResult }) => (
  <div className="space-y-2 text-xs">
    <div className="font-medium">
      Methodology Depth: {result.score}% — {result.label}
    </div>
    <div className="text-[var(--color-text-tertiary)]">
      Methodology depth shows what percentage of the 25 PIPS tools have been used for this project.
      Higher depth = more rigorous analysis.
    </div>
    <div className="text-[var(--color-text-tertiary)]">
      {result.completedCount} of {result.totalCount} tools used
    </div>
    <div className="space-y-0.5">
      {result.steps.map((step) => (
        <div key={step.stepNumber} className="flex items-center gap-2">
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: `var(--color-step-${step.stepNumber})` }}
          />
          <span>
            {step.stepName}: {step.completedForms.length}/{step.totalForms}
          </span>
          {step.requiredComplete && <span className="text-[var(--color-success)]">✓</span>}
        </div>
      ))}
    </div>
    {result.nextRecommendation && (
      <div className="border-t border-[var(--color-border)] pt-1.5 text-[var(--color-text-tertiary)]">
        Next: {result.nextRecommendation.formName}
      </div>
    )}
  </div>
)
