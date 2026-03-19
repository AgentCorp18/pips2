import { Skeleton } from '@/components/ui/skeleton'

const TimelineLoading = () => {
  return (
    <div className="mx-auto max-w-full px-4" aria-busy="true" aria-label="Loading timeline">
      {/* Header skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-28" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
          <Skeleton className="h-9 w-20 rounded-[var(--radius-md)]" />
          <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
          <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
        </div>
      </div>

      {/* Step stripe */}
      <Skeleton className="mb-6 h-1 w-full rounded-full" />

      {/* Zoom toolbar */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-[var(--radius-md)]" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-8 w-8 rounded-[var(--radius-md)]" />
        </div>
        <Skeleton className="h-8 w-16 rounded-[var(--radius-md)]" />
      </div>

      {/* Chart skeleton */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
        {/* Header row */}
        <div className="flex border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
          <div className="w-[260px] border-r border-[var(--color-border)] px-3 py-3">
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex flex-1 items-end gap-8 px-4 py-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-12" />
            ))}
          </div>
        </div>

        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex border-b border-[var(--color-border)]"
            style={{ height: 40 }}
          >
            <div className="flex w-[260px] items-center gap-2 border-r border-[var(--color-border)] px-3">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex flex-1 items-center px-4">
              <Skeleton
                className="h-6 rounded-[var(--radius-sm)]"
                style={{ width: `${30 + ((i * 17) % 40)}%`, marginLeft: `${(i * 7) % 20}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TimelineLoading
