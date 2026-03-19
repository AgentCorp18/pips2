import { Skeleton } from '@/components/ui/skeleton'

const ExecutiveSummaryLoading = () => {
  return (
    <div className="mx-auto max-w-4xl" aria-busy="true" aria-label="Loading Executive Summary">
      {/* Nav bar skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Header card */}
      <Skeleton className="mb-8 h-24 w-full rounded-xl" />

      {/* KPI cards */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-4 w-40" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Top projects */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-4 w-44" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Methodology insights */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-4 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Trend chart */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-4 w-52" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    </div>
  )
}

export default ExecutiveSummaryLoading
