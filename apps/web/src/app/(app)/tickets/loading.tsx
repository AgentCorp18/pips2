import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

const TicketsLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading tickets"
    >
      {/* Header skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-20 rounded-[var(--radius-md)]" />
          <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-64 rounded-[var(--radius-md)]" />
        <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
        <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
        <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
      </div>

      {/* Table skeleton */}
      <div className="mt-4">
        <Card>
          <CardContent className="p-0">
            {/* Table header */}
            <div className="flex items-center gap-4 border-b border-[var(--color-border)] px-4 py-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-48 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            {/* Table rows */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-[var(--color-border)] px-4 py-3 last:border-b-0"
              >
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TicketsLoading
