import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const ProjectsLoading = () => {
  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-[var(--radius-md)]" />
      </div>

      {/* Step stripe */}
      <Skeleton className="mb-6 h-1 w-full rounded-full" />

      {/* Project cards grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="mt-1 h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Step progress dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-3 w-3 rounded-full" />
                ))}
              </div>
              {/* Meta info */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ProjectsLoading
