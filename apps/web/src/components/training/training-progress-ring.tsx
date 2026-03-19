type TrainingProgressRingProps = {
  progress: number // 0 to 1
  size?: number
  strokeWidth?: number
}

export const TrainingProgressRing = ({
  progress,
  size = 40,
  strokeWidth = 3,
}: TrainingProgressRingProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - progress * circumference

  const percent = Math.round(progress * 100)

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${percent}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progress >= 1 ? 'var(--color-success, #059669)' : 'var(--color-primary)'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--color-text-primary)]">
        {percent}%
      </span>
    </div>
  )
}
