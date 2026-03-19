import { Skeleton } from '@/components/ui/skeleton'

const CalendarLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading calendar"
    >
      {/* Header skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-28" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
          <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
          <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
        </div>
      </div>

      {/* Step stripe */}
      <Skeleton className="mb-6 h-1 w-full rounded-full" />

      {/* Month nav skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-[var(--radius-md)]" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-9 rounded-[var(--radius-md)]" />
        </div>
        <Skeleton className="h-9 w-16 rounded-[var(--radius-md)]" />
      </div>

      {/* Calendar grid skeleton */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
        {/* Day names */}
        <div className="grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="px-2 py-2 text-center">
              <Skeleton className="mx-auto h-4 w-8" />
            </div>
          ))}
        </div>
        {/* Grid cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[100px] border-b border-r border-[var(--color-border)] p-1.5"
            >
              <Skeleton className="mb-2 h-4 w-4 rounded-full" />
              {i % 3 === 0 && <Skeleton className="mb-0.5 h-3 w-full rounded" />}
              {i % 5 === 0 && <Skeleton className="h-3 w-3/4 rounded" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CalendarLoading
