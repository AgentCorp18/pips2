import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const ModuleDetailLoading = () => {
  return (
    <div
      className="mx-auto max-w-[var(--content-max-width)] space-y-6"
      aria-busy="true"
      aria-label="Loading training module"
      data-testid="loading-skeleton"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Module header */}
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
        <div className="mt-3 flex items-center gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      {/* Progress card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="mt-2 h-2 w-full rounded-full" />
        </CardContent>
      </Card>

      {/* Exercises list */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-28" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="mt-1 h-4 w-72" />
              </div>
              <Skeleton className="h-9 w-20 rounded-[var(--radius-md)]" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default ModuleDetailLoading
