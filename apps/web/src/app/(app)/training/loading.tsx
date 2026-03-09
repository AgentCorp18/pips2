import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const TrainingLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)]"
      aria-busy="true"
      aria-label="Loading Training"
    >
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>

      {/* Progress summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Training path cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="mt-1 h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default TrainingLoading
