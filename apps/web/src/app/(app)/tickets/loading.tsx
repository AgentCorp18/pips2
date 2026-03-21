import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export const TicketsLoading = () => {
  return (
    <div className="mx-auto max-w-full px-4" aria-busy="true" aria-label="Loading tickets">
      {/* Header — matches flex-col sm:flex-row layout */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="mt-1 h-4 w-24" />
        </div>
        <div className="flex items-center gap-3">
          {/* Export button */}
          <Skeleton className="h-9 w-20 rounded-[var(--radius-md)]" />
          {/* View toggle */}
          <Skeleton className="h-9 w-24 rounded-[var(--radius-md)]" />
          {/* New Ticket button */}
          <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
        </div>
      </div>

      {/* Quick filters row */}
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      {/* Search + filter dropdowns row */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-64 rounded-[var(--radius-md)]" />
        <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
        <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
        <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
        <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
      </div>

      {/* Advanced filter panel toggle */}
      <div className="mt-3">
        <Skeleton className="h-9 w-32 rounded-[var(--radius-md)]" />
      </div>

      {/* Table */}
      <div className="mt-4">
        <Card>
          <CardContent className="p-0">
            {/* Table header row */}
            <div className="flex items-center gap-4 border-b border-[var(--color-border)] px-4 py-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
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
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-[var(--radius-md)]" />
          <Skeleton className="h-8 w-20 rounded-[var(--radius-md)]" />
          <Skeleton className="h-8 w-8 rounded-[var(--radius-md)]" />
        </div>
      </div>
    </div>
  )
}

export default TicketsLoading
