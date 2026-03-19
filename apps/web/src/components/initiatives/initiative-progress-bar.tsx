import type { InitiativeProgress } from '@/types/initiatives'

type InitiativeProgressBarProps = {
  progress: InitiativeProgress
  color: string
}

export const InitiativeProgressBar = ({ progress, color }: InitiativeProgressBarProps) => {
  return (
    <div className="space-y-3">
      {/* Overall weighted progress */}
      <div>
        <div className="mb-1 flex items-center justify-between text-sm">
          <span style={{ color: 'var(--color-text-secondary)' }}>Overall Progress</span>
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {progress.weighted_progress}%
          </span>
        </div>
        <div
          className="h-3 overflow-hidden rounded-full"
          style={{ backgroundColor: 'var(--color-border)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress.weighted_progress}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          Weighted by project priority
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Projects" value={progress.total_projects} />
        <Stat label="Completed" value={progress.completed_projects} />
        <Stat label="Tickets" value={progress.total_tickets} />
        <Stat label="Done" value={progress.completed_tickets} />
      </div>
    </div>
  )
}

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg border p-3 text-center" style={{ borderColor: 'var(--color-border)' }}>
    <div className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
      {value}
    </div>
    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
      {label}
    </div>
  </div>
)
