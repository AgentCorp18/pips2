import { Skeleton } from '@/components/ui/skeleton'

const ShareReportLoading = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      <div
        className="mx-auto max-w-4xl px-4 py-8"
        aria-busy="true"
        aria-label="Loading report"
      >
        {/* Report header card */}
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
            {Array.from({ length: 3 }).map((_, i) => (
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
      </div>
    </div>
  )
}

export default ShareReportLoading
