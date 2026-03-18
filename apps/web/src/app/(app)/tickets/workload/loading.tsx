import { Skeleton } from '@/components/ui/skeleton'

const WorkloadLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading team workload"
    >
      {/* Header skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
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

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-8 w-12" />
          </div>
        ))}
      </div>

      {/* Workload chart skeleton */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
        <div className="flex items-center border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-4 py-2.5">
          <Skeleton className="h-3 w-24" />
          <div className="flex-1 px-4">
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-12" />
          <Skeleton className="ml-4 h-3 w-14" />
        </div>

        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center border-b border-[var(--color-border)] px-4 py-3"
          >
            <div className="flex w-[200px] items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <div className="flex-1 px-2">
              <Skeleton
                className="h-6 rounded-[var(--radius-sm)]"
                style={{ width: `${20 + ((i * 23) % 60)}%` }}
              />
            </div>
            <Skeleton className="h-4 w-8" />
            <Skeleton className="ml-4 h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default WorkloadLoading
