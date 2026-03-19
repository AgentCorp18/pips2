import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const ROIDashboardLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading ROI Dashboard"
    >
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="mb-3 h-4 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="mt-1 h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Correlation section */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-6 w-56" />
        {/* PIPS Advantage hero */}
        <Skeleton className="mb-4 h-28 w-full rounded-xl" />
        {/* Scatter plot */}
        <Card className="mb-4">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-60 w-full" />
          </CardContent>
        </Card>
        {/* Insight cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Top projects */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-6 w-44" />
        <Card>
          <CardContent className="p-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b px-6 py-4 last:border-0"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Skeleton className="h-4 w-5" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Trend chart */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-6 w-36" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ROIDashboardLoading
