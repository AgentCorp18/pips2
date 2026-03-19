import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const SummaryLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading project summary"
    >
      <Skeleton className="mb-4 h-4 w-32" />
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-6 h-5 w-64" />

      <Skeleton className="mb-6 h-1 w-full rounded-full" />

      {/* Metadata card */}
      <Card className="mb-6">
        <CardContent className="grid gap-4 py-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </CardContent>
      </Card>

      {/* Step cards */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              <Skeleton className="h-16 w-full rounded-[var(--radius-md)]" />
              <Skeleton className="h-16 w-full rounded-[var(--radius-md)]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default SummaryLoading
